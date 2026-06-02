#!/usr/bin/env python3
"""
Personnalise la présentation Fleeti selon les infos client.
Usage: python3 personalize_pptx.py --output /tmp/output.pptx --client "Acme" --sector "BTP" --vehicles 120 --logo-url "https://..."
"""

import argparse
import copy
import io
import os
import sys
import urllib.request
from datetime import datetime
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN

TEMPLATE_PATH = os.path.join(os.path.dirname(__file__), '..', 'public', 'template.pptx')

SECTORS = {
    'transport': 'Transport & Logistique',
    'btp': 'BTP & Construction',
    'froid': 'Chaîne du froid & Agroalimentaire',
    'services': 'Entreprises & Services',
    'industrie': 'Industrie & Énergie',
}

# Shapes on slide 8 that contain sector titles
SECTOR_SHAPE_NAMES = {
    'transport': 'Text 6',
    'btp': 'Text 10',
    'froid': 'Text 14',
    'services': 'Text 18',
    'industrie': 'Text 22',
}

FLEETI_GREEN = RGBColor(0x1A, 0xB0, 0x8E)


def replace_text_in_shape(shape, old, new):
    """Replace text while preserving formatting of the first run."""
    if not shape.has_text_frame:
        return False
    changed = False
    for para in shape.text_frame.paragraphs:
        for run in para.runs:
            if old in run.text:
                run.text = run.text.replace(old, new)
                changed = True
    return changed


def replace_text_in_slide(slide, old, new):
    for shape in slide.shapes:
        replace_text_in_shape(shape, old, new)


def highlight_sector_shape(slide, sector_key):
    """Underline + color the sector title matching the client's sector."""
    target_name = SECTOR_SHAPE_NAMES.get(sector_key)
    if not target_name:
        return
    for shape in slide.shapes:
        if shape.name == target_name and shape.has_text_frame:
            for para in shape.text_frame.paragraphs:
                for run in para.runs:
                    run.font.color.rgb = FLEETI_GREEN
                    run.font.bold = True


def add_logo(slide, logo_url, prs_width, prs_height):
    """Download logo and add it to the top-right of the slide."""
    try:
        req = urllib.request.Request(logo_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as response:
            logo_data = response.read()
        logo_stream = io.BytesIO(logo_data)

        # Top-right corner: 2.5" wide, auto height, margin from right
        logo_width = Inches(2.2)
        logo_left = prs_width - logo_width - Inches(0.4)
        logo_top = Inches(0.3)
        slide.shapes.add_picture(logo_stream, logo_left, logo_top, width=logo_width)
        return True
    except Exception as e:
        print(f'Warning: could not add logo: {e}', file=sys.stderr)
        return False


def personalize(client_name, sector_key, vehicles, logo_url, sales_name, output_path):
    prs = Presentation(TEMPLATE_PATH)

    slide_width = prs.slide_width
    slide_height = prs.slide_height

    # --- Slide 1: Cover ---
    slide1 = prs.slides[0]

    # Replace title
    replace_text_in_slide(slide1, 'PRÉSENTATION GÉNÉRALISTE', f'PRÉSENTATION — {client_name.upper()}')

    # Replace date with current month/year
    month_fr = ['Janvier','Février','Mars','Avril','Mai','Juin',
                 'Juillet','Août','Septembre','Octobre','Novembre','Décembre']
    now = datetime.now()
    date_str = f'{month_fr[now.month-1]} {now.year}'
    replace_text_in_slide(slide1, 'Mai 2026', date_str)

    # Replace vehicle count
    if vehicles and vehicles > 0:
        replace_text_in_slide(slide1, 'LIVE · 247 véhicules', f'LIVE · {vehicles} véhicules')

    # Add client logo
    if logo_url:
        add_logo(slide1, logo_url, slide_width, slide_height)

    # --- Slides 2-10: Replace footer "présentation généraliste" ---
    footer_old = 'Fleeti · présentation généraliste'
    footer_new = f'Fleeti · présentation pour {client_name}'
    for slide in prs.slides:
        replace_text_in_slide(slide, footer_old, footer_new)

    # --- Slide 8: Highlight sector ---
    if sector_key:
        slide8 = prs.slides[7]
        highlight_sector_shape(slide8, sector_key)

    # --- Slide 11: Contact — add sales name ---
    slide11 = prs.slides[10]
    if sales_name:
        replace_text_in_slide(slide11, '+33 7 49 95 32 93', f'+33 7 49 95 32 93\n{sales_name}')

    prs.save(output_path)
    print(f'Saved: {output_path}')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--client', required=True)
    parser.add_argument('--sector', default='')
    parser.add_argument('--vehicles', type=int, default=0)
    parser.add_argument('--logo-url', default='')
    parser.add_argument('--sales', default='')
    parser.add_argument('--output', required=True)
    args = parser.parse_args()

    personalize(
        client_name=args.client,
        sector_key=args.sector,
        vehicles=args.vehicles,
        logo_url=args.logo_url,
        sales_name=args.sales,
        output_path=args.output,
    )


if __name__ == '__main__':
    main()
