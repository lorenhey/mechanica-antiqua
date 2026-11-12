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

def build_site():
    print("Construyendo corpus Mechanica Antiqua con banco cinemático interactivo...")
    
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
                    
                    # Garantizar display_year en español
                    if not meta.get('display_year'):
                        y = meta.get('year', 0)
                        if isinstance(y, (int, float)):
                            if y < 0:
                                meta['display_year'] = f"{abs(int(y))} a.C."
                            else:
                                meta['display_year'] = f"{int(y)}"
                        else:
                            meta['display_year'] = str(y)
                            
                    svg_path = os.path.join(folder_path, "reconstruction.svg")
                    if os.path.exists(svg_path):
                        with open(svg_path, "r", encoding="utf-8") as fsvg:
                            meta['svg_content'] = fsvg.read()
                    else:
                        meta['svg_content'] = None
                        
                    # Detección de imagen realista (foto / 3D)
                    realistic_img = None
                    for ext in ["realistic.jpg", "realistic.png", "realistic.jpeg"]:
                        if os.path.exists(os.path.join(folder_path, ext)):
                            realistic_img = ext
                            break
                    meta['realistic_image'] = realistic_img
                    meta['has_realistic_image'] = (realistic_img is not None)
                    meta['visual_type'] = meta.get('visual_type')
                    meta['visual_caption'] = meta.get('visual_caption')
                    
                    # Cargar modelo cinemático analítico
                    meta['kinematic'] = get_kinematic_data(folder)
                    
                    machines.append(meta)
                    
                    # Taxonomías en español
                    author = meta.get('author', 'Desconocido')
                    authors[author].append(meta)
                    
                    period = meta.get('period', 'Sin clasificar')
                    periods[period].append(meta)
                    
                    family = meta.get('machine_type', 'Sin clasificar')
                    families[family].append(meta)
    
    # Ordenamiento cronológico de las máquinas
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
    
    # Copiar todos los scripts del motor cinemático y renderizadores CAD
    static_dir = os.path.join(base_dir, "web", "static")
    if os.path.isdir(static_dir):
        for fname in os.listdir(static_dir):
            if fname.endswith(".js"):
                shutil.copy2(os.path.join(static_dir, fname), os.path.join(site_dir, fname))
    
    # Renderizar index.html
    index_template = env.get_template("index.html")
    index_html = index_template.render(
        machines=machines,
        authors=authors,
        periods=periods,
        families=families,
        total=len(machines)
    )
    with open(os.path.join(site_dir, "index.html"), "w", encoding="utf-8") as f:
        f.write(index_html)

    # Renderizar about.html (Bilingüe)
    if os.path.exists(os.path.join(templates_dir, "about.html")):
        about_template = env.get_template("about.html")
        about_html = about_template.render(total=len(machines))
        with open(os.path.join(site_dir, "about.html"), "w", encoding="utf-8") as f:
            f.write(about_html)
        
    # Renderizar páginas individuales de cada máquina
    machine_template = env.get_template("machine.html")
    for m in machines:
        m_dir = os.path.join(site_dir, m['id'])
        os.makedirs(m_dir, exist_ok=True)
        if m.get('realistic_image'):
            src_img = os.path.join(machines_dir, m['id'], m['realistic_image'])
            dst_img = os.path.join(m_dir, m['realistic_image'])
            shutil.copy2(src_img, dst_img)
            
        m_html = machine_template.render(machine=m)
        with open(os.path.join(m_dir, "index.html"), "w", encoding="utf-8") as f:
            f.write(m_html)
            
    # Estilos CSS
    css_content = """
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=EB+Garamond:ital,wght@0,400;0,600;1,400&display=swap');
    
    body { font-family: 'EB Garamond', serif; background-color: #fcf9f2; color: #2b2b2b; line-height: 1.6; max-width: 1000px; margin: 0 auto; padding: 2rem; font-size: 1.1rem; }
    h1, h2, h3, h4 { font-family: 'Cinzel', serif; border-bottom: 1px solid #d3c9b3; padding-bottom: 0.5rem; color: #3d2b1f; }
    header { margin-bottom: 2rem; text-align: center; }
    header h1 { border-bottom: none; font-size: 2.4rem; margin-bottom: 0.2rem; }
    header p { margin-top: 0; font-size: 1.15rem; color: #5a4b3c; }
    .corpus-stats { background: #f0ebe1; padding: 1.2rem; border: 1px solid #d3c9b3; border-radius: 4px; margin-bottom: 2rem; box-shadow: 0 2px 5px rgba(0,0,0,0.03); }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem; }
    .machine-card { border: 1px solid #d3c9b3; padding: 1.5rem; background: #fff; box-shadow: 2px 2px 8px rgba(0,0,0,0.05); border-radius: 4px; position: relative; }
    .machine-card h3 { font-size: 1.25rem; margin-top: 0; }
    .machine-card h3 a { color: #6b4c1a; text-decoration: none; }
    .machine-card h3 a:hover { text-decoration: underline; }
    .meta-label { font-weight: bold; color: #555; }
    
    .svg-container { text-align: center; margin: 1.5rem 0; padding: 1rem; background: #fff; border: 1px solid #d3c9b3; border-radius: 4px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
    .svg-container svg { max-width: 100%; height: auto; display: block; margin: 0 auto; }
    
    .realistic-container { text-align: center; margin: 2rem 0; padding: 1.5rem; background: #fff; border: 1px solid #d3c9b3; border-radius: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
    .realistic-image { max-width: 100%; height: auto; border-radius: 4px; box-shadow: 0 3px 10px rgba(0,0,0,0.15); border: 1px solid #e0d7c7; }
    .realistic-caption { margin-top: 0.9rem; font-size: 1rem; color: #5a4b3c; }
    
    .badge-realistic { display: inline-block; margin-top: 0.5rem; padding: 0.2rem 0.6rem; background: #e8ede3; color: #3b5e2b; border: 1px solid #c4d6b8; border-radius: 3px; font-size: 0.85rem; font-weight: bold; }
    
    .back-link { margin-bottom: 1.5rem; display: inline-block; text-decoration: none; color: #6b4c1a; font-weight: bold; border-bottom: 1px solid #6b4c1a; padding-bottom: 2px; }
    .back-link:hover { color: #8a6224; border-color: #8a6224; }
    ul { line-height: 1.8; }
    hr { border: 0; border-top: 1px solid #e0d7c7; margin: 1.5rem 0; }
    
    .site-nav { margin: 1rem 0 0 0; text-align: center; font-size: 1.05rem; }
    .site-nav a { color: #6b4c1a; text-decoration: none; margin: 0 0.5rem; font-weight: 600; padding: 0.2rem 0.5rem; }
    .site-nav a:hover { text-decoration: underline; color: #8a6224; }
    .site-nav a.active { color: #3d2b1f; border-bottom: 2px solid #8a6224; }
    
    /* Banco Cinemático Interactivo */
    .kinematic-workbench-container { margin: 2rem 0; }
    
    .kinematic-controls-card {
        background: #faf6ee;
        border: 1px solid #d3c9b3;
        border-radius: 6px;
        padding: 1.25rem;
        margin-bottom: 1.5rem;
        box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }
    
    .kc-toolbar {
        display: flex;
        flex-wrap: wrap;
        gap: 0.6rem;
        align-items: center;
        margin-bottom: 1rem;
        padding-bottom: 0.8rem;
        border-bottom: 1px solid #e5dcce;
    }
    
    .kc-btn {
        background: #fff;
        border: 1px solid #c4b59d;
        color: #3d2b1f;
        padding: 0.4rem 0.85rem;
        border-radius: 4px;
        font-family: 'EB Garamond', serif;
        font-size: 0.95rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s ease;
    }
    .kc-btn:hover { background: #f0e6d6; border-color: #8a6224; }
    .kc-btn-primary { background: #8a6224; color: #fff; border-color: #6b4c1a; }
    .kc-btn-primary:hover { background: #734f19; }
    .kc-btn-secondary { background: #f1f5f9; color: #334155; border-color: #cbd5e1; }
    .kc-btn-toggle { margin-left: auto; background: #eef2ea; color: #355227; border-color: #cad9c0; }
    
    .kc-speed-group {
        display: flex;
        align-items: center;
        gap: 0.3rem;
        margin-left: 0.5rem;
    }
    .kc-btn-speed {
        background: #fff;
        border: 1px solid #cbd5e1;
        padding: 0.25rem 0.5rem;
        font-size: 0.85rem;
        border-radius: 3px;
        cursor: pointer;
    }
    .kc-btn-speed.active { background: #334155; color: #fff; border-color: #1e293b; font-weight: bold; }
    
    .kc-scrub-row {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1.2rem;
    }
    .kc-label { font-weight: 600; color: #4a3525; font-size: 0.95rem; }
    .kc-slider {
        flex: 1;
        accent-color: #8a6224;
        cursor: pointer;
        height: 6px;
    }
    .kc-numeric-readout {
        font-family: monospace;
        font-size: 1.05rem;
        font-weight: bold;
        color: #1e293b;
        background: #fff;
        padding: 0.25rem 0.6rem;
        border: 1px solid #d3c9b3;
        border-radius: 4px;
        min-width: 140px;
        text-align: center;
    }
    
    .kc-telemetry-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 0.75rem;
    }
    .kc-telemetry-item {
        background: #fff;
        border: 1px solid #e0d7c7;
        border-radius: 4px;
        padding: 0.5rem 0.75rem;
        display: flex;
        flex-direction: column;
    }
    .kc-metric-label { font-size: 0.8rem; color: #64748b; font-weight: 600; }
    .kc-metric-val { font-size: 1.15rem; font-weight: bold; color: #1e293b; font-family: monospace; }
    
    .kinematic-plot-card {
        background: #fff;
        border: 1px solid #d3c9b3;
        border-radius: 6px;
        padding: 1.25rem;
        margin-top: 1.5rem;
        box-shadow: 0 2px 8px rgba(0,0,0,0.03);
    }
    .kc-plot-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.75rem;
        flex-wrap: wrap;
        gap: 0.5rem;
    }
    .kc-plot-header h4 { margin: 0; font-family: 'Cinzel', serif; font-size: 1.05rem; color: #3d2b1f; border-bottom: none; padding-bottom: 0; }
    .kc-plot-legend { display: flex; gap: 1rem; font-size: 0.85rem; color: #475569; }
    .legend-item { display: flex; align-items: center; gap: 0.35rem; }
    .legend-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
    .dot-disp { background: #2563eb; }
    .dot-vel { background: #059669; }
    .dot-acc { background: #dc2626; }
    
    .kc-plot-svg-box { width: 100%; height: 160px; overflow: hidden; }
    .kc-plot-svg-box svg { width: 100%; height: 100%; }

    /* Ficha de Análisis de Mecanismos */
    .theory-card {
        background: #fff;
        border: 1px solid #d3c9b3;
        border-radius: 6px;
        padding: 1.75rem;
        margin-top: 2rem;
        box-shadow: 0 2px 8px rgba(0,0,0,0.03);
    }
    .theory-card h3 { margin-top: 0; font-size: 1.3rem; border-bottom: 1px solid #e0d7c7; padding-bottom: 0.4rem; color: #3d2b1f; }
    .theory-table { width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: 1rem; }
    .theory-table th, .theory-table td { padding: 0.6rem 0.8rem; border: 1px solid #e0d7c7; text-align: left; }
    .theory-table th { background: #f8f5ee; font-family: 'Cinzel', serif; font-size: 0.9rem; color: #4a3525; }
    .formula-badge { font-family: monospace; background: #f1f5f9; padding: 0.2rem 0.5rem; border-radius: 3px; font-weight: bold; color: #0f172a; }
    
    footer { text-align: center; margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid #d3c9b3; font-size: 0.95rem; color: #7a6b5c; }
    """
    with open(os.path.join(site_dir, "style.css"), "w", encoding="utf-8") as f:
        f.write(css_content)
        
    print(f"Sitio construido con exito. Total de maquinas procesadas: {len(machines)}")

if __name__ == "__main__":
    build_site()
