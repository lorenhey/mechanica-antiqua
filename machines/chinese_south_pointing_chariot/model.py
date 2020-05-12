import math
import sys
import os

# Add mechanica to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))
from mechanica.kinematics import differential_gear_speed

def calculate_pointer_angle(chassis_angle: float, wheel_radius: float, track_width: float, distance_travelled: float) -> float:
    """
    Simulates the pointer angle.
    If the chariot turns by an angle theta, the outer wheel travels track_width * theta more than the inner wheel.
    The differential mechanism perfectly compensates this.
    """
    # Assuming perfect differential compensation
    return 0.0 # Points in the original direction relative to global frame

def generate_svg():
    svg_content = """<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
  <!-- South-pointing chariot reconstruction -->
  <rect x="150" y="100" width="100" height="200" fill="#d2b48c" stroke="black"/>
  <!-- Wheels -->
  <rect x="130" y="150" width="20" height="100" fill="gray" stroke="black"/>
  <rect x="250" y="150" width="20" height="100" fill="gray" stroke="black"/>
  <!-- Pointer -->
  <line x1="200" y1="200" x2="200" y2="50" stroke="red" stroke-width="5" marker-end="url(#arrow)"/>
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="red"/>
    </marker>
  </defs>
</svg>"""
    with open(os.path.join(os.path.dirname(__file__), "reconstruction.svg"), "w") as f:
        f.write(svg_content)

if __name__ == "__main__":
    generate_svg()
    print("Generated reconstruction.svg")
