import os
import re
import yaml
from collections import defaultdict
from jinja2 import Environment, FileSystemLoader

def build_site():
    print("Construyendo corpus Mechanica Antiqua...")
    
    base_dir = os.path.dirname(os.path.dirname(__file__))
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
        
    # Renderizar páginas individuales de cada máquina
    machine_template = env.get_template("machine.html")
    import shutil
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
    h1, h2, h3 { font-family: 'Cinzel', serif; border-bottom: 1px solid #d3c9b3; padding-bottom: 0.5rem; color: #3d2b1f; }
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
    .svg-container { text-align: center; margin: 2rem 0; padding: 1.5rem; background: #fff; border: 1px solid #d3c9b3; border-radius: 4px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
    .svg-container svg { max-width: 100%; height: auto; }
    
    .realistic-container { text-align: center; margin: 2rem 0; padding: 1.5rem; background: #fff; border: 1px solid #d3c9b3; border-radius: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
    .realistic-image { max-width: 100%; height: auto; border-radius: 4px; box-shadow: 0 3px 10px rgba(0,0,0,0.15); border: 1px solid #e0d7c7; }
    .realistic-caption { margin-top: 0.9rem; font-size: 1rem; color: #5a4b3c; }
    
    .badge-realistic { display: inline-block; margin-top: 0.5rem; padding: 0.2rem 0.6rem; background: #e8ede3; color: #3b5e2b; border: 1px solid #c4d6b8; border-radius: 3px; font-size: 0.85rem; font-weight: bold; }
    
    .back-link { margin-bottom: 1.5rem; display: inline-block; text-decoration: none; color: #6b4c1a; font-weight: bold; border-bottom: 1px solid #6b4c1a; padding-bottom: 2px; }
    .back-link:hover { color: #8a6224; border-color: #8a6224; }
    ul { line-height: 1.8; }
    hr { border: 0; border-top: 1px solid #e0d7c7; margin: 1.5rem 0; }
    """
    with open(os.path.join(site_dir, "style.css"), "w", encoding="utf-8") as f:
        f.write(css_content)
        
    print(f"Sitio construido con exito. Total de maquinas: {len(machines)}")

if __name__ == "__main__":
    build_site()
