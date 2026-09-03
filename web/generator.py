import os
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
    
    for folder in os.listdir(machines_dir):
        folder_path = os.path.join(machines_dir, folder)
        if os.path.isdir(folder_path):
            meta_path = os.path.join(folder_path, "metadata.yaml")
            if os.path.exists(meta_path):
                with open(meta_path, "r", encoding="utf-8") as f:
                    meta = yaml.safe_load(f)
                    meta['id'] = folder
                    
                    svg_path = os.path.join(folder_path, "reconstruction.svg")
                    if os.path.exists(svg_path):
                        with open(svg_path, "r", encoding="utf-8") as fsvg:
                            meta['svg_content'] = fsvg.read()
                    else:
                        meta['svg_content'] = None
                        
                    machines.append(meta)
                    
                    # Populate taxonomies
                    author = meta.get('author', 'Unknown')
                    authors[author].append(meta)
                    
                    # Fallback for old period field if missing
                    period = meta.get('period', 'Unclassified')
                    periods[period].append(meta)
                    
                    family = meta.get('machine_type', 'Unclassified')
                    families[family].append(meta)
    
    # Sort machines chronologically
    machines.sort(key=lambda x: x.get('year', 9999))
    
    # Render index
    index_template = env.get_template("index.html")
    index_html = index_template.render(machines=machines, authors=authors, families=families, total=len(machines))
    with open(os.path.join(site_dir, "index.html"), "w", encoding="utf-8") as f:
        f.write(index_html)
        
    # Render machine pages
    machine_template = env.get_template("machine.html")
    for m in machines:
        m_html = machine_template.render(machine=m)
        m_dir = os.path.join(site_dir, m['id'])
        os.makedirs(m_dir, exist_ok=True)
        with open(os.path.join(m_dir, "index.html"), "w", encoding="utf-8") as f:
            f.write(m_html)
            
    # Copy CSS
    css_content = """
    body { font-family: 'EB Garamond', serif; background-color: #fcf9f2; color: #2b2b2b; line-height: 1.6; max-width: 1000px; margin: 0 auto; padding: 2rem; }
    h1, h2, h3 { font-family: 'Cinzel', serif; border-bottom: 1px solid #ccc; padding-bottom: 0.5rem; }
    .corpus-stats { background: #f0ebe1; padding: 1rem; border: 1px solid #d3c9b3; margin-bottom: 2rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
    .machine-card { border: 1px solid #d3c9b3; padding: 1.5rem; background: #fff; box-shadow: 2px 2px 8px rgba(0,0,0,0.05); }
    .meta-label { font-weight: bold; color: #666; }
    .svg-container { text-align: center; margin: 2rem 0; padding: 1rem; background: #fff; border: 1px solid #eee; overflow: hidden;}
    .svg-container svg { max-width: 100%; height: auto; }
    .back-link { margin-bottom: 2rem; display: inline-block; text-decoration: none; color: #6b4c1a; border-bottom: 1px solid #6b4c1a; }
    .back-link:hover { background: #6b4c1a; color: #fff; }
    .nav-tabs { margin-bottom: 1rem; }
    """
    with open(os.path.join(site_dir, "style.css"), "w", encoding="utf-8") as f:
        f.write(css_content)
        
    print(f"Sitio construido. Total de máquinas: {len(machines)}")

if __name__ == "__main__":
    build_site()
