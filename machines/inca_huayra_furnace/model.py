from mechanica.geometry import SVGCanvas, Line, Circle, Rectangle
from mechanica.thermodynamics import calculate_draft_pressure, calculate_venturi_pressure_drop

def generate_svg() -> str:
    """
    Generates a 2D SVG reconstruction of an Inca Huayra wind furnace.
    """
    canvas = SVGCanvas(width=600, height=600)
    
    # Base platform
    canvas.add(Rectangle(150, 450, 300, 20, fill="gray", stroke="black", stroke_width=2))
    
    # Furnace walls (conical shape approximation using thick lines)
    # Left wall
    canvas.add(Line(200, 450, 250, 150, stroke="saddlebrown", stroke_width=10))
    # Right wall
    canvas.add(Line(400, 450, 350, 150, stroke="saddlebrown", stroke_width=10))
    # Top rim
    canvas.add(Line(245, 150, 355, 150, stroke="saddlebrown", stroke_width=8))
    
    # Air intake holes (Venturi effect entry points)
    for y in [400, 330, 260, 190]:
        canvas.add(Circle(225 + (450-y)/6, y, 8, fill="black"))
        canvas.add(Circle(375 - (450-y)/6, y, 8, fill="black"))
        
    # Ore/Charcoal bed inside
    canvas.add(Circle(300, 400, 30, fill="orange", stroke="red"))
    canvas.add(Circle(280, 420, 25, fill="red", stroke="orange"))
    canvas.add(Circle(320, 420, 25, fill="red", stroke="orange"))
    
    # Wind arrows (Ambient wind)
    # Left side wind
    for y in [390, 320, 250, 180]:
        canvas.add(Line(50, y, 180, y, stroke="blue", stroke_width=3))
        canvas.add(Line(160, y-10, 180, y, stroke="blue", stroke_width=3))
        canvas.add(Line(160, y+10, 180, y, stroke="blue", stroke_width=3))
        
    # Venturi and draft arrows (internal upward draft)
    # Wind entering holes and turning upwards
    canvas.add(Line(250, 350, 300, 250, stroke="red", stroke_width=4))
    canvas.add(Line(280, 260, 300, 250, stroke="red", stroke_width=4))
    canvas.add(Line(310, 260, 300, 250, stroke="red", stroke_width=4))

    canvas.add(Line(300, 250, 300, 100, stroke="red", stroke_width=4))
    canvas.add(Line(280, 120, 300, 100, stroke="red", stroke_width=4))
    canvas.add(Line(320, 120, 300, 100, stroke="red", stroke_width=4))
    
    # Perform some thermodynamic calculations to demonstrate physics
    draft = calculate_draft_pressure(1.5, 1200, 280)
    venturi = calculate_venturi_pressure_drop(10.0, 0.05, 0.01)
    
    print(f"Calculated natural draft: {draft:.2f} Pa")
    print(f"Calculated Venturi pressure drop: {venturi:.2f} Pa")
    
    return canvas.render()

if __name__ == "__main__":
    svg_out = generate_svg()
    with open("reconstruction.svg", "w") as f:
        f.write(svg_out)
