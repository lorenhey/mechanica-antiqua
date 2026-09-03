# Mechanica Antiqua

> Historical machines reconstructed with modern engineering.

Un grabado antiguo tiene una cualidad incómoda: parece explicar una máquina perfectamente, hasta que uno intenta construirla. 

Las líneas en una lámina de 1588 o las descripciones en un texto latino asumen saberes tácitos, ocultan problemas de fricción, ignoran la resistencia de los materiales y, a menudo, proponen geometrías que simplemente no pueden moverse.

**Mechanica Antiqua** es un laboratorio digital dedicado a interrogar estas máquinas. Tomamos mecanismos e ingenios descritos en tratados históricos e intentamos reconstruirlos utilizando herramientas de ingeniería moderna. No se trata de crear modelos 3D atractivos o animaciones cinematográficas, sino de realizar una *reconstrucción razonada*. 

Nos hacemos preguntas simples y despiadadas: ¿Puede este mecanismo girar sin trabarse? ¿Cuánta agua podría elevar realmente este tornillo? ¿Qué proporción geométrica tuvo que ser inventada por nosotros porque el autor olvidó dibujarla?

## El Espíritu del Proyecto

Este repositorio existe en la intersección de la historia de la técnica, la ingeniería mecánica, la filología y la programación científica.

Considerá este espacio como un cruce entre un viejo gabinete de curiosidades y un taller mecánico moderno. Aquí encontrarás código Python calculando trenes epicicloidales del Renacimiento, ecuaciones de termodinámica aplicadas a motores de la Revolución Industrial, y bombas de succión de la Edad de Oro del Islam.

Nuestra regla fundamental es el **principio de honestidad histórica**: no inventamos dimensiones, no silenciamos las dudas y siempre separamos claramente lo que está *documentado* en la fuente de lo que fue *inferido* por nosotros para que la máquina pueda funcionar en la pantalla.

## El Corpus

Actualmente Mechanica Antiqua es un corpus computacional en expansión que contiene decenas de reconstrucciones (más de 25 máquinas) de diversos períodos:
* **Antigüedad**: Vitruvio, Herón de Alejandría, Filón, Ctesibio.
* **Edad de Oro Islámica**: Banū Mūsā, al-Jazarī.
* **Edad Media y Renacimiento**: Villard de Honnecourt, Leonardo da Vinci, Francesco di Giorgio Martini.
* **Primera Edad Moderna**: Georgius Agricola, Agostino Ramelli, Jacques Besson, Vittorio Zonca.
* **Revolución Industrial Temprana**: Denis Papin, Thomas Savery, Thomas Newcomen, Jacob Leupold.

## ¿Qué contiene el repositorio?

* **`mechanica/`**: Una biblioteca Python minimalista. Contiene los motores matemáticos para resolver cinemática de mecanismos, física hidráulica y generación de geometría, así como un sistema para manejar la endiablada incertidumbre de las unidades de medida históricas.
* **`machines/`**: Las reconstrucciones en sí. Cada máquina tiene su propia carpeta con metadatos, referencias, transcripciones y el script que la trae a la vida.
* **`web/`**: El generador de sitio estático. Porque una colección así merece ser explorada visualmente.
* **`docs/`**: Nuestra metodología. Cómo lidiamos con la incertidumbre, cómo clasificamos los niveles de reconstrucción y cómo tratamos las unidades antiguas.

## Explorar las Máquinas

Para recorrer el proyecto y ver las máquinas en acción, podés explorar el sitio generado:

*(Próximamente URL o instrucciones para abrir `site/index.html`)*

## Ejecutar el Laboratorio Localmente

Para clonar y correr Mechanica Antiqua en tu propia computadora, necesitarás Python 3.9 o superior.

```bash
git clone https://github.com/tu-usuario/mechanica_antiqua.git
cd mechanica_antiqua
python -m venv .venv
# En Windows: .venv\Scripts\activate
# En Unix: source .venv/bin/activate
pip install -e .[dev]
```

Para regenerar las simulaciones, los modelos matemáticos y compilar el sitio web estático:

```bash
make all
```

Para correr las pruebas físicas y de software (verificando, por ejemplo, que las bombas no generen materia espontáneamente):

```bash
make test
```

## Metodología y Niveles de Reconstrucción

No todas las reconstrucciones son iguales. Algunas fuentes proveen cotas milimétricas; otras son poco más que un garabato conceptual. Hemos establecido un sistema de [Niveles de Reconstrucción](docs/reconstruction_levels.md) (A-E) para clasificar la confianza histórica de cada modelo. Te invitamos a leer nuestra [Metodología](docs/methodology.md) para entender cómo tomamos decisiones cuando la fuente calla.

## Licencia

El código de simulación y el motor `mechanica` se distribuyen bajo la licencia [MIT](LICENSE). El texto original y la documentación se ofrecen bajo [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Las imágenes históricas provienen de colecciones de dominio público; por favor, respetá los derechos indicados en cada ficha particular si deseás reutilizarlas.

---
*Que la fuerza de los engranajes y la presión del vapor te sean propicias.*
