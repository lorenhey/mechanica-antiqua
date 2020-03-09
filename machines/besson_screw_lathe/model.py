import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

def calculate_kinematics():
    # DOCUMENTED: pitch
    lead_screw_pitch = 0.5 # inches per revolution
    # INFERRED: gear ratio
    gear_ratio = 2.0
    
    # RECONSTRUCTED: feed rate
    feed_rate = lead_screw_pitch * gear_ratio
    return feed_rate

def generate_svg():
    svg_content = """<svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
    <rect x="50" y="100" width="200" height="20" stroke="black" stroke-width="2" fill="silver" />
    <polygon points="250,90 270,110 250,130" fill="gray" />
    <text x="80" y="250" font-family="sans-serif" font-size="14">Besson Screw Lathe</text>
</svg>"""
    with open(os.path.join(os.path.dirname(__file__), 'reconstruction.svg'), 'w') as f:
        f.write(svg_content)

if __name__ == "__main__":
    feed = calculate_kinematics()
    generate_svg()
    print(f"Generated SVG. Feed rate: {feed} inches/rev")
