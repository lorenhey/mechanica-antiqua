# Acerca de Mechanica Antiqua / About Mechanica Antiqua

[🇪🇸 Español](#acerca-de-mechanica-antiqua-es) · [🇬🇧 English](#about-mechanica-antiqua-en)

---

<a id="acerca-de-mechanica-antiqua-es"></a>
## 🇪🇸 Acerca de Mechanica Antiqua

> *"La máquina no comienza en el hierro ni en el bronce, sino en la mente del artífice que desafía la inercia del mundo con la geometría."*

### 1. El Manifiesto: La Ilusión del Grabado y la Realidad Mecánica

Durante siglos, los tratados técnicos —desde los manuscritos de la Escuela de Alejandría y los cuadernos de la Bagdad abasí hasta los fastuosos *Teatros de Máquinas* del Renacimiento tardío— transmitieron el conocimiento mecánico a través de ilustraciones y descripciones retóricas. Esos grabados poseen una belleza hipnótica y una aparente claridad pedagógica. Sin embargo, para el ingeniero mecánico moderno encierran una paradoja insoslayable: **la mayoría de las máquinas dibujadas no podían funcionar tal como fueron grabadas**.

Las razones de este desajuste son múltiples:
1. **Convenciones artísticas y perspectiva forzada**: Los grabadores de los siglos XVI y XVII (como los que ilustraron las obras de Ramelli, Zonca o Besson) solían violar la geometría proyectiva deliberadamente para exhibir engranajes ocultos o mecanismos internos dentro de un único punto de vista.
2. **El conocimiento tácito del taller**: Los tratados no eran manuales de taller para legos, sino demostraciones de ingenio dedicadas a mecenas nobles. Las tolerancias, la lubricación, el huelgo entre dientes, los cojinetes y la selección de maderas o bronces eran saberes tácitos del artesano que jamás se escribían.
3. **Fantasía e inventio**: Algunos ingenios eran concepciones puramente especulativas, experimentos mentales o incluso fraudes piadosos que desafiaban la conservación de la energía o la resistencia elemental de materiales.

**Mechanica Antiqua** nace para cerrar esta brecha. No nos proponemos modelar "objetos 3D vistosos" con texturas ficticias de óxido para la industria del entretenimiento. Nuestro propósito es **someter los textos y grabados históricos al escrutinio implacable de la física computacional, la cinemática de mecanismos y la termodinámica aplicada**.

### 2. Principio de Honestidad Histórica y Taxonomía Epistémica

La ingeniería aplicada a la historia corre el riesgo constante de cometer *anacronismo proyectivo*: rediseñar la máquina antigua utilizando herramientas modernas hasta convertirla en un mecanismo contemporáneo irreconocible para su creador.

Para evitar esta trampa metodológica, toda variable, cota o hipótesis en Mechanica Antiqua está etiquetada formalmente bajo cinco estados epistémicos innegociables:

| Estado | Definición Operativa |
| :--- | :--- |
| **DOCUMENTADO** | Consta explícitamente en el texto original, papiro, códice o en las acotaciones de la lámina histórica. |
| **INFERIDO** | No figura explícito en el texto, pero se deduce objetivamente a partir de proporciones del dibujo, reglas físicas o tecnología contemporánea comprobada. |
| **SUPUESTO** | Parámetro que debió introducirse arbitrariamente para cerrar el balance de masa, momento o energía (ej. coeficiente de rozamiento madera-bronce = 0.25). |
| **RECONSTRUIDO** | Geometría, perfil de diente o mecanismo cinemático adaptado estrictamente para permitir la operación física. |
| **DESCONOCIDO** | Lagunas documentales irresolubles que declaramos de forma abierta sin intentar disimularlas. |

### 3. La Cuestión Metrológica: El Problema de las Unidades Antiguas

Uno de los mayores desafíos del proyecto reside en la metrología pre-métrica. La tentación habitual de los historiadores es convertir un "pie" a $0.3048\text{ m}$. Sin embargo:
* El *piede veneto* de Ramelli rondaba entre $0.347\text{ m}$ y $0.355\text{ m}$.
* El *pes monetalis* romano era de aproximadamente $0.296\text{ m}$.
* El *pied de Roi* francés equivalía a $0.3248\text{ m}$.
* El *codo real egipcio* o el *cubit* babilónico poseían subdivisiones anatómicas no decimalizadas.

En el paquete `mechanica.units`, modelamos las magnitudes históricas no como escalares rígidos, sino como tuplas de incertidumbre $(\text{mínimo}, \text{máximo}, \text{típico})$. Cuando simulamos un ingenio, los motores evalúan su comportamiento en todo el rango admisible de la unidad local y de la época.

### 4. Alcance Global e Intercultural del Corpus

La historia de la técnica ha sufrido con frecuencia un sesgo eurocéntrico centrado casi con exclusividad en la Revolución Industrial británica y el Renacimiento italiano. Mechanica Antiqua concibe la tecnología como un fenómeno ecuménico de la especie humana.

El corpus abarca:
* Las tecnologías hidráulicas y neumáticas de la **Antigüedad helenística y romana** (Ctesibio, Herón, Filón, Vitruvio).
* La cibernética temprana, la automatización programable y los mecanismos de enlace de la **Edad de Oro del Islam** (Banū Mūsā, Al-Jazarī).
* La relojería hidromecánica, la transmisión diferencial y la balística de precisión de **China y Japón** (Su Song, Chariot, Zhuge Nu, Karakuri).
* La ingeniería de materiales no metálicos, la memoria digital y la hidrodinámica de las **civilizaciones andinas, mesoamericanas y africanas** (Q'eswachaka, Quipu, Huayra, Átlatl, Shaduf, Saqiya).
* Los ingenios mecánicos de la **minería centroeuropea y los teatros de máquinas** (Agricola, Besson, Ramelli, Zonca).
* La termodinámica embrionaria y el paso de la fuerza motriz biológica a la térmica en los albores de la **Revolución Industrial** (Papin, Savery, Newcomen, Leupold).

---

<a id="about-mechanica-antiqua-en"></a>
## 🇬🇧 About Mechanica Antiqua

> *"A machine does not begin in iron or bronze, but in the mind of the artificer who defies the inertia of the world with geometry."*

### 1. The Manifesto: The Illusion of the Plate and Mechanical Reality

For centuries, historical engineering treatises—from the papyri of the Alexandrian school and the manuscripts of Abbasid Baghdad to the lavish Renaissance *Theatres of Machines*—transmitted technological knowledge through engravings and rhetorical exposition. These plates possess hypnotic aesthetic elegance and apparent didactic lucidity. Yet to a modern mechanical engineer, they present an inescapable paradox: **most historical machines could not operate as drawn**.

The origins of this disconnect are clear:
1. **Artistic convention and distorted projection**: Draughtsmen and engravers of the 16th and 17th centuries (such as those illustrating the folios of Ramelli, Zonca, or Besson) intentionally broke projective geometry to depict hidden planetary gear trains or internal valves within a single perspective view.
2. **Tacit craft knowledge**: Historical treatises were rarely practical shop floor manuals; they were demonstrations of virtuosity dedicated to wealthy aristocratic patrons. Backlash, lubrication regimes, gear tooth form, bearing friction, and wood seasoning were tacit guild secrets that were never inscribed on paper.
3. **Speculative inventio**: Certain plates depicted thought experiments, rhetorical proofs of concept, or pious frauds that violated the conservation of energy or fundamental material yield limits.

**Mechanica Antiqua** was established to bridge this gulf. Our aim is not to build glossy 3D CAD models with faux rust shaders for entertainment media. Our mission is to **subject historical treatises and plates to the unsparing scrutiny of computational physics, mechanism kinematics, and applied engineering analysis**.

### 2. Historical Honesty and Epistemic Taxonomy

Applying contemporary engineering to historical artifacts carries the perpetual danger of *projective anachronism*: redesigning an ancient device with modern methods until it becomes unrecognizable to its original author.

To avoid this methodological trap, every dimension, variable, and hypothesis in Mechanica Antiqua is tagged under five rigid epistemic classes:

| Class | Operational Definition |
| :--- | :--- |
| **DOCUMENTED** | Explicitly stated in the primary text, manuscript, or engraved dimension markings. |
| **INFERRED** | Not explicitly noted, but derived from drawing proportions, physical necessity, or verified contemporary practice. |
| **ASSUMED** | A parameter that had to be introduced to close the governing balance equations (e.g., wood-on-bronze sliding friction coefficient = 0.25). |
| **RECONSTRUCTED** | Kinematic geometry, tooth profile, or structural linkage adapted strictly to allow physical motion. |
| **UNKNOWN** | Unresolvable evidentiary gaps that are declared openly without conjectural cosmetic patches. |

### 3. Historical Metrology: Propagating Pre-Metric Uncertainty

A recurring pitfall in historical engineering is naively mapping historic units to modern standards (such as assuming a "foot" is always $0.3048\text{ m}$). In reality:
* Ramelli's *piede veneto* was between $0.347\text{ m}$ and $0.355\text{ m}$.
* The Roman *pes monetalis* was approximately $0.296\text{ m}$.
* The French *pied de Roi* measured $0.3248\text{ m}$.
* The Egyptian *royal cubit* or Babylonian units were tied to non-decimalized anatomical systems.

In `mechanica.units`, historical quantities are represented as uncertainty envelopes: $(\text{minimum}, \text{maximum}, \text{typical})$. Analytical simulation scripts evaluate mechanical performance across the entire historical tolerance span.

### 4. Global Cross-Cultural Breadth

The history of technology has long suffered from an undue Eurocentric focus that privileged the British Industrial Revolution and the Italian Renaissance. Mechanica Antiqua approaches mechanics as a universal endeavor of human ingenuity across civilizations:

* **Greco-Roman Antiquity**: Vitruvius (water-lifting screw, water wheel), Heron of Alexandria (aeolipile), Philo (automatic vessel), Ctesibius (clepsydra, dual-cylinder pump), and Roman hydraulic masonry works.
* **Islamic Golden Age**: The Banū Mūsā brothers (pneumatic fountains, automated flute), Al-Jazarī (elephant water clock, double-acting piston pump with crank-slider linkage).
* **East & South Asia**: Su Song's astronomical water clock escapement, the South-Pointing Chariot with epicyclic differential gearing, the Zhuge repeating crossbow, Japanese Karakuri automata, and the Indian Charkha.
* **Pre-Columbian & African Traditions**: The Inca suspension bridge (catenary mechanics of handwoven grass cables), the Andean Huayra furnace, Quipu positional decimal encoding, the Mesoamerican Atlatl, and Nile irrigation engines.
* **European Middle Ages & Renaissance**: Villard de Honnecourt's spring-pole water-powered sawmill, Leonardo da Vinci's caged thrust bearings and globoidal worm drives, Francesco di Giorgio Martini's pumps and saws, and Gothic vaulted masonry statics.
* **Early Modern Theatres of Machines**: Ramelli's epicyclic book wheel and rotary vane water pump, Besson's screw-cutting machine, Zonca's mills, and Georgius Agricola's mining engines.
* **Early Industrial Steam Power**: Papin's atmospheric piston, Savery's vacuum displacement pump, Newcomen's beam engine, and Leupold's high-pressure dual-cylinder engine.

---

### Colaboración y Citación / Collaboration & Citation

Si utilizás Mechanica Antiqua en investigaciones académicas, publicaciones de divulgación o reconstrucciones mecánicas, podés citar el proyecto de acuerdo al archivo [CITATION.cff](CITATION.cff):

```bibtex
@software{mechanica_antiqua,
  author = {Perez, Lorenzo and Contributors},
  title = {Mechanica Antiqua: An Expanding Computational Corpus of Historical Machinery},
  url = {https://github.com/lorenhey/mechanica-antiqua},
  year = {2026}
}
```
