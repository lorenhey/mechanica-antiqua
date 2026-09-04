import sys
import os

# Add parent directory to path to import mechanica
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from mechanica.kinematics import belt_drive_transmission

def run_model():
    # ASSUMED dimensions
    drive_wheel_diameter = 60.0  # cm 
    spindle_diameter = 2.0       # cm 
    
    input_rpm = 60.0  # RPM (ASSUMED manual turning speed)
    
    # Calculate output RPM
    output_rpm = belt_drive_transmission(input_rpm, drive_wheel_diameter, spindle_diameter)
    
    print(f"Drive Wheel Diameter: {drive_wheel_diameter} cm")
    print(f"Spindle Diameter: {spindle_diameter} cm")
    print(f"Input Speed: {input_rpm} RPM")
    print(f"Output Spindle Speed: {output_rpm} RPM")
    print(f"Gear Ratio: 1:{drive_wheel_diameter/spindle_diameter}")
    
    # Generate SVG
    svg_content = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400">
    <rect width="100%" height="100%" fill="#f0f0f0"/>
    <text x="400" y="30" font-family="Arial" font-size="20" text-anchor="middle">Indian Charkha (Spinning Wheel) Kinematics</text>
    
    <!-- Base -->
    <rect x="50" y="300" width="700" height="20" fill="#8B4513"/>
    
    <!-- Drive Wheel Supports -->
    <rect x="230" y="150" width="10" height="150" fill="#8B4513"/>
    <rect x="260" y="150" width="10" height="150" fill="#8B4513"/>
    
    <!-- Spindle Supports -->
    <rect x="640" y="250" width="10" height="50" fill="#8B4513"/>
    <rect x="660" y="250" width="10" height="50" fill="#8B4513"/>
    
    <!-- Drive Wheel (R=100 for visual) -->
    <circle cx="250" cy="150" r="100" fill="none" stroke="#5C4033" stroke-width="5"/>
    <circle cx="250" cy="150" r="5" fill="#000"/>
    
    <!-- Spokes -->
    <line x1="250" y1="50" x2="250" y2="250" stroke="#5C4033" stroke-width="3"/>
    <line x1="150" y1="150" x2="350" y2="150" stroke="#5C4033" stroke-width="3"/>
    <line x1="179" y1="79" x2="321" y2="221" stroke="#5C4033" stroke-width="3"/>
    <line x1="179" y1="221" x2="321" y2="79" stroke="#5C4033" stroke-width="3"/>
    
    <!-- Spindle (R=10 for visual) -->
    <circle cx="650" cy="250" r="10" fill="none" stroke="#5C4033" stroke-width="3"/>
    <circle cx="650" cy="250" r="3" fill="#000"/>
    
    <!-- Belt -->
    <!-- Tangent lines for visual -->
    <line x1="250" y1="50" x2="650" y2="240" stroke="#000" stroke-width="2" stroke-dasharray="5,5"/>
    <line x1="250" y1="250" x2="650" y2="260" stroke="#000" stroke-width="2" stroke-dasharray="5,5"/>
    
    <text x="250" y="280" font-family="Arial" font-size="14" text-anchor="middle">Drive Wheel (D={drive_wheel_diameter}cm)</text>
    <text x="650" y="280" font-family="Arial" font-size="14" text-anchor="middle">Spindle (D={spindle_diameter}cm)</text>
    <text x="450" y="150" font-family="Arial" font-size="16" text-anchor="middle" fill="#0066cc">Ratio: 1:{drive_wheel_diameter/spindle_diameter}</text>
    <text x="450" y="180" font-family="Arial" font-size="16" text-anchor="middle" fill="#0066cc">Input: {input_rpm} RPM -&gt; Output: {output_rpm:.0f} RPM</text>
</svg>"""
    
    # Determine the directory where this script is located
    current_dir = os.path.dirname(os.path.abspath(__file__))
    svg_path = os.path.join(current_dir, 'reconstruction.svg')
    
    with open(svg_path, 'w') as f:
        f.write(svg_content)
    print(f"reconstruction.svg generated at {svg_path}")

if __name__ == "__main__":
    run_model()
