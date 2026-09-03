# Unidades Históricas en Mechanica Antiqua

Uno de los mayores errores en la historia de la ingeniería es asumir que un "pie" (foot, piede, pied, fuß) de un tratado antiguo equivale exactamente a 0.3048 metros. La estandarización es un invento reciente. Antes del sistema métrico, las unidades de medida variaban salvajemente no solo entre países, sino entre ciudades vecinas e incluso dentro de la misma ciudad dependiendo del gremio.

Para mantener el principio de honestidad histórica, Mechanica Antiqua implementa un sistema de gestión de unidades (en `mechanica/units.py`) que maneja la incertidumbre.

## Cómo funciona nuestro sistema

Nunca asignamos un valor escalar simple a una unidad histórica. En cambio, utilizamos la clase `HistoricalUnit`, que requiere contexto:

```python
from mechanica.units import Length

rueda_diametro = Length(
    value=4.5, 
    unit="piede", 
    region="Italy_Veneto", 
    period="16th_century",
    source="Agostino Ramelli, 1588"
)
```

Cuando el motor de cálculo necesita convertir esto a metros para resolver una ecuación cinemática, el sistema busca en su base de datos topográfica. Si encuentra el equivalente exacto para esa región y época (por ejemplo, el *piede veneto* de 0.347 m), lo utiliza. 

Sin embargo, si la región exacta es incierta, el sistema asume un rango empírico (por ejemplo, el *pie europeo general* que oscila entre 0.28m y 0.35m). El resultado de nuestra simulación no será entonces un número exacto, sino un intervalo de confianza: "El caudal de la bomba se estima entre 45 y 65 litros por minuto".

## Unidades Documentadas Actualmente

Nuestra base de datos incrustada contiene definiciones operativas para:

* **Piede (Italia, Renacimiento):** Variaciones desde el Piede Romano (0.296m) hasta el Piede Veneto (0.347m).
* **Pied de Roi (Francia):** Aprox. 0.3248m.
* **Braccio (Italia):** Extremadamente variable. El Braccio florentino (0.58m) vs el milanés (0.59m).
* **Digit / Dedo / Digitus:** Submúltiplos del pie.

## La Trampa de las Proporciones

Afortunadamente, muchas máquinas antiguas no dependen de medidas absolutas para su análisis cinemático. Las relaciones de transmisión y las ventajas mecánicas a menudo dependen puramente de **proporciones** (relación entre el diámetro $D_1$ y $D_2$). 

Cuando una simulación dependa únicamente de proporciones, nuestro motor ignorará el valor métrico absoluto y operará algebraicamente, eliminando el error introducido por la conversión de unidades.
