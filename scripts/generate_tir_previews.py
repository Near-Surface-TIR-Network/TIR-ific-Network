import os
import json
from PIL import Image
import numpy as np
import matplotlib.pyplot as plt

LIVE_SITES_DIR = 'live_sites'
PROCESSED_DIR = 'site-images/processed'

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

# Loop through all .json files in live_sites
for filename in os.listdir(LIVE_SITES_DIR):
    if not filename.endswith('.json') or filename == 'index.json':
        continue

    json_path = os.path.join(LIVE_SITES_DIR, filename)
    print(f"Processing {json_path}")

    try:
        with open(json_path, 'r') as f:
            data = json.load(f)
    except json.JSONDecodeError:
        print(f"⚠️ Skipping malformed or empty JSON: {json_path}")
        continue

    site_id = data.get('siteID', 'unknown')
    tir_path = data.get('tir_image_path')

    if not tir_path or not os.path.exists(tir_path):
        print(f"⚠️ No valid TIR image found for site {site_id}, skipping.")
        continue

    output_filename = f"{site_id}_tir_preview.png"
    output_path = os.path.join(PROCESSED_DIR, output_filename)

    try:
        save_tiff_as_image(tir_path, output_path)
        print(f"✅ Saved TIR preview for {site_id} at {output_path}")
    except Exception as e:
        print(f"❌ Failed to generate preview for {site_id}: {e}")

