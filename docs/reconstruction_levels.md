# Niveles de Reconstrucción

En Mechanica Antiqua, no basta con decir que hemos "reconstruido" una máquina. Necesitamos un lenguaje común para expresar **cuánta confianza histórica** tiene nuestro modelo. 

Por ello, cada máquina en el repositorio posee un Nivel de Reconstrucción asignado en sus metadatos, siguiendo esta escala:

### Nivel A: Reconstrucción Completamente Documentada
* **Fuente**: Textos con acotaciones precisas, unidades claras y dibujos técnicos coherentes.
* **Modelo**: Casi la totalidad de las medidas provienen de la fuente (*DOCUMENTADO*).
* **Intervención**: Mínima. El ingeniero moderno sólo aplica leyes de la física para comprobar el comportamiento (ej. estática, cinemática).
* *Ejemplo ideal*: Planos técnicos de finales del s. XVIII o descripciones muy rigurosas de la Antigüedad donde las proporciones están matemáticamente tabuladas (ej. Arquímedes o textos selectos de Vitruvio).

### Nivel B: Reconstrucción Parcialmente Inferida
* **Fuente**: Dibujos detallados o descripciones funcionales claras, pero con ausencias clave (faltan algunas medidas o detalles de la transmisión interna).
* **Modelo**: Las dimensiones principales están documentadas; las secundarias son *INFERIDAS* a partir de proporciones del dibujo o convenciones de la época.
* **Intervención**: El ingeniero debe cerrar el sistema asumiendo relaciones geométricas lógicas.
* *Ejemplo típico*: Los grandes tratados del Renacimiento (Ramelli, Agricola, Besson). La máquina es claramente comprensible, pero no se puede construir sin tomar algunas decisiones de diseño.

### Nivel C: Reconstrucción Paramétrica o Conceptual Fuerte
* **Fuente**: Bocetos, esquemas incompletos o textos ambiguos donde el principio de funcionamiento se entiende, pero la geometría exacta es completamente hipotética.
* **Modelo**: Dominan las dimensiones *SUPUESTAS* o *INFERIDAS* débilmente. 
* **Intervención**: La reconstrucción es principalmente un "espacio paramétrico". En lugar de fijar una medida, el modelo explora cómo se comportaría la máquina *si* tuviera ciertas dimensiones lógicas.
* *Ejemplo*: Muchos de los bocetos de Leonardo da Vinci o descripciones ambiguas de Herón.

### Nivel D: Interpretación Especulativa
* **Fuente**: Textos literarios, crónicas sin vocación técnica, o fragmentos arqueológicos muy aislados. 
* **Modelo**: Casi la totalidad de la máquina es *RECONSTRUIDA* basada en suposiciones de "lo que debió ser" según la tecnología de la época.
* **Intervención**: Máxima. El modelo sirve más para explorar si la anécdota histórica es físicamente plausible que para afirmar cómo era el artefacto real.
* *Ejemplo*: El autómata de águila de Regiomontano o algunas descripciones poéticas de máquinas medievales.

### Nivel E: Mecanismo Imposible
* **Fuente**: Dibujos que violan leyes físicas (como los móviles perpetuos de Fludd o Villard) o que poseen errores topológicos insalvables (engranajes que se bloquean a sí mismos).
* **Modelo**: Analítico enfocado en el fallo.
* **Intervención**: El objetivo de la reconstrucción es demostrar matemática o geométricamente *por qué* la máquina ilustrada no puede moverse o funcionar como fue reclamado.

---

Al navegar por las máquinas del proyecto, buscá siempre este nivel. Te dirá inmediatamente si estás frente a un plano fiel o frente a un rompecabezas interpretativo.
