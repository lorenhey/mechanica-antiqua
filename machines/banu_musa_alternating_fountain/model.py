import math

def generate_svg():
    svg_content = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500">
    <rect width="400" height="500" fill="#f4f4f4"/>
    <text x="200" y="30" font-family="Arial" font-size="18" text-anchor="middle">Banū Mūsā's Alternating Fountain</text>
    
    <!-- Top Basin -->
    <path d="M 150 100 L 250 100 L 250 150 L 150 150 Z" fill="#add8e6" stroke="#333" stroke-width="2"/>
    <text x="200" y="130" font-family="Arial" font-size="12" text-anchor="middle">Reservoir</text>
    
    <!-- Feed Pipe -->
    <rect x="195" y="150" width="10" height="50" fill="#aaa" stroke="#333"/>
    
    <!-- Tipping Balance Beam (Seesaw) -->
    <path d="M 100 220 L 300 200 L 300 240 L 100 260 Z" fill="#8b4513" stroke="#000" stroke-width="2" transform="rotate(10 200 230)"/>
    <circle cx="200" cy="230" r="5" fill="#000"/>
    
    <!-- Two Pipes -->
    <rect x="120" y="280" width="20" height="150" fill="#ccc" stroke="#000"/>
    <text x="130" y="360" font-family="Arial" font-size="12" text-anchor="middle" transform="rotate(-90 130 360)">Pipe A (Shield)</text>
    
    <rect x="260" y="280" width="20" height="150" fill="#ccc" stroke="#000"/>
    <text x="270" y="360" font-family="Arial" font-size="12" text-anchor="middle" transform="rotate(-90 270 360)">Pipe B (Jet)</text>
    
    <!-- Water Jets out -->
    <path d="M 130 430 Q 100 480 80 480 Q 180 480 130 430" fill="#add8e6"/> <!-- Shield spray -->
    <rect x="265" y="430" width="10" height="60" fill="#add8e6"/> <!-- Straight jet -->
</svg>"""
    with open("reconstruction.svg", "w", encoding="utf-8") as f:
        f.write(svg_content)

if __name__ == "__main__":
    generate_svg()
    print("Alternating fountain model generated.")
