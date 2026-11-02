# Mechanica Antiqua

> Reconstrucción analítica de maquinaria histórica mediante ingeniería moderna.  
> *Historical machines reconstructed with modern engineering.*

[![CI](https://github.com/lorenhey/mechanica-antiqua/actions/workflows/ci.yml/badge.svg)](https://github.com/lorenhey/mechanica-antiqua/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Web](https://img.shields.io/badge/Catalog-GitHub_Pages-blue.svg)](https://lorenhey.github.io/mechanica-antiqua/)

[🇪🇸 Español](#mechanica-antiqua-es) · [🇬🇧 English](#mechanica-antiqua-en)

---

<a id="mechanica-antiqua-es"></a>
## 🇪🇸 Español

Un grabado antiguo tiene una cualidad incómoda: parece explicar una máquina perfectamente, hasta que uno intenta construirla.

Las líneas en una lámina renacentista de 1588 o las descripciones en un texto latino asumen saberes tácitos, ocultan problemas de fricción, ignoran la resistencia de los materiales y, a menudo, proponen geometrías que simplemente no pueden moverse.

**Mechanica Antiqua** es un laboratorio digital y corpus computacional abierto dedicado a interrogar estas máquinas. Tomamos mecanismos e ingenios descritos en tratados históricos e intentamos reconstruirlos utilizando herramientas de ingeniería moderna. No se trata de crear modelos 3D decorativos ni animaciones cinematográficas, sino de realizar una **reconstrucción razonada y auditable**.

Nos hacemos preguntas simples y despiadadas:
* ¿Puede este mecanismo cinemático girar sin trabarse?
* ¿Cuánta agua podría elevar realmente este tornillo o bomba de émbolo?
* ¿Qué proporción geométrica tuvo que ser inferida porque el autor omitió dibujarla o acotarla?

### El Espíritu del Proyecto

Este repositorio existe en la intersección de la historia de la técnica, la ingeniería mecánica, la filología y la programación científica.

Considerá este espacio como un cruce entre un viejo gabinete de curiosidades mecánicas y un taller de ingeniería moderno. Aquí conviven modelos en Python calculando trenes epicicloidales del Renacimiento, ecuaciones termodinámicas aplicadas a los primeros motores atmosféricos, sistemas hidráulicos islámicos medievales y estructuras de tensión andinas.

Nuestra regla fundamental es el **principio de honestidad histórica**: no inventamos dimensiones, no silenciamos las dudas y siempre separamos rigurosamente lo que está *documentado* en la fuente de lo que fue *inferido* o *supuesto* para posibilitar el cálculo físico.

### El Corpus (42 Máquinas Reconstruidas)

Actualmente, Mechanica Antiqua cuenta con 42 reconstrucciones analíticas completas distribuidas en múltiples civilizaciones y períodos históricos:

* **Antigüedad Clásica**: Vitruvio (tornillo de Arquímedes, rueda hidráulica), Herón de Alejandría (eolípila), Filón de Bizancio (lavamanos automático), Ctesibio (clepsidra de flujo constante, bomba impelente) y el acueducto romano por gravedad.
* **Edad de Oro Islámica**: Hermanos Banū Mūsā (fuente alternante, flauta mecánica automática), Al-Jazarī (reloj del elefante, bomba de doble émbolo con cigüeñal).
* **Asia Oriental y Meridional**: Mecanismo de escape hidráulico del reloj de torre de Su Song, carro chino que apunta al sur con diferencial epicicloidal, ballesta de repetición Zhuge, muñeca autómata Karakuri y la hiladora Charkha.
* **Tradiciones Precolombinas y Africanas**: Puente colgante de ichu inca (catenaria y tracción de fibras), horno de fundición por tiro eólico Huayra, codificación posicional del Quipu, átlatl mesoamericano (balística biomecánica), Shaduf y Saqiya de tracción animal del Nilo.
* **Edad Media y Renacimiento Europeo**: Aserradero hidráulico con biela y retorno de flecha de Villard de Honnecourt, cojinete de bolas en jaula y engranaje globoidal de Leonardo da Vinci, aserradero y bomba aspirante de Francesco di Giorgio Martini, y el sistema de arcos ojivales y contrafuertes de la catedral gótica.
* **Primera Edad Moderna (Teatros de Máquinas)**: Rueda de lectura con engranajes satélites y bomba rotativa de paletas de Agostino Ramelli, torno de cortar tornillos de Jacques Besson, molino de papel y machacador de mineral de Vittorio Zonca, y el tratado minero de Georgius Agricola (bomba de rosario, malacate reversible accionado por agua, molino de mazos, bomba aspirante e impulsora, y ventilador centrífugo).
* **Revolución Industrial Temprana**: El cilindro de pistón a vapor de Denis Papin, la máquina de vapor sin pistón de Thomas Savery (*The Miner's Friend*), el motor atmosférico de balancín de Thomas Newcomen y la bomba de vapor a alta presión con válvula de cuatro vías de Jacob Leupold.

### Estructura del Repositorio

* **`mechanica/`**: Biblioteca central en Python con motores analíticos de cinemática (`kinematics.py`), hidráulica y fluidos (`hydraulics.py`), estática y resistencia (`statics.py`), termodinámica (`thermodynamics.py`), estructuras geométricas (`geometry.py`) y propagación de incertidumbre de unidades históricas pre-métricas (`units.py`).
* **`machines/`**: Directorio de reconstrucciones individuales. Cada ingenio posee su `metadata.yaml` histórico, script de cálculo físico (`model.py`), esquema cinemático vectorial (`reconstruction.svg`) y registro visual fotorrealista/arqueológico (`realistic.jpg`).
* **`web/`**: Generador de catálogo web estático con Jinja2 para navegación cronológica y fichas técnicas.
* **`docs/`**: Documentación metodológica: [Metodología](docs/methodology.md), [Niveles de Reconstrucción (A-E)](docs/reconstruction_levels.md) y [Unidades Históricas](docs/historical_units.md).
* **`tests/`**: Suite de pruebas físicas y de software con `pytest`.

### Explorar el Catálogo en Vivo

El catálogo interactivo completo puede explorarse directamente en GitHub Pages:  
👉 **[lorenhey.github.io/mechanica-antiqua](https://lorenhey.github.io/mechanica-antiqua/)**

### Ejecución Local

Requisitos: Python 3.9 o superior.

```bash
git clone https://github.com/lorenhey/mechanica-antiqua.git
cd mechanica-antiqua
python -m venv .venv

# Activar entorno virtual
# En Windows:
.venv\Scripts\activate
# En Linux/macOS:
source .venv/bin/activate

# Instalar dependencias en modo editable
pip install -e .[dev]
```

Para recalcular todos los modelos y regenerar el sitio estático:
```bash
python web/generator.py
```

Para ejecutar los tests de verificación analítica:
```bash
python -m pytest
```

### Metodología y Niveles de Confianza

Clasificamos cada reconstrucción en una escala de cinco niveles (**A** a **E**):
* **Nivel A**: Documentación exhaustiva con cotas, materiales y principios físicos comprobados.
* **Nivel B**: Principio mecánico rigurosamente documentado; proporciones y dimensiones inferidas a partir de láminas o fuentes contemporáneas.
* **Nivel C**: Descripción conceptual o alegórica que requiere inferencias significativas de ingeniería para ser funcional.
* **Nivel D**: Ingenio hipotético o conjetural cuya viabilidad práctica original permanece en disputa.
* **Nivel E**: Máquina no funcional históricamente (ej. dispositivos de movimiento perpetuo o errores de trazado geométrico en el grabado).

Para más detalles sobre los criterios epistémicos, consultá [docs/methodology.md](docs/methodology.md) y [ABOUT.md](ABOUT.md).

### Licencia

* Código fuente y modelos matemáticos: Licencia [MIT](LICENSE).
* Textos, documentación y metadatos: [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/).
* Láminas históricas: Obras en Dominio Público procedentes de repositorios históricos y bibliotecas patrimoniales.

---

<a id="mechanica-antiqua-en"></a>
## 🇬🇧 English

An antique engraving has an uncomfortable quality: it appears to explain a machine perfectly, until one attempts to build it.

The engraved lines in a 1588 Renaissance folio or the textual descriptions in an ancient papyrus take tacit craft knowledge for granted, conceal friction issues, ignore material strength limits, and frequently propose geometries that simply cannot move.

**Mechanica Antiqua** is an open computational laboratory dedicated to interrogating these historical machines. We take mechanisms and engines documented in treatises across world history and reconstruct them using modern engineering principles. The objective is not to craft decorative 3D models or cinematic renders, but to conduct an **auditable, reasoned reconstruction**.

We ask simple, ruthless questions:
* Can this kinematic mechanism rotate without jamming?
* How much water could this piston pump or Archimedean screw actually lift?
* Which geometric proportions were missing from the treatise and had to be inferred to achieve physical motion?

### The Spirit of the Project

This repository stands at the crossroads of the history of technology, mechanical engineering, philology, and scientific computing.

Think of this space as a meeting ground between a Renaissance cabinet of mechanical curiosities and a modern engineering workshop. Here, Python models solve epicyclic gear ratios from early modern treatises, thermodynamic equations evaluate atmospheric steam cycles, and fluid dynamics analyze Islamic and Greco-Roman hydraulic automation.

Our guiding tenet is the **principle of historical honesty**: we never invent dimensions, we do not conceal unresolved ambiguities, and we strictly distinguish between what is *documented* in primary sources and what has been *inferred* or *assumed* to enable physical computation.

### The Corpus (42 Reconstructed Machines)

At present, Mechanica Antiqua encompasses 42 analytical reconstructions across major civilizations and historical eras:

* **Classical Antiquity**: Vitruvius (Archimedean screw, water wheel), Heron of Alexandria (aeolipile), Philo of Byzantium (automatic washbasin), Ctesibius (constant-flow clepsydra, force pump), and the Roman gravity-fed aqueduct.
* **Medieval Islamic Golden Age**: Banū Mūsā brothers (alternating fountain, programmable automatic flute), Al-Jazarī (elephant water clock, double-acting suction pump with crank-slider).
* **East & South Asia**: Su Song's water-driven astronomical clock escapement, the South-Pointing Chariot with epicyclic differential gearing, the Zhuge repeating crossbow, the Japanese Karakuri mechanised doll, and the Indian Charkha spinning wheel.
* **Pre-Columbian & African Traditions**: The Inca suspension bridge (*q'eswachaka* catenary mechanics), the Andean Huayra wind furnace, Quipu positional decimal memory encoding, the Mesoamerican spearthrower (*atlatl* ballistics), and Nile irrigation systems (Shaduf and Saqiya).
* **European Middle Ages & Renaissance**: Villard de Honnecourt's water-powered sawmill with spring-pole return, Leonardo da Vinci's caged ball thrust bearing and globoidal worm gear, Francesco di Giorgio Martini's hydraulic saw and piston pump, and the rib-vault and flying-buttress system of the Gothic cathedral.
* **Early Modern Theatres of Machines**: Agostino Ramelli's epicyclic book wheel and rotary vane pump, Jacques Besson's screw-cutting lathe, Vittorio Zonca's paper mill and stamp battery, and Georgius Agricola's *De Re Metallica* suite (chain pump, reversible water-wheel hoist, ore stamping mill, piston suction pump, and centrifugal mine ventilator).
* **Early Industrial Revolution**: Denis Papin's steam cylinder and piston, Thomas Savery's condensing steam water pump (*The Miner's Friend*), Thomas Newcomen's atmospheric beam engine, and Jacob Leupold's high-pressure two-cylinder steam engine with four-way valve.

### Repository Architecture

* **`mechanica/`**: Core Python package containing analytical engines: kinematics (`kinematics.py`), hydraulics and fluid flow (`hydraulics.py`), structural statics (`statics.py`), thermodynamics (`thermodynamics.py`), parametric geometry (`geometry.py`), and historical pre-metric unit uncertainty propagation (`units.py`).
* **`machines/`**: Machine directories. Each contains machine metadata (`metadata.yaml`), mathematical physics model (`model.py`), parametric SVG kinematic diagram (`reconstruction.svg`), and realistic visual/archaeological reference (`realistic.jpg`).
* **`web/`**: Static site generator using Jinja2 for catalog publishing and technical dossiers.
* **`docs/`**: Methodological framework: [Methodology](docs/methodology.md), [Reconstruction Levels (A-E)](docs/reconstruction_levels.md), and [Historical Units](docs/historical_units.md).
* **`tests/`**: Automated verification test suite using `pytest`.

### Explore the Live Catalog

The interactive catalog is deployed on GitHub Pages:  
👉 **[lorenhey.github.io/mechanica-antiqua](https://lorenhey.github.io/mechanica-antiqua/)**

### Local Setup & Execution

Prerequisites: Python 3.9+.

```bash
git clone https://github.com/lorenhey/mechanica-antiqua.git
cd mechanica-antiqua
python -m venv .venv

# Activate virtual environment
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

# Install in editable mode
pip install -e .[dev]
```

To recompute models and rebuild the static website:
```bash
python web/generator.py
```

To run test validations:
```bash
python -m pytest
```

### Reconstruction Confidence Levels

Each reconstruction is indexed on a five-tier confidence scale (**A** to **E**):
* **Level A**: Rigorously documented with clear dimensions, known materials, and experimentally verified physics.
* **Level B**: Operating principle verified in primary sources; dimensions and exact proportions inferred from plates or contemporary engineering practice.
* **Level C**: Conceptual or allegorical drawing requiring significant engineering inferences to function.
* **Level D**: Conjectural or hypothetical machine whose practical historical operation remains contested.
* **Level E**: Historically non-viable device (e.g., perpetual motion claims or geometric draughting errors in original plates).

See [docs/methodology.md](docs/methodology.md) and [ABOUT.md](ABOUT.md) for full epistemological guidelines.

### License

* Source code and computational models: [MIT License](LICENSE).
* Written documentation, articles, and metadata: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
* Historical plate engravings: Public Domain collections.

---
*Que la fuerza de los engranajes y la presión del vapor te sean propicias.*  
*May the force of the gears and the pressure of the steam be ever in your favor.*
