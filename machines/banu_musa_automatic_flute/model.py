import math

def generate_svg():
    svg_content = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500">
    <rect width="500" height="500" fill="#fafafa"/>
    <text x="250" y="30" font-family="Arial" font-size="20" text-anchor="middle">Banū Mūsā's Automatic Flute Player</text>
    
    <!-- Pinned Drum -->
    <rect x="150" y="250" width="200" height="150" fill="#d2b48c" stroke="#8b4513" stroke-width="3"/>
    <text x="250" y="330" font-family="Arial" font-size="14" text-anchor="middle">Pinned Cylinder (Program)</text>
    
    <!-- Pins -->
    <rect x="180" y="240" width="10" height="10" fill="#000"/>
    <rect x="220" y="240" width="10" height="10" fill="#000"/>
    <rect x="280" y="240" width="10" height="10" fill="#000"/>
    
    <!-- Levers -->
    <line x1="185" y1="240" x2="185" y2="180" stroke="#333" stroke-width="4"/>
    <line x1="225" y1="240" x2="225" y2="180" stroke="#333" stroke-width="4"/>
    <line x1="285" y1="240" x2="285" y2="180" stroke="#333" stroke-width="4"/>
    
    <!-- Flute -->
    <rect x="120" y="160" width="260" height="20" fill="#fff" stroke="#000" stroke-width="2"/>
    <text x="250" y="150" font-family="Arial" font-size="12" text-anchor="middle">Flute</text>

    <!-- Air Supply -->
    <path d="M 50 170 Q 100 170 120 170" fill="none" stroke="#add8e6" stroke-width="10"/>
    <rect x="20" y="80" width="60" height="100" fill="#c0c0c0" stroke="#000" stroke-width="2"/>
    <text x="50" y="130" font-family="Arial" font-size="12" text-anchor="middle">Air</text>
</svg>"""
    with open("reconstruction.svg", "w", encoding="utf-8") as f:
        f.write(svg_content)

if __name__ == "__main__":
    generate_svg()
    print("Flute player schematic generated.")
