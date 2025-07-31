# A script for converting pz.icons29.svg
# to nicely formatted individual svg files
#
# this should never be needed ever again but
# it was only designed to work in project root
# so here it stays i guess
#
# 100% vibecoded by GPT-4o
# (it would have taken me hours to implement
# this one time script myself so i don't care)
# also it's 3 am right now YAY
#
# - blulere 2025-07-31

import os
import xml.etree.ElementTree as ET

# File path for the SVG file
input_svg_path = "pz.icons29.svg"
output_dir = "assets/icons"

# Ensure output directory exists
os.makedirs(output_dir, exist_ok=True)

# Parse the SVG file
tree = ET.parse(input_svg_path)
root = tree.getroot()

# Namespace mapping
ns = {
    'svg': 'http://www.w3.org/2000/svg'
}

# Iterate over each <symbol> element
for symbol in root.findall('svg:symbol', ns):
    symbol_id = symbol.get('id')
    if not symbol_id:
        continue

    # Create a new SVG root element
    new_svg = ET.Element('svg', {
        'xmlns': 'http://www.w3.org/2000/svg',
        'xmlns:xlink': 'http://www.w3.org/1999/xlink'
    })

    # Append the symbol's children to the new SVG
    for elem in list(symbol):
        new_svg.append(elem)

    # Set attributes like viewBox if present
    if 'viewBox' in symbol.attrib:
        new_svg.set('viewBox', symbol.attrib['viewBox'])

    # Output file path
    output_path = os.path.join(output_dir, f"{symbol_id}.svg")

    # Write the new SVG to file
    ET.ElementTree(new_svg).write(output_path, encoding='utf-8', xml_declaration=True)

print("SVG symbols extracted successfully.")

# 3 in the mornin ,,