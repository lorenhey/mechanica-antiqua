# Contribuir a Mechanica Antiqua

¡Gracias por interesarte en nuestro gabinete de curiosidades mecánicas!

Mechanica Antiqua es un proyecto abierto. Buscamos historiadores, ingenieros, traductores y programadores que quieran ayudar a reconstruir y validar las máquinas del pasado.

## Tipos de Contribuciones

1. **Añadir una nueva máquina**: Si conocés un mecanismo histórico interesante, podés crear una nueva carpeta en `machines/` con su ficha (`metadata.yaml`) y el modelo físico (`model.py`).
2. **Mejorar simulaciones existentes**: Muchas máquinas están en "Nivel C" o "Nivel D". Podés refinar los cálculos hidráulicos o cinemáticos.
3. **Traducciones y fuentes**: Si encontrás un error en la transcripción de un texto latino antiguo o en su traducción, por favor corregilo.
4. **Mejoras al motor `mechanica`**: Agregar nuevas funciones cinemáticas (ej. mecanismos de escape de relojería, levas complejas).

## El Principio Fundamental

**No inventes fuentes.** 
Cualquier contribución que modifique dimensiones, relaciones o parámetros de una máquina DEBE explicar si el dato es *DOCUMENTADO* o *INFERIDO*. Mantené la honestidad histórica. Revisá `docs/methodology.md` para más detalles.

## Flujo de Trabajo

1. Hacé un Fork del repositorio.
2. Creá una rama para tu máquina o corrección (`git checkout -b maquina-reloj-su-song`).
3. Escribí tu código. Asegurate de que los tests pasen (`make test`).
4. Hacé commit de tus cambios.
5. Abrí un Pull Request explicando qué máquina estás añadiendo y adjuntando enlaces a las fuentes digitalizadas originales (Internet Archive, Gallica, etc.).

¡Esperamos tu mecanismo!
