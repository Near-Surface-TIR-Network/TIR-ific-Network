import os
from PIL import Image
import numpy as np
import matplotlib.pyplot as plt

def save_tiff_as_image(tiff_path, output_path, colormap='inferno', dpi=300):
    """
    Save a TIFF image as a high-quality PNG without axes, borders, or colorbar.

    Parameters:
    tiff_path (str): Path to the TIFF image.
    output_path (str): Path to save the output PNG.
    colormap (str): Matplotlib colormap to apply.
    dpi (int): Dots per inch for saved image.
    """
    # Load TIFF and convert to NumPy
    with Image.open(tiff_path) as img:
        image_data = np.array(img)

    # Stretch contrast using percentiles
    vmin = np.percentile(image_data, 2)
    vmax = np.percentile(image_data, 98)

    # Calculate size in inches based on image pixel dimensions and DPI
    height, width = image_data.shape
    figsize = (width / dpi, height / dpi)

    # Create figure matching image size
    fig = plt.figure(figsize=figsize, dpi=dpi)
    ax = plt.Axes(fig, [0, 0, 1, 1])  # fill entire figure
    fig.add_axes(ax)
    ax.imshow(image_data, cmap=colormap, interpolation='nearest', vmin=vmin, vmax=vmax)
    ax.axis('off')

    # Save image
    fig.savefig(output_path, dpi=dpi, format='png')
    plt.close(fig)

for filename in os.listdir("live_sites"):
    if filename.endswith(".json"):
        with open(f"live_sites/{filename}") as f:
            site_data = json.load(f)

        tiff_path = site_data["tir_image_path"]
        site_id = site_data["siteID"]
        output_path = f"site-images/processed/{site_id}_TIR_preview.png"
        save_tiff_as_image(tiff_path, output_path)
