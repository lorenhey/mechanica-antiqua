import os
import sys
import math

# Add the project root to the path so we can import mechanica
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from mechanica.geometry import SVGCanvas, Line, Circle, Group
from mechanica.kinematics import third_class_lever_velocity

def generate_atlatl_svg():
    canvas = SVGCanvas(width=800, height=400)
    
    # Ground or base reference (optional)
    # Human arm representation (simplified)
    shoulder_x, shoulder_y = 150, 300
    elbow_x, elbow_y = 200, 200
    hand_x, hand_y = 300, 150
    
    arm_group = Group([
        Line(shoulder_x, shoulder_y, elbow_x, elbow_y, stroke="brown", stroke_width=6),
        Line(elbow_x, elbow_y, hand_x, hand_y, stroke="brown", stroke_width=6),
        Circle(shoulder_x, shoulder_y, 8, fill="brown"),
        Circle(elbow_x, elbow_y, 6, fill="brown"),
        Circle(hand_x, hand_y, 6, fill="brown")
    ])
    canvas.add(arm_group)
    
    # Atlatl
    atlatl_length = 150
    # Angle of atlatl
    atlatl_angle = -math.pi / 6 # 30 degrees up
    hook_x = hand_x + atlatl_length * math.cos(atlatl_angle)
    hook_y = hand_y + atlatl_length * math.sin(atlatl_angle)
    
    atlatl_group = Group([
        Line(hand_x, hand_y, hook_x, hook_y, stroke="saddlebrown", stroke_width=4),
        # Hook
        Line(hook_x, hook_y, hook_x - 10, hook_y - 15, stroke="saddlebrown", stroke_width=4)
    ])
    canvas.add(atlatl_group)
    
    # Dart (flexed)
    dart_start_x, dart_start_y = hook_x - 10, hook_y - 15
    dart_end_x, dart_end_y = hand_x + 200, hand_y - 50
    
    # We draw the dart as a line, optionally curved
    # For a simple representation, a straight line
    dart_group = Group([
        Line(dart_start_x, dart_start_y, dart_end_x, dart_end_y, stroke="gray", stroke_width=3),
        # Arrowhead
        Line(dart_end_x, dart_end_y, dart_end_x - 15, dart_end_y - 5, stroke="darkgray", stroke_width=3),
        Line(dart_end_x, dart_end_y, dart_end_x - 15, dart_end_y + 10, stroke="darkgray", stroke_width=3),
    ])
    canvas.add(dart_group)

    # Motion arc
    arc_radius = math.hypot(hook_x - shoulder_x, hook_y - shoulder_y)
    canvas.add(Circle(shoulder_x, shoulder_y, arc_radius, stroke="blue", stroke_width=1, fill="none"))

    # Adding text/labels via simple lines isn't directly supported by Canvas without Text class, 
    # but we will just output the SVG.
    return canvas.render()

if __name__ == "__main__":
    svg_content = generate_atlatl_svg()
    output_path = os.path.join(os.path.dirname(__file__), "atlatl_reconstruction.svg")
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(svg_content)
    print(f"Generated Atlatl SVG at {output_path}")

