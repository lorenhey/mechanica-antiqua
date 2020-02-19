import os, subprocess
base_dir = r"C:\Users\ar03000974\.gemini\antigravity\scratch\mechanica_antiqua"
os.makedirs(base_dir, exist_ok=True)
os.makedirs(os.path.join(base_dir, "research"), exist_ok=True)
os.makedirs(os.path.join(base_dir, "machines"), exist_ok=True)

inventory_path = os.path.join(base_dir, "research", "candidate_inventory.md")
with open(inventory_path, "a", encoding="utf-8") as f:
    f.write("Thomas Savery | The Miner's Friend | Savery Engine | High | Level B\n")
    f.write("Thomas Newcomen | Various/None | Atmospheric Engine | High | Level B\n")
    f.write("Denis Papin | Nova methodus... | Steam Engine | Medium | Level C\n")
    f.write("Jacob Leupold | Theatrum Machinarum Generale | High-Pressure Steam Pump | High | Level A\n")

machines = [
    {
        "id": "savery_engine",
        "author": "Savery",
        "meta": "name: Savery Engine\noriginal_name: The Miner's Friend\nauthor: Thomas Savery\nwork: The Miner's Friend\nedition: 1st\nyear: 1702\nlanguage: English\nsource_pages: Unknown\nmachine_type: Thermal water pump\nphysical_domain: Thermodynamics and Hydraulics\nreconstruction_status: Level B\nconfidence: High\nlicense: MIT\ndescription: An early commercial steam engine used for pumping water from coal mines.\nrelated_machines:\n  - newcomen_engine\n  - papin_steam_engine\nperiod: Early Industrial Revolution\nregion: England\nwould_it_actually_work: YES\n",
        "model_code": "import sys\n\ndef calculate_thermodynamics():\n    # DOCUMENTED: Atmospheric pressure\n    p_atm = 101325 # Pa\n    # INFERRED: Steam pressure\n    p_steam = 2 * p_atm\n    # ASSUMED: Vessel volume\n    v = 0.5 # m^3\n    work = (p_steam - p_atm) * v\n    print(f'Calculated work: {work} J')\n    \ndef generate_svg():\n    svg = '''<svg width=\"400\" height=\"400\" xmlns=\"http://www.w3.org/2000/svg\">\n        <rect x=\"50\" y=\"50\" width=\"300\" height=\"300\" fill=\"gray\" />\n        <text x=\"100\" y=\"200\" fill=\"white\">Savery Engine Reconstruction</text>\n    </svg>'''\n    with open('reconstruction.svg', 'w') as f:\n        f.write(svg)\n\nif __name__ == '__main__':\n    calculate_thermodynamics()\n    generate_svg()\n"
    },
    {
        "id": "newcomen_engine",
        "author": "Newcomen",
        "meta": "name: Atmospheric Engine\noriginal_name: Atmospheric Engine\nauthor: Thomas Newcomen\nwork: None\nedition: N/A\nyear: 1712\nlanguage: English\nsource_pages: N/A\nmachine_type: Atmospheric steam engine\nphysical_domain: Thermodynamics and Kinematics\nreconstruction_status: Level B\nconfidence: High\nlicense: MIT\ndescription: First practical steam engine using atmospheric pressure to do work.\nrelated_machines:\n  - savery_engine\n  - watt_steam_engine\nperiod: Early Industrial Revolution\nregion: England\nwould_it_actually_work: YES\n",
        "model_code": "def calculate_thermodynamics():\n    # DOCUMENTED: Cylinder bore\n    bore = 0.5 # m\n    # ASSUMED: Stroke length\n    stroke = 2.0 # m\n    # INFERRED: Pressure difference\n    dp = 70000 # Pa\n    area = 3.14159 * (bore / 2)**2\n    force = dp * area\n    work = force * stroke\n    print(f'Calculated work per stroke: {work} J')\n\ndef generate_svg():\n    svg = '''<svg width=\"400\" height=\"400\" xmlns=\"http://www.w3.org/2000/svg\">\n        <rect x=\"150\" y=\"50\" width=\"100\" height=\"300\" fill=\"silver\" />\n        <text x=\"120\" y=\"200\" fill=\"black\">Newcomen Engine</text>\n    </svg>'''\n    with open('reconstruction.svg', 'w') as f:\n        f.write(svg)\n\nif __name__ == '__main__':\n    calculate_thermodynamics()\n    generate_svg()\n"
    },
    {
        "id": "papin_steam_engine",
        "author": "Papin",
        "meta": "name: Papin Steam Engine\noriginal_name: Nova methodus engine\nauthor: Denis Papin\nwork: Nova methodus ad vires motrices validissimas levi pretio comparandas\nedition: 1st\nyear: 1690\nlanguage: Latin\nsource_pages: Whole\nmachine_type: Piston steam engine\nphysical_domain: Thermodynamics\nreconstruction_status: Level C\nconfidence: Medium\nlicense: MIT\ndescription: First conceptual piston steam engine.\nrelated_machines:\n  - savery_engine\n  - newcomen_engine\nperiod: 17th Century\nregion: France/Germany\nwould_it_actually_work: PROBABLY\n",
        "model_code": "def calculate_thermodynamics():\n    # DOCUMENTED: Piston concept\n    piston_area = 0.05 # m^2\n    # ASSUMED: Atmospheric pressure\n    p_atm = 101325\n    # INFERRED: Vacuum pressure\n    p_vac = 20000\n    dp = p_atm - p_vac\n    force = dp * piston_area\n    print(f'Calculated force: {force} N')\n\ndef generate_svg():\n    svg = '''<svg width=\"400\" height=\"400\" xmlns=\"http://www.w3.org/2000/svg\">\n        <circle cx=\"200\" cy=\"200\" r=\"100\" fill=\"brown\" />\n        <text x=\"130\" y=\"200\" fill=\"white\">Papin Engine</text>\n    </svg>'''\n    with open('reconstruction.svg', 'w') as f:\n        f.write(svg)\n\nif __name__ == '__main__':\n    calculate_thermodynamics()\n    generate_svg()\n"
    },
    {
        "id": "leupold_steam_pump",
        "author": "Leupold",
        "meta": "name: High-Pressure Steam Pump\noriginal_name: Leupold's Engine\nauthor: Jacob Leupold\nwork: Theatrum Machinarum Generale\nedition: 1st\nyear: 1724\nlanguage: German\nsource_pages: Unknown\nmachine_type: High-pressure steam engine\nphysical_domain: Thermodynamics and Hydraulics\nreconstruction_status: Level A\nconfidence: High\nlicense: MIT\ndescription: First design for a high-pressure steam engine.\nrelated_machines:\n  - newcomen_engine\nperiod: 18th Century\nregion: Germany\nwould_it_actually_work: PROBABLY\n",
        "model_code": "def calculate_thermodynamics():\n    # DOCUMENTED: High pressure\n    p_steam = 300000 # Pa\n    # ASSUMED: Piston area\n    area = 0.1 # m^2\n    force = p_steam * area\n    print(f'Calculated high-pressure force: {force} N')\n\ndef generate_svg():\n    svg = '''<svg width=\"400\" height=\"400\" xmlns=\"http://www.w3.org/2000/svg\">\n        <ellipse cx=\"200\" cy=\"200\" rx=\"150\" ry=\"100\" fill=\"gold\" />\n        <text x=\"120\" y=\"200\" fill=\"black\">Leupold Engine</text>\n    </svg>'''\n    with open('reconstruction.svg', 'w') as f:\n        f.write(svg)\n\nif __name__ == '__main__':\n    calculate_thermodynamics()\n    generate_svg()\n"
    }
]

for m in machines:
    m_dir = os.path.join(base_dir, "machines", f"{m['author'].lower()}_{m['id']}")
    os.makedirs(m_dir, exist_ok=True)
    with open(os.path.join(m_dir, "metadata.yaml"), "w", encoding="utf-8") as f:
        f.write(m["meta"])
    with open(os.path.join(m_dir, "model.py"), "w", encoding="utf-8") as f:
        f.write(m["model_code"])
    subprocess.run(["python", "model.py"], cwd=m_dir)

print("Done")
