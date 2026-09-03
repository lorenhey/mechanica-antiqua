import sys
import os
import math

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
    
    # Water wheel (DOCUMENTED)
    wx, wy = 200, 400
    w_radius = 100
    canvas.add(Circle(wx, wy, w_radius))
    # Paddles
    for i in range(8):
        angle = i * (math.pi / 4)
        x1 = wx + (w_radius - 20) * math.cos(angle)
        y1 = wy + (w_radius - 20) * math.sin(angle)
        x2 = wx + (w_radius + 20) * math.cos(angle)
        y2 = wy + (w_radius + 20) * math.sin(angle)
        canvas.add(Line(x1, y1, x2, y2))
        
    # Crank on the wheel axis (INFERRED)
    cx, cy = wx, wy
    crank_radius = 40
    canvas.add(Circle(cx, cy, crank_radius))
    crank_pin_x = cx + crank_radius * math.cos(math.pi/4)
    crank_pin_y = cy + crank_radius * math.sin(math.pi/4)
    
    # Connecting rod
    saw_x, saw_y = 400, 250
    canvas.add(Line(crank_pin_x, crank_pin_y, saw_x, saw_y))
    
    # Saw blade (RECONSTRUCTED)
    canvas.add(Line(saw_x, saw_y - 100, saw_x, saw_y + 100))
    # Saw teeth
    for i in range(-90, 100, 20):
        canvas.add(Line(saw_x, saw_y + i, saw_x - 10, saw_y + i + 10))
        canvas.add(Line(saw_x - 10, saw_y + i + 10, saw_x, saw_y + i + 20))
        
    # Log (ASSUMED)
    canvas.add(Rectangle(380, 250, 200, 50))

    svg_content = canvas.render()
    with open(os.path.join(os.path.dirname(__file__), 'reconstruction.svg'), 'w') as f:
        f.write(svg_content)
        
    print("Martini Hydraulic Sawmill model generated.")

if __name__ == '__main__':
    build_model()
