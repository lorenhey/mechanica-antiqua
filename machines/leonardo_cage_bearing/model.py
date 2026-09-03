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
    canvas = SVGCanvas(800, 800)
    
    # Outer ring (DOCUMENTED)
    cx, cy = 400, 400
    outer_radius = 200
    inner_radius = 120
    canvas.add(Circle(cx, cy, outer_radius))
    canvas.add(Circle(cx, cy, inner_radius))
    
    # Balls and cages (INFERRED spacing)
    num_balls = 8
    ball_radius = 30
    pitch_radius = (outer_radius + inner_radius) / 2
    
    for i in range(num_balls):
        angle = i * (2 * math.pi / num_balls)
        bx = cx + pitch_radius * math.cos(angle)
        by = cy + pitch_radius * math.sin(angle)
        
        # Draw ball
        canvas.add(Circle(bx, by, ball_radius))
        
        # Draw cage separators (ASSUMED geometry)
        sep_angle = angle + (math.pi / num_balls)
        sx1 = cx + (inner_radius + 5) * math.cos(sep_angle)
        sy1 = cy + (inner_radius + 5) * math.sin(sep_angle)
        sx2 = cx + (outer_radius - 5) * math.cos(sep_angle)
        sy2 = cy + (outer_radius - 5) * math.sin(sep_angle)
        canvas.add(Line(sx1, sy1, sx2, sy2))

    svg_content = canvas.render()
    with open(os.path.join(os.path.dirname(__file__), 'reconstruction.svg'), 'w') as f:
        f.write(svg_content)
        
    print("Leonardo Cage Bearing model generated.")

if __name__ == '__main__':
    build_model()
