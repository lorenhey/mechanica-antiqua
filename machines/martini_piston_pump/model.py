import sys
import os

import math

class SVGCanvas:
    def __init__(self, w, h):
        self.w = w
        self.h = h
        self.shapes = []
    def add(self, shape):
        self.shapes.append(shape)
    def render(self):
        svg = f'<svg width="{self.w}" height="{self.h}" xmlns="http://www.w3.org/2000/svg">\n'
        for s in self.shapes:
            svg += s.render() + '\n'
        svg += '</svg>'
        return svg

class Circle:
    def __init__(self, cx, cy, r):
        self.cx = cx; self.cy = cy; self.r = r
    def render(self):
        return f'<circle cx="{self.cx}" cy="{self.cy}" r="{self.r}" stroke="black" stroke-width="2" fill="none" />'

class Line:
    def __init__(self, x1, y1, x2, y2):
        self.x1 = x1; self.y1 = y1; self.x2 = x2; self.y2 = y2
    def render(self):
        return f'<line x1="{self.x1}" y1="{self.y1}" x2="{self.x2}" y2="{self.y2}" stroke="black" stroke-width="2" />'

class Rectangle:
    def __init__(self, x, y, w, h):
        self.x = x; self.y = y; self.w = w; self.h = h
    def render(self):
        return f'<rect x="{self.x}" y="{self.y}" width="{self.w}" height="{self.h}" stroke="black" stroke-width="2" fill="none" />'

def build_model():
    canvas = SVGCanvas(800, 600)
    
    # Cylinder (DOCUMENTED)
    canvas.add(Rectangle(350, 300, 100, 200))
    
    # Piston (INFERRED dimensions)
    canvas.add(Rectangle(355, 400, 90, 20))
    
    # Piston rod
    canvas.add(Line(400, 400, 400, 200))
    
    # Crank wheel (RECONSTRUCTED)
    canvas.add(Circle(400, 150, 50))
    # Crank pin connecting rod to wheel
    canvas.add(Line(400, 200, 400, 100))
    
    # Pipe / nozzle
    canvas.add(Line(450, 450, 550, 450))
    canvas.add(Line(450, 470, 550, 470))

    svg_content = canvas.render()
    with open(os.path.join(os.path.dirname(__file__), 'reconstruction.svg'), 'w') as f:
        f.write(svg_content)
        
    print("Martini Piston Pump model generated.")

if __name__ == '__main__':
    build_model()
