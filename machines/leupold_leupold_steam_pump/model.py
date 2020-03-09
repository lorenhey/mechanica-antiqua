def calculate_thermodynamics():
    # DOCUMENTED: High pressure
    p_steam = 300000 # Pa
    # ASSUMED: Piston area
    area = 0.1 # m^2
    force = p_steam * area
    print(f'Calculated high-pressure force: {force} N')

def generate_svg():
    svg = '''<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="200" cy="200" rx="150" ry="100" fill="gold" />
        <text x="120" y="200" fill="black">Leupold Engine</text>
    </svg>'''
    with open('reconstruction.svg', 'w') as f:
        f.write(svg)

if __name__ == '__main__':
    calculate_thermodynamics()
    generate_svg()
