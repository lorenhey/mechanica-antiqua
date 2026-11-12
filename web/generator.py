import os
import re
import yaml
import shutil
from collections import defaultdict
from jinja2 import Environment, FileSystemLoader
import sys

# Asegurar importación de mechanica
base_dir = os.path.dirname(os.path.dirname(__file__))
if base_dir not in sys.path:
    sys.path.insert(0, base_dir)

from mechanica.kinematic_catalog import get_kinematic_data

DOMAIN_CATEGORIES = {
    "hidraulica": {
        "label": "Hidráulica y Elevación",
        "short_label": "Hidráulica",
        "ids": {
            "vitruvius_archimedes_screw", "agricola_chain_pump", "african_saqiya",
            "vitruvius_water_wheel", "agricola_reversible_hoist", "african_shaduf",
            "roman_aqueduct", "ctesibius_clepsydra", "banu_musa_alternating_fountain",
            "philo_washbasin", "al_jazari_elephant_clock"
        }
    },
    "termica": {
        "label": "Bombas, Vapor y Fluidos",
        "short_label": "Bombas y vapor",
        "ids": {
            "newcomen_newcomen_engine", "papin_papin_steam_engine", "leupold_leupold_steam_pump",
            "savery_savery_engine", "heron_aeolipile", "inca_huayra_furnace",
            "agricola_ventilation_fan", "al_jazari_suction_pump", "agricola_suction_pump",
            "ctesibius_pump", "martini_piston_pump", "ramelli_rotary_pump"
        }
    },
    "mecanismos": {
        "label": "Mecanismos y Relojería",
        "short_label": "Mecanismos",
        "ids": {
            "martini_hydraulic_sawmill", "agricola_stamp_mill", "zonca_paper_mill",
            "zonca_stamping_mill", "villard_sawmill", "ramelli_book_wheel",
            "besson_screw_lathe", "leonardo_cage_bearing", "leonardo_globoidal_gear",
            "chinese_south_pointing_chariot", "chinese_su_song_clock",
            "japanese_karakuri_doll", "banu_musa_automatic_flute", "indian_charkha"
        }
    },
    "estructuras": {
        "label": "Estructuras y Balística",
        "short_label": "Estructuras y balística",
        "ids": {
            "mesoamerican_atlatl", "chinese_repeating_crossbow", "gothic_cathedral",
            "inca_suspension_bridge", "inca_quipu_memory"
        }
    }
}

def classify_category(machine_id: str):
    for slug, info in DOMAIN_CATEGORIES.items():
        if machine_id in info["ids"]:
            return slug, info["label"], info["short_label"]
    return "mecanismos", "Mecanismos y Relojería", "Mecanismos"

def build_site():
    print("Generando sitio Mechanica Antiqua...")
    
    machines_dir = os.path.join(base_dir, "machines")
    site_dir = os.path.join(base_dir, "site")
    os.makedirs(site_dir, exist_ok=True)
    
    templates_dir = os.path.join(base_dir, "web", "templates")
    env = Environment(loader=FileSystemLoader(templates_dir))
    
    machines = []
    authors = defaultdict(list)
    periods = defaultdict(list)
    families = defaultdict(list)
    
    for folder in sorted(os.listdir(machines_dir)):
        folder_path = os.path.join(machines_dir, folder)
        if os.path.isdir(folder_path):
            meta_path = os.path.join(folder_path, "metadata.yaml")
            if os.path.exists(meta_path):
                with open(meta_path, "r", encoding="utf-8") as f:
                    meta = yaml.safe_load(f) or {}
                    meta['id'] = folder
                    
                    if not meta.get('display_year'):
                        y = meta.get('year', 0)
                        if isinstance(y, (int, float)):
                            meta['display_year'] = f"{abs(int(y))} a.C." if y < 0 else f"{int(y)}"
                        else:
                            meta['display_year'] = str(y)
                            
                    svg_path = os.path.join(folder_path, "reconstruction.svg")
                    if os.path.exists(svg_path):
                        with open(svg_path, "r", encoding="utf-8") as fsvg:
                            meta['svg_content'] = fsvg.read()
                    else:
                        meta['svg_content'] = None
                        
                    realistic_img = None
                    for ext in ["realistic.jpg", "realistic.png", "realistic.jpeg"]:
                        if os.path.exists(os.path.join(folder_path, ext)):
                            realistic_img = ext
                            break
                    meta['realistic_image'] = realistic_img
                    meta['has_realistic_image'] = (realistic_img is not None)
                    meta['visual_type'] = meta.get('visual_type')
                    meta['visual_caption'] = meta.get('visual_caption')
                    
                    meta['kinematic'] = get_kinematic_data(folder)
                    cat_slug, cat_label, cat_short = classify_category(folder)
                    meta['category_slug'] = cat_slug
                    meta['category_label'] = cat_label
                    meta['category_short'] = cat_short
                    
                    machines.append(meta)
                    authors[meta.get('author', 'Desconocido')].append(meta)
                    periods[meta.get('period', 'Sin clasificar')].append(meta)
                    families[meta.get('machine_type', 'Sin clasificar')].append(meta)
    
    def get_sort_year(m):
        y = m.get('year', 9999)
        if isinstance(y, (int, float)):
            return int(y)
        if isinstance(y, str):
            is_bc = any(w in y.upper() for w in ['BC', 'A.C.', 'B.C.'])
            m_digit = re.search(r'-?\d+', y)
            if m_digit:
                val = int(m_digit.group(0))
                return -abs(val) if is_bc else val
        return 9999

    machines.sort(key=get_sort_year)

    # Copiar scripts estáticos CAD y de simulación
    static_dir = os.path.join(base_dir, "web", "static")
    if os.path.isdir(static_dir):
        for fname in os.listdir(static_dir):
            if fname.endswith(".js"):
                shutil.copy2(os.path.join(static_dir, fname), os.path.join(site_dir, fname))

    cat_counts = {slug: sum(1 for m in machines if m['category_slug'] == slug) for slug in DOMAIN_CATEGORIES}
    
    index_template = env.get_template("index.html")
    index_html = index_template.render(
        machines=machines,
        authors=dict(sorted(authors.items(), key=lambda x: x[0])),
        categories=DOMAIN_CATEGORIES,
        cat_counts=cat_counts,
        total=len(machines)
    )
    with open(os.path.join(site_dir, "index.html"), "w", encoding="utf-8") as f:
        f.write(index_html)

    if os.path.exists(os.path.join(templates_dir, "about.html")):
        about_template = env.get_template("about.html")
        about_html = about_template.render(total=len(machines))
        with open(os.path.join(site_dir, "about.html"), "w", encoding="utf-8") as f:
            f.write(about_html)
        
    machine_template = env.get_template("machine.html")
    for idx, m in enumerate(machines):
        m_dir = os.path.join(site_dir, m['id'])
        os.makedirs(m_dir, exist_ok=True)
        if m.get('realistic_image'):
            src_img = os.path.join(machines_dir, m['id'], m['realistic_image'])
            dst_img = os.path.join(m_dir, m['realistic_image'])
            shutil.copy2(src_img, dst_img)

        prev_m = machines[idx - 1] if idx > 0 else None
        next_m = machines[idx + 1] if idx + 1 < len(machines) else None
            
        m_html = machine_template.render(
            machine=m,
            prev_machine=prev_m,
            next_machine=next_m,
            total=len(machines)
        )
        with open(os.path.join(m_dir, "index.html"), "w", encoding="utf-8") as f:
            f.write(m_html)
            
    css_content = """:root {
    --bg: #ffffff;
    --surface: #f7f7f7;
    --ink: #111111;
    --ink-2: #444444;
    --muted: #767676;
    --border: #e0e0e0;
    --border-strong: #111111;
    --accent: #0b4f8c;
    --sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    --mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

*, *::before, *::after {
    box-sizing: border-box;
}

html {
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
}

body {
    font-family: var(--sans);
    background: var(--bg);
    color: var(--ink);
    line-height: 1.6;
    max-width: 1080px;
    margin: 0 auto;
    padding: 2rem 1.5rem 4rem;
}

h1 {
    font-size: clamp(1.75rem, 3vw, 2.25rem);
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.15;
    margin: 0 0 0.4rem;
}

h2 {
    font-size: 1.15rem;
    font-weight: 600;
    margin: 2rem 0 0.65rem;
}

a {
    color: var(--accent);
    text-decoration: none;
}

a:hover {
    text-decoration: underline;
}

code {
    font-family: var(--mono);
    font-size: 0.87em;
    background: var(--surface);
    padding: 0.1rem 0.3rem;
}

/* Barra superior minimalista */
.topbar {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 1rem;
    padding-bottom: 1rem;
    margin-bottom: 2rem;
    border-bottom: 1px solid var(--border);
}

.brand {
    font-weight: 700;
    font-size: 1.05rem;
    color: var(--ink);
    letter-spacing: -0.01em;
}

.brand:hover {
    text-decoration: none;
    color: var(--accent);
}

.nav {
    display: flex;
    gap: 1.5rem;
    font-size: 0.92rem;
}

.nav a {
    color: var(--muted);
}

.nav a:hover,
.nav a.active {
    color: var(--ink);
    text-decoration: none;
}

.nav a.active {
    font-weight: 600;
}

/* Catálogo */
.lead {
    font-size: 1.08rem;
    color: var(--ink-2);
    max-width: 68ch;
    margin: 0 0 1.75rem;
}

.toolbar {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 0.9rem;
    padding: 0.75rem 0;
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    margin-bottom: 1rem;
}

.filters {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
}

.filter-btn {
    background: transparent;
    border: 1px solid transparent;
    color: var(--ink-2);
    padding: 0.3rem 0.65rem;
    font-family: var(--sans);
    font-size: 0.86rem;
    cursor: pointer;
}

.filter-btn:hover {
    color: var(--ink);
    background: var(--surface);
}

.filter-btn.active {
    color: var(--ink);
    font-weight: 600;
    border-color: var(--ink);
    background: var(--surface);
}

.toolbar-right {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.search-input {
    border: 1px solid var(--border);
    padding: 0.32rem 0.6rem;
    font-family: var(--sans);
    font-size: 0.88rem;
    width: 195px;
    color: var(--ink);
    background: var(--bg);
}

.search-input:focus {
    outline: none;
    border-color: var(--ink);
}

.view-toggle {
    display: inline-flex;
    border: 1px solid var(--border);
}

.vbtn {
    background: var(--bg);
    border: none;
    padding: 0.32rem 0.7rem;
    font-family: var(--sans);
    font-size: 0.84rem;
    color: var(--muted);
    cursor: pointer;
}

.vbtn + .vbtn {
    border-left: 1px solid var(--border);
}

.vbtn.active {
    background: var(--ink);
    color: var(--bg);
}

.catalog-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.95rem;
}

.catalog-table th {
    text-align: left;
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--muted);
    padding: 0.6rem 0.75rem 0.6rem 0;
    border-bottom: 1px solid var(--border-strong);
}

.catalog-table td {
    padding: 0.65rem 0.75rem 0.65rem 0;
    border-bottom: 1px solid var(--border);
    vertical-align: top;
}

.catalog-table tbody tr:hover {
    background: var(--surface);
}

.td-year {
    font-family: var(--mono);
    font-size: 0.84rem;
    color: var(--ink-2);
    white-space: nowrap;
    width: 6.5rem;
}

.td-name a {
    font-weight: 600;
    color: var(--ink);
}

.td-name a:hover {
    color: var(--accent);
}

.td-author {
    color: var(--ink-2);
}

.td-author span {
    color: var(--muted);
}

.td-cat {
    font-size: 0.84rem;
    color: var(--muted);
    white-space: nowrap;
}

.gallery-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1.5rem;
    margin-top: 1.25rem;
}

.gallery-card {
    display: block;
    border: 1px solid var(--border);
    color: var(--ink);
}

.gallery-card:hover {
    text-decoration: none;
    border-color: var(--ink);
}

.gallery-thumb {
    aspect-ratio: 16 / 10;
    background: var(--surface);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border-bottom: 1px solid var(--border);
}

.gallery-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.gallery-noimg {
    font-family: var(--mono);
    font-size: 0.82rem;
    color: var(--muted);
}

.gallery-info {
    padding: 0.75rem 0.85rem;
}

.gallery-title {
    font-weight: 600;
    font-size: 0.95rem;
    line-height: 1.3;
}

.gallery-meta {
    font-size: 0.82rem;
    color: var(--muted);
    margin-top: 0.25rem;
}

/* Página de máquina */
.machine-header {
    margin-bottom: 1.5rem;
}

.machine-sub {
    color: var(--ink-2);
    margin: 0;
    font-size: 0.98rem;
}

.sim-stage {
    border: 1px solid var(--border);
    background: var(--bg);
    margin-bottom: 2.25rem;
}

.sim-canvas-wrap {
    padding: 0.25rem;
    background: var(--bg);
}

.sim-controls {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 0.75rem;
    padding: 0.6rem 0.85rem;
    background: var(--surface);
    border-top: 1px solid var(--border);
}

.sim-controls-main {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    flex: 1;
    min-width: 280px;
}

.sim-controls-extra {
    display: flex;
    align-items: center;
    gap: 0.45rem;
}

.sim-btn {
    background: var(--bg);
    border: 1px solid #cccccc;
    color: var(--ink);
    padding: 0.28rem 0.65rem;
    font-family: var(--sans);
    font-size: 0.82rem;
    cursor: pointer;
}

.sim-btn:hover {
    border-color: var(--ink);
}

.sim-btn-active {
    background: var(--ink);
    color: var(--bg);
    border-color: var(--ink);
}

.sim-slider {
    flex: 1;
    accent-color: var(--ink);
    cursor: pointer;
    margin: 0 0.4rem;
}

.sim-readout {
    font-family: var(--mono);
    font-size: 0.82rem;
    color: var(--ink-2);
    min-width: 112px;
    text-align: right;
}

.sim-speeds {
    display: inline-flex;
    border: 1px solid #cccccc;
}

.sim-speed {
    background: var(--bg);
    border: none;
    padding: 0.24rem 0.45rem;
    font-family: var(--mono);
    font-size: 0.78rem;
    color: var(--ink-2);
    cursor: pointer;
}

.sim-speed + .sim-speed {
    border-left: 1px solid #cccccc;
}

.sim-speed.active {
    background: var(--ink);
    color: var(--bg);
}

.sim-plot-wrap {
    border-top: 1px solid var(--border);
    padding: 0.75rem 0.85rem 0.5rem;
    background: var(--bg);
}

.sim-plot-legend {
    display: flex;
    gap: 1.25rem;
    font-size: 0.78rem;
    color: var(--muted);
    margin-bottom: 0.25rem;
}

.sim-plot-legend i {
    display: inline-block;
    width: 10px;
    height: 2px;
    vertical-align: middle;
    margin-right: 0.3rem;
}

.sim-plot-svg {
    width: 100%;
    height: 130px;
    display: block;
}

.detail-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.55fr) minmax(260px, 1fr);
    gap: 3rem;
    align-items: start;
}

.detail-prose p {
    margin: 0 0 1rem;
    color: var(--ink-2);
}

.detail-prose h2:first-child {
    margin-top: 0;
}

.math-line {
    font-size: 0.92rem;
}

.side-figure {
    margin: 0 0 1.5rem;
    border: 1px solid var(--border);
    padding: 0.45rem;
    background: var(--bg);
}

.side-figure img {
    width: 100%;
    height: auto;
    display: block;
}

.side-figure figcaption {
    margin-top: 0.45rem;
    font-size: 0.82rem;
    color: var(--muted);
    line-height: 1.4;
}

.spec-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.88rem;
}

.spec-table th,
.spec-table td {
    padding: 0.45rem 0;
    border-bottom: 1px solid var(--border);
    vertical-align: top;
}

.spec-table th {
    text-align: left;
    font-weight: 500;
    color: var(--muted);
    padding-right: 1rem;
}

.spec-val {
    text-align: right;
    font-family: var(--mono);
    font-size: 0.85rem;
    color: var(--ink);
    white-space: nowrap;
}

.pager {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    margin-top: 3rem;
    padding-top: 1.25rem;
    border-top: 1px solid var(--border);
    font-size: 0.92rem;
}

/* Acerca de */
.prose-page {
    max-width: 72ch;
}

.lang-tabs {
    margin-bottom: 1.5rem;
    font-size: 0.9rem;
    color: var(--muted);
}

.section-sep {
    border: none;
    border-top: 1px solid var(--border);
    margin: 3rem 0;
}

.footer {
    margin-top: 3.5rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border);
    font-size: 0.82rem;
    color: var(--muted);
}

.is-hidden {
    display: none !important;
}

@media (max-width: 820px) {
    .detail-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
    }
    .gallery-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

@media (max-width: 600px) {
    body {
        padding: 1.25rem 1rem 3rem;
    }
    .gallery-grid {
        grid-template-columns: 1fr;
    }
    .td-cat {
        display: none;
    }
    .sim-controls-main {
        flex-wrap: wrap;
    }
}
"""
    with open(os.path.join(site_dir, "style.css"), "w", encoding="utf-8") as f:
        f.write(css_content)
        
    print(f"Sitio generado con exito ({len(machines)} maquinas).")

if __name__ == "__main__":
    build_site()
