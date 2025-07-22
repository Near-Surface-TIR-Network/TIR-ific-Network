import os
import json
from PIL import Image
import numpy as np
import matplotlib.pyplot as plt

def save_tiff_as_image(tiff_path, output_path, colormap='inferno', dpi=300):
    with Image.open(tiff_path) as img:
        image_data = np.array(img)

    vmin = np.percentile(image_data, 2)
    vmax = np.percentile(image_data, 98)

    height, width = image_data.shape
    figsize = (width / dpi, height / dpi)

    fig = plt.figure(figsize=figsize, dpi=dpi)
    ax = plt.Axes(fig, [0, 0, 1, 1])
    fig.add_axes(ax)
    ax.imshow(image_data, cmap=colormap, interpolation='nearest', vmin=vmin, vmax=vmax)
    ax.axis('off')

    fig.savefig(output_path, dpi=dpi, format='png')
    plt.close(fig)

# Loop through live_sites
for file in os.listdir("live_sites"):
    if file.endswith(".json"):
        with open(f"live_sites/{file}") as f:
            data = json.load(f)

        site_id = data.get("siteID")
        tiff_path = data.get("tir_image_path")

        if site_id and tiff_path and os.path.exists(tiff_path):
            output_path = f"site-images/processed/{site_id}_TIR_preview.png"
            save_tiff_as_image(tiff_path, output_path)
