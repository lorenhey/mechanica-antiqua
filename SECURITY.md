# Políticas de Seguridad

Mechanica Antiqua es un repositorio puramente científico, histórico y educacional de simulaciones offline y generación de sitios estáticos. No manejamos bases de datos de usuarios, pasarelas de pago, ni servicios en la nube activos que expongan información personal.

## Versiones Soportadas

Actualmente, solo la versión `1.x` recibe parches de seguridad si se descubre alguna vulnerabilidad en la cadena de dependencias (por ejemplo, en `Jinja2` o dependencias de `numpy`).

| Versión | Soportada          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reportar una Vulnerabilidad

Si encontrás algún riesgo de seguridad en la forma en que el generador web compila el HTML o en las dependencias instaladas:

1. Por favor, **no abras un issue público** inmediatamente.
2. Enviá un correo a la dirección provista en el archivo `pyproject.toml` (o contactá a los mantenedores de forma privada).
3. Evaluaremos el reporte y aplicaremos el parche correspondiente en la biblioteca, dándote el crédito por el hallazgo.
