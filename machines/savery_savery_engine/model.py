import sys

def calculate_thermodynamics():
    # DOCUMENTED: Atmospheric pressure
    p_atm = 101325 # Pa
    # INFERRED: Steam pressure
    p_steam = 2 * p_atm
    # ASSUMED: Vessel volume
    v = 0.5 # m^3
    work = (p_steam - p_atm) * v
    print(f'Calculated work: {work} J')
    
def generate_svg():
    svg = '''<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
        <rect x="50" y="50" width="300" height="300" fill="gray" />
        <text x="100" y="200" fill="white">Savery Engine Reconstruction</text>
    </svg>'''
    with open('reconstruction.svg', 'w') as f:
        f.write(svg)

if __name__ == '__main__':
    calculate_thermodynamics()
    generate_svg()
