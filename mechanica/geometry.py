import math
import numpy as np
import matplotlib.pyplot as plt
import io

class SVGCanvas:
    def __init__(self, width=800, height=600):
        self.elements = []
        self.width = width
        self.height = height

    def add(self, element):
        self.elements.append(element)

    def render(self):
        svg = f'<svg viewBox="0 0 {self.width} {self.height}" xmlns="http://www.w3.org/2000/svg">\n'
        for el in self.elements:
            svg += el.render() + '\n'
        svg += '</svg>'
        return svg

class Circle:
    def __init__(self, cx, cy, r, stroke="black", stroke_width=2, fill="none"):
        self.cx = cx
        self.cy = cy
        self.r = r
        self.stroke = stroke
        self.stroke_width = stroke_width
        self.fill = fill

    def render(self):
        return f'<circle cx="{self.cx}" cy="{self.cy}" r="{self.r}" stroke="{self.stroke}" stroke-width="{self.stroke_width}" fill="{self.fill}" />'

class Line:
    def __init__(self, x1, y1, x2, y2, stroke="black", stroke_width=2):
        self.x1 = x1
        self.y1 = y1
        self.x2 = x2
        self.y2 = y2
        self.stroke = stroke
        self.stroke_width = stroke_width

    def render(self):
        return f'<line x1="{self.x1}" y1="{self.y1}" x2="{self.x2}" y2="{self.y2}" stroke="{self.stroke}" stroke-width="{self.stroke_width}" />'

def generate_svg_epicyclic(r_sun: float, r_planet: float, r_ring: float, angle_sun: float) -> str:
    """
    Genera un SVG simple en crudo para un tren epicicloidal.
    (Simplificado para la primera iteración, utilizando matplotlib -> SVG string)
    """
    fig, ax = plt.subplots(figsize=(6,6))
    ax.set_aspect('equal')
    ax.axis('off')
    
    # Dibujar sol
    sun_circle = plt.Circle((0, 0), r_sun, color='goldenrod', fill=False, linewidth=2)
    ax.add_patch(sun_circle)
    # Marca del sol
    ax.plot([0, r_sun * math.cos(angle_sun)], [0, r_sun * math.sin(angle_sun)], 'k-')
    
    # Dibujar anillo
    ring_circle = plt.Circle((0, 0), r_ring, color='saddlebrown', fill=False, linewidth=4)
    ax.add_patch(ring_circle)
    
    # Cinemática: 
    # El sol se mueve angle_sun. El carrier se mueve según la relación.
    ratio = r_sun / (r_sun + r_ring)
    angle_carrier = angle_sun * ratio
    
    # La posición de 4 planetas
    for i in range(4):
        base_angle = angle_carrier + (i * math.pi / 2)
        px = (r_sun + r_planet) * math.cos(base_angle)
        py = (r_sun + r_planet) * math.sin(base_angle)
        
        planet_circle = plt.Circle((px, py), r_planet, color='steelblue', fill=False, linewidth=2)
        ax.add_patch(planet_circle)
        
        # Rotación del planeta respecto a sí mismo.
        # ω_planet = ω_carrier + (ω_sun - ω_carrier) * (R_sun / R_planet)
        # Asumimos que angle_planet es integrado. Para simplificar, trazamos la cruz del porta-satélites.
        ax.plot([0, px], [0, py], 'k--', alpha=0.3)
    
    # Guardar a SVG string
    buf = io.StringIO()
    plt.savefig(buf, format='svg', bbox_inches='tight', transparent=True)
    plt.close(fig)
    return buf.getvalue()

def generate_archimedes_screw_2d(incline_deg: float, radius: float, pitch: float, length: float) -> str:
    """
    Genera una representación 2D esquemática de un tornillo de Arquímedes.
    """
    fig, ax = plt.subplots(figsize=(8,4))
    ax.set_aspect('equal')
    ax.axis('off')
    
    # Cilindro exterior
    ax.plot([0, length], [radius, radius], 'k-', lw=1)
    ax.plot([0, length], [-radius, -radius], 'k-', lw=1)
    
    # Hélices proyectadas (ondas senoidales desfasadas para dar impresión 3D)
    x = np.linspace(0, length, 1000)
    omega = 2 * math.pi / pitch
    y_front = radius * np.sin(omega * x)
    y_back = radius * np.sin(omega * x + math.pi)
    
    ax.plot(x, y_front, 'b-', lw=1.5, alpha=0.8)
    ax.plot(x, y_back, 'b--', lw=0.8, alpha=0.4)
    
    # Inclinación: aplicamos rotación a los artistas
    # Para SVG, lo exportamos recto y aplicamos transform=rotate(incline_deg) en CSS/HTML
    buf = io.StringIO()
    plt.savefig(buf, format='svg', bbox_inches='tight', transparent=True)
    plt.close(fig)
    return buf.getvalue()

class Rectangle:
    def __init__(self, x, y, width, height, fill='none', stroke='black', stroke_width=1):
        self.x = x
        self.y = y
        self.width = width
        self.height = height
        self.fill = fill
        self.stroke = stroke
        self.stroke_width = stroke_width

    def render(self):
        return f'<rect x="{self.x}" y="{self.y}" width="{self.width}" height="{self.height}" fill="{self.fill}" stroke="{self.stroke}" stroke-width="{self.stroke_width}" />'

class Group:
    def __init__(self, elements):
        self.elements = elements

    def render(self):
        inner = ' '.join([el.render() for el in self.elements])
        return f'<g>{inner}</g>'

