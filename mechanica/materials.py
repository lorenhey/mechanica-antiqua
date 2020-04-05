"""
Material properties for historical reconstruction.
"""

class Material:
    def __init__(self, name, density, tensile_strength, youngs_modulus):
        self.name = name
        self.density = density # kg/m^3
        self.tensile_strength = tensile_strength # Pa
        self.youngs_modulus = youngs_modulus # Pa

# Properties for Ichu Grass (Stipa ichu) braided rope
ICHU_GRASS_ROPE = Material(
    name="Ichu Grass Rope",
    density=700.0,
    tensile_strength=15e6,
    youngs_modulus=500e6
)
