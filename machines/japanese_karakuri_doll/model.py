import sys
import os
import math

sys.path.append(os.path.abspath('../../'))
from mechanica.kinematics import leaf_spring_force, leaf_spring_energy, cam_profile_harmonic

# 1. Physics Calculations
E_whalebone = 3.0e9 # Pascals (assumed elastic modulus for baleen/whalebone)
width = 0.01 # 1 cm
thickness = 0.002 # 2 mm
L = 0.1 # 10 cm
I_whalebone = (width * thickness**3) / 12

deflection = 0.02 # 2 cm
force = leaf_spring_force(E_whalebone, I_whalebone, L, deflection)
energy = leaf_spring_energy(E_whalebone, I_whalebone, L, deflection)

print(f"Whalebone Spring Force: {force:.2f} N")
print(f"Whalebone Spring Energy: {energy:.4f} J")

# 2. Cam Calculations for walking motion
cam_lift = 0.03 # 3 cm lift for feet
angle = math.pi / 4
lift_at_angle = cam_profile_harmonic(cam_lift, angle)
print(f"Cam Lift at 45 deg: {lift_at_angle:.4f} m")

# 3. Generate SVG
svg_content = f"""<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
  <!-- ASSUMED dimensions for visualization -->
  <rect x="50" y="50" width="300" height="300" fill="#f0f0f0" stroke="black"/>
  <text x="60" y="80" font-family="Arial" font-size="16">Karakuri Tea-Serving Doll (Chahakobi Ningyo)</text>
  <text x="60" y="100" font-family="Arial" font-size="12">DOCUMENTED: Whalebone spring for propulsion</text>
  <text x="60" y="120" font-family="Arial" font-size="12">RECONSTRUCTED Spring Force: {force:.2f} N</text>
  <text x="60" y="140" font-family="Arial" font-size="12">RECONSTRUCTED Spring Energy: {energy:.4f} J</text>
  
  <!-- Main Body -->
  <rect x="150" y="150" width="100" height="150" fill="#cc9966" stroke="black"/>
  <!-- Head -->
  <circle cx="200" cy="120" r="30" fill="#ffe0bd" stroke="black"/>
  <!-- Tray/Arms -->
  <line x1="150" y1="200" x2="100" y2="200" stroke="black" stroke-width="5"/>
  <rect x="80" y="190" width="40" height="10" fill="brown" stroke="black"/>
  
  <!-- Cams / Gears (INFERRED layout) -->
  <circle cx="200" cy="250" r="20" fill="none" stroke="black" stroke-dasharray="4"/>
  <circle cx="200" cy="250" r="{20 + lift_at_angle*1000}" fill="none" stroke="red" stroke-width="2"/>
  <text x="230" y="255" font-family="Arial" font-size="10" fill="red">Walking Cam</text>
  
  <!-- Spring -->
  <path d="M 180 200 C 190 180, 210 180, 220 200" fill="none" stroke="blue" stroke-width="3"/>
  <text x="230" y="200" font-family="Arial" font-size="10" fill="blue">Whalebone Spring</text>
</svg>
"""

with open("reconstruction.svg", "w") as f:
    f.write(svg_content)

print("Saved reconstruction.svg")
