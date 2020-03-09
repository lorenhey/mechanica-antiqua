import os
import yaml
import sys

REQUIRED_FIELDS = [
    "name", "original_name", "author", "work", "edition", "year", "language",
    "source_pages", "machine_type", "physical_domain", "reconstruction_status",
    "confidence", "license", "description"
]

def validate_corpus():
    base_dir = os.path.dirname(os.path.dirname(__file__))
    machines_dir = os.path.join(base_dir, "machines")
    
    if not os.path.exists(machines_dir):
        print("Error: Directorio machines/ no encontrado.")
        sys.exit(1)
        
    errors = 0
    total_machines = 0
    
    for folder in os.listdir(machines_dir):
        folder_path = os.path.join(machines_dir, folder)
        if os.path.isdir(folder_path):
            meta_path = os.path.join(folder_path, "metadata.yaml")
            if not os.path.exists(meta_path):
                print(f"Error: {folder} no tiene metadata.yaml")
                errors += 1
                continue
                
            with open(meta_path, "r", encoding="utf-8") as f:
                try:
                    meta = yaml.safe_load(f)
                except Exception as e:
                    print(f"Error parseando YAML en {folder}: {e}")
                    errors += 1
                    continue
                    
                for field in REQUIRED_FIELDS:
                    if field not in meta:
                        print(f"Error en {folder}: Falta el campo obligatorio '{field}'")
                        errors += 1
                        
            total_machines += 1
            
    print(f"Validación completada. Máquinas evaluadas: {total_machines}.")
    if errors > 0:
        print(f"Se encontraron {errors} errores de metadatos.")
        sys.exit(1)
    else:
        print("El corpus está estructurado correctamente.")
        
if __name__ == "__main__":
    validate_corpus()
