from mechanica.geometry import SVGCanvas, Circle, Line, Rectangle, Group
from mechanica.data_structures import QuipuString
import math

def generate_quipu_svg(values):
    canvas = SVGCanvas(width=1000, height=800)
    
    # Draw primary cord
    canvas.add(Line(50, 100, 950, 100, stroke="saddlebrown", stroke_width=10))
    
    for i, val in enumerate(values):
        x = 150 + i * 150
        # Draw pendant cord
        canvas.add(Line(x, 100, x, 750, stroke="burlywood", stroke_width=4))
        
        qs = QuipuString(val)
        
        # Power levels (positions down the string)
        # Power 0 (units) at bottom, Power 3 (thousands) at top
        max_power = max([k['power'] for k in qs.knots]) if qs.knots else 0
        
        for k in qs.knots:
            power = k['power']
            count = k['count']
            if count == 0: continue
            
            # Y position based on power level (higher power = closer to main cord)
            y_base = 700 - power * 150
            
            for j in range(count):
                y = y_base - j * 12
                # Draw knot
                canvas.add(Circle(cx=x, cy=y, r=8, stroke="peru", stroke_width=2, fill="tan"))
                
    return canvas.render()

if __name__ == "__main__":
    # Test values
    values = [402, 1034, 5, 230, 91]
    svg_out = generate_quipu_svg(values)
    with open("reconstruction.svg", "w") as f:
        f.write(svg_out)
