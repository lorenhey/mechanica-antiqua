from mechanica.geometry import SVGCanvas, Circle, Line

class Rectangle:
    def __init__(self, x, y, width, height, stroke="black", stroke_width=2, fill="none"):
        self.x = x
        self.y = y
        self.width = width
        self.height = height
        self.stroke = stroke
        self.stroke_width = stroke_width
        self.fill = fill

    def render(self):
        return f'<rect x="{self.x}" y="{self.y}" width="{self.width}" height="{self.height}" stroke="{self.stroke}" stroke-width="{self.stroke_width}" fill="{self.fill}" />'

class Group:
    def __init__(self, children=None):
        self.children = children or []

    def render(self):
        content = "\n".join([c.render() for c in self.children])
        return f'<g>\n{content}\n</g>'
