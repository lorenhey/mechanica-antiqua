import os
import sys

# Add the project root to sys.path so we can import mechanica
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from mechanica.geometry import SVGCanvas, Line, Rectangle, Group
from mechanica.statics import catenary_curve, catenary_tension
from mechanica.materials import ICHU_GRASS_ROPE

def generate_bridge_svg():
    span = 28.0 # meters (approximate span of Q'eswachaka)
    handrail_sag = 3.0 # meters
    walkway_sag = 3.5 # meters
    
    # Let's calculate tension just to log it or use it
    # Suppose linear density of a main cable is 15 kg/m
    density = 15.0
    max_tension = catenary_tension(span, handrail_sag, density)
    print(f"Max tension in handrail cable: {max_tension:.2f} N")
    
    canvas_width = 800
    canvas_height = 400
    
    # Scale from meters to pixels.
    # Span is 28m. Let's make it take 600 pixels.
    scale = 600 / span
    
    canvas = SVGCanvas(width=canvas_width, height=canvas_height)
    
    # Center the bridge in the canvas
    cx = canvas_width / 2
    cy = 150 # Y position of the anchors
    
    # Draw abutments (rocks/stone anchors)
    anchor_width = 60
    anchor_height = 100
    left_anchor = Rectangle(cx - span/2 * scale - anchor_width, cy, anchor_width, anchor_height, fill='grey', stroke='black')
    right_anchor = Rectangle(cx + span/2 * scale, cy, anchor_width, anchor_height, fill='grey', stroke='black')
    canvas.add(left_anchor)
    canvas.add(right_anchor)
    
    # Generate catenary curves for handrails and walkway
    x_handrail, y_handrail = catenary_curve(span, handrail_sag, points=50)
    x_walkway, y_walkway = catenary_curve(span, walkway_sag, points=50)
    
    # Draw handrail cables (thick lines)
    for i in range(len(x_handrail) - 1):
        x1 = cx + x_handrail[i] * scale
        y1 = cy + y_handrail[i] * scale
        x2 = cx + x_handrail[i+1] * scale
        y2 = cy + y_handrail[i+1] * scale
        canvas.add(Line(x1, y1, x2, y2, stroke='saddlebrown', stroke_width=4))
        
    # Draw walkway cables
    for i in range(len(x_walkway) - 1):
        x1 = cx + x_walkway[i] * scale
        y1 = cy + y_walkway[i] * scale
        x2 = cx + x_walkway[i+1] * scale
        y2 = cy + y_walkway[i+1] * scale
        canvas.add(Line(x1, y1, x2, y2, stroke='saddlebrown', stroke_width=6))
        
    # Draw vertical suspenders and cross-ties
    for i in range(0, len(x_handrail), 2):
        hx = cx + x_handrail[i] * scale
        hy = cy + y_handrail[i] * scale
        wx = cx + x_walkway[i] * scale
        wy = cy + y_walkway[i] * scale
        canvas.add(Line(hx, hy, wx, wy, stroke='peru', stroke_width=1))
        
    # Draw water / river below
    river_y = cy + (walkway_sag + 4) * scale
    canvas.add(Rectangle(0, river_y, canvas_width, canvas_height - river_y, fill='lightblue', stroke='none'))
    
    svg_str = canvas.render()
    return svg_str

if __name__ == "__main__":
    svg_out = generate_bridge_svg()
    out_path = os.path.join(os.path.dirname(__file__), "reconstruction.svg")
    with open(out_path, "w") as f:
        f.write(svg_out)
    print(f"Saved SVG to {out_path}")
