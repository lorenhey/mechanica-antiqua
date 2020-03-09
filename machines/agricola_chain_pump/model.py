import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from mechanica.geometry import SVGCanvas, Circle, Line

def build_model():
    canvas = SVGCanvas(800, 600)
    
    # Upper wheel
    upper_wheel = Circle(400, 150, 60)
    canvas.add(upper_wheel)
    
    # Lower wheel
    lower_wheel = Circle(400, 450, 60)
    canvas.add(lower_wheel)
    
    # Chain lines
    chain_left = Line(340, 150, 340, 450)
    chain_right = Line(460, 150, 460, 450)
    canvas.add(chain_left)
    canvas.add(chain_right)
    
    # Draw a few buckets/dippers
    for y in range(150, 450, 50):
        canvas.add(Circle(340, y, 10))
        canvas.add(Circle(460, y+25, 10))

    svg_content = canvas.render()
    
    with open(os.path.join(os.path.dirname(__file__), 'reconstruction.svg'), 'w') as f:
        f.write(svg_content)
        
    print("Chain pump model generated.")
    
if __name__ == '__main__':
    build_model()
