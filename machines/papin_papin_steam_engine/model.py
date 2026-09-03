def calculate_thermodynamics():
    # DOCUMENTED: Piston concept
    piston_area = 0.05 # m^2
    # ASSUMED: Atmospheric pressure
    p_atm = 101325
    # INFERRED: Vacuum pressure
    p_vac = 20000
    dp = p_atm - p_vac
    force = dp * piston_area
    print(f'Calculated force: {force} N')

def generate_svg():
    svg = '''<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
        <circle cx="200" cy="200" r="100" fill="brown" />
        <text x="130" y="200" fill="white">Papin Engine</text>
    </svg>'''
    with open('reconstruction.svg', 'w') as f:
        f.write(svg)

if __name__ == '__main__':
    calculate_thermodynamics()
    generate_svg()
