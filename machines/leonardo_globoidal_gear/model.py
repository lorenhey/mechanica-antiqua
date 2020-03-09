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
    
    # Gear wheel (DOCUMENTED)
    gear_center_x, gear_center_y = 400, 400
    gear_radius = 150
    canvas.add(Circle(gear_center_x, gear_center_y, gear_radius))
    
    # Teeth (INFERRED dimensions based on globoidal shape)
    num_teeth = 24
    for i in range(num_teeth):
        angle = i * (2 * math.pi / num_teeth)
        x1 = gear_center_x + (gear_radius - 10) * math.cos(angle)
        y1 = gear_center_y + (gear_radius - 10) * math.sin(angle)
        x2 = gear_center_x + (gear_radius + 15) * math.cos(angle)
        y2 = gear_center_y + (gear_radius + 15) * math.sin(angle)
        canvas.add(Line(x1, y1, x2, y2))
        
    # Globoidal worm (RECONSTRUCTED)
    # Drawing an arc to represent the curved profile matching the gear
    worm_center_y = 235
    canvas.add(Line(300, worm_center_y - 20, 500, worm_center_y - 20))
    canvas.add(Line(300, worm_center_y + 20, 500, worm_center_y + 20))
    
    # Threads on worm (ASSUMED 5 visible threads)
    for i in range(5):
        x = 350 + i * 25
        # slightly curved threads
        canvas.add(Line(x - 5, worm_center_y - 20, x + 5, worm_center_y + 20))

    svg_content = canvas.render()
    with open(os.path.join(os.path.dirname(__file__), 'reconstruction.svg'), 'w') as f:
        f.write(svg_content)
        
    print("Leonardo Globoidal Gear model generated.")

if __name__ == '__main__':
    build_model()
