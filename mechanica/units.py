import math
from dataclasses import dataclass
from typing import Optional, Tuple

# Base de datos de unidades históricas aproximadas (en metros)
# Formato: { "unit_name": { "region_period": (min_m, max_m, typical_m) } }
HISTORICAL_DB = {
    "piede": {
        "italy_16th": (0.29, 0.35, 0.347), # Piede veneto as typical for Ramelli/northern Italy
        "roman": (0.295, 0.297, 0.296),
    },
    "braccio": {
        "italy_16th": (0.58, 0.60, 0.59),
    },
    "foot": {
        "england_16th": (0.30, 0.31, 0.3048),
    },
    "pied": {
        "france_17th": (0.32, 0.33, 0.3248), # Pied de Roi
    }
}

@dataclass
class Length:
    value: float
    unit: str
    region_period: str
    source: Optional[str] = None
    
    def to_meters(self) -> Tuple[float, float, float]:
        """Devuelve una tupla con (min, max, valor_tipico) en metros."""
        unit_key = self.unit.lower()
        rp_key = self.region_period.lower()
        
        if unit_key == "m" or unit_key == "meter":
            return (self.value, self.value, self.value)
            
        if unit_key in HISTORICAL_DB:
            if rp_key in HISTORICAL_DB[unit_key]:
                bounds = HISTORICAL_DB[unit_key][rp_key]
                return (self.value * bounds[0], self.value * bounds[1], self.value * bounds[2])
            else:
                # Si no conocemos la región, promediamos las conocidas
                all_bounds = HISTORICAL_DB[unit_key].values()
                min_m = min(b[0] for b in all_bounds)
                max_m = max(b[1] for b in all_bounds)
                typ_m = sum(b[2] for b in all_bounds) / len(all_bounds)
                return (self.value * min_m, self.value * max_m, self.value * typ_m)
        
        raise ValueError(f"Unidad histórica desconocida: {unit_key}")

    @property
    def typical_m(self) -> float:
        return self.to_meters()[2]

@dataclass
class Mass:
    value: float
    unit: str
    region_period: str
    source: Optional[str] = None
    
    def to_kg(self) -> float:
        # Simplificación para el prototipo
        if self.unit.lower() == "libra":
            return self.value * 0.329 # Libra romana/italiana aproximada
        if self.unit.lower() in ["kg", "kilogram"]:
            return self.value
        raise ValueError(f"Unidad de masa desconocida: {self.unit}")
