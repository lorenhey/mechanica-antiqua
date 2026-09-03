def calculate_thermodynamics():
    # DOCUMENTED: Cylinder bore
    bore = 0.5 # m
    # ASSUMED: Stroke length
    stroke = 2.0 # m
    # INFERRED: Pressure difference
    dp = 70000 # Pa
    area = 3.14159 * (bore / 2)**2
    force = dp * area
    work = force * stroke
    print(f'Calculated work per stroke: {work} J')

def generate_svg():
    svg = '''<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
        <rect x="150" y="50" width="100" height="300" fill="silver" />
        <text x="120" y="200" fill="black">Newcomen Engine</text>
    </svg>'''
    with open('reconstruction.svg', 'w') as f:
        f.write(svg)

if __name__ == '__main__':
    calculate_thermodynamics()
    generate_svg()
