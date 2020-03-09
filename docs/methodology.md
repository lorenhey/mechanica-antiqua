# Metodología de Reconstrucción

En *Mechanica Antiqua*, reconstruir una máquina antigua no significa simplemente "dibujarla en 3D". Significa someter un documento histórico al escrutinio implacable de la física y la geometría modernas. 

Para lograr esto sin falsificar la historia, nos guiamos por los siguientes principios metodológicos:

## 1. Principio de Honestidad Histórica
**Bajo ninguna circunstancia inventamos evidencia.** 
Si el autor original no indicó el número de dientes de un engranaje, nuestra reconstrucción debe declarar explícitamente: "El número de dientes fue *inferido* por nosotros para permitir el cálculo cinemático". 

Toda medida, afirmación o comportamiento se clasifica en una de estas categorías, y así debe quedar registrado en el código y en la ficha de la máquina:
* **DOCUMENTADO**: Aparece explícitamente en el texto original o en las acotaciones de la lámina.
* **INFERIDO**: No está explícito, pero se deduce razonablemente a partir de proporciones del dibujo, leyes físicas o el contexto tecnológico de la época (ej. "el diámetro del eje se asume en 0.15m por la proporción visual respecto a la rueda de 2m").
* **SUPUESTO**: Información que debió ser introducida arbitrariamente para completar un cálculo o simulación (ej. "Se asumió una fricción de 0.2 para los apoyos de madera").
* **RECONSTRUIDO**: Una geometría o parte que ha sido modernizada o adaptada basándose en las premisas anteriores.
* **DESCONOCIDO**: Lo que definitivamente no sabemos y no intentamos maquillar.

## 2. El Texto Original y la Imagen
Consideramos que tanto el texto como la imagen (grabado, dibujo) son fuentes primarias, pero a menudo se contradicen. Los artistas renacentistas, por ejemplo, solían alterar la perspectiva para mostrar piezas ocultas, distorsionando proporciones reales. 
Cuando texto e imagen entran en conflicto, la reconstrucción documentará ambos y el ingeniero deberá tomar una decisión justificada sobre cuál priorizar. Las transcripciones y las traducciones de fragmentos clave nunca reemplazan al original; siempre se muestran de manera yuxtapuesta.

## 3. Análisis sobre Estética
El objetivo de nuestros modelos no es el fotorealismo. No agregamos texturas de "madera gastada" ni "óxido falso". La estética del proyecto busca reflejar su naturaleza analítica. Geometría pura, vectores, diagramas cinemáticos y datos en crudo. Preferimos un diagrama 2D matemáticamente riguroso antes que un modelo 3D lleno de suposiciones decorativas.

## 4. Unidades de Medida y Parámetros
Nos esforzamos por realizar el análisis en las unidades originales (pies, palmos, libras) siempre que sea posible, utilizando nuestro propio módulo `mechanica.units` para propagar la incertidumbre espacial y temporal asociada a ellas (un *piede* veneciano del siglo XVI no mide lo mismo que un *pied* parisino del XVIII). 
Las conversiones al Sistema Internacional (SI) se realizan internamente para calcular la física subyacente, pero la interfaz siempre intentará presentar los datos dialogando con el idioma de su creador.

## 5. El Contraste Físico
La etapa final de cualquier reconstrucción es el contraste crítico. Si Vitruvio afirma que una máquina eleva cierta cantidad de agua, nuestro modelo hidráulico evalúa esa afirmación. Si el modelo dice que es imposible, investigamos por qué. ¿Estaba mintiendo el autor? ¿Era la afirmación puramente teórica? ¿O, quizás, son nuestras asunciones modernas de rozamiento e ineficiencia las que están equivocadas?

Este proceso de duda bidireccional es el corazón del proyecto.
