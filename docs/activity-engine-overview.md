# El Motor de Actividades — Visión General

## ¿Qué problema resuelve?

En un juego educativo tradicional, cada pregunta o ejercicio se programa por separado. Si quieres 500 actividades, necesitas programar 500 pantallas. Eso es caro, lento y difícil de mantener.

Nuestro motor resuelve esto con un principio simple:

> **El contenido vive en la base de datos. El código solo sabe cómo ejecutarlo.**

---

## La idea central

Imagina una máquina tragamonedas. La máquina siempre funciona igual — giras la palanca, aparecen símbolos, ganas o pierdes. Lo que cambia son los símbolos, no la máquina.

Nuestro motor funciona igual:

- La **máquina** es el `ActivityPlayer` — siempre igual, siempre funciona de la misma forma
- Los **símbolos** son las actividades — cada una con su pregunta, imagen, opciones y respuesta correcta

Para crear una nueva actividad, solo escribes sus datos. No hay que tocar el código.

---

## ¿Cómo se ve una actividad por dentro?

Una actividad es simplemente un JSON guardado en la base de datos:

```json
{
  "type": "CHOICE_SELECT",
  "prompt": {
    "instruction": "¿Con qué letra empieza FOCA?"
  },
  "stimulus": {
    "text": "FOCA",
    "imageUrl": "https://..."
  },
  "interaction": {
    "options": ["F", "M", "P", "S"]
  },
  "evaluation": {
    "correct_answer": "F"
  },
  "feedback": {
    "on_correct": "¡Muy bien!",
    "on_wrong": "Escucha el inicio: FO..."
  },
  "settings": {
    "attempts_limit": 2
  }
}
```

Eso es todo. El motor lee esto y sabe exactamente qué mostrar, qué aceptar como correcto y qué decirle al alumno.

---

## Los dos tipos de actividad disponibles

### Selección múltiple (`CHOICE_SELECT`)
El alumno ve botones con opciones y toca la correcta.

**Ideal para:** identificar letras, sílabas, palabras, elegir la opción correcta entre distractores.

### Escritura libre (`KEYBOARD_INPUT`)
El alumno escribe su respuesta en un campo de texto.

**Ideal para:** dictado, completar palabras, escribir la letra faltante.

---

## ¿Qué pasa cuando el alumno juega un nivel?

```
1. El alumno inicia sesión
2. Ve los niveles disponibles en su pantalla
3. Elige un nivel
4. El sistema carga las actividades de ese nivel desde la base de datos
5. El motor las ejecuta una por una:
      → muestra la pregunta
      → el alumno responde
      → el sistema evalúa y da feedback
      → si acierta o agota intentos, avanza
6. Al terminar todas, ve su puntuación final
7. El resultado se guarda automáticamente
```

---

## ¿Qué se guarda?

Por cada respuesta del alumno se guarda:
- Si acertó o no
- Cuántos intentos usó
- Cuánto tiempo tardó
- Qué respondió

Por cada nivel completado se guarda:
- El porcentaje de aciertos
- Cuántas actividades resolvió correctamente

Esto permite construir reportes de progreso, detectar en qué áreas tiene dificultades y personalizar la experiencia en el futuro.

---

## ¿Cómo se agregan más actividades o niveles?

Solo hay que insertar nuevos registros en la base de datos. No se toca el código de la aplicación.

Para agregar un nuevo **nivel**: insertar una fila en la tabla `levels`.

Para agregar una nueva **actividad**: insertar una fila en la tabla `activities` con su definición JSON.

El sistema lo muestra automáticamente la próxima vez que el alumno abre la aplicación.

---

## ¿Qué pasa si falla la conexión?

El motor está diseñado para que los problemas de red no interrumpan el juego. Si no puede guardar un resultado en la base de datos, muestra un aviso interno pero **el alumno puede seguir jugando** sin interrupciones.

---

## Capacidades actuales

| Capacidad | Estado |
|---|---|
| Actividades de selección múltiple | ✅ Disponible |
| Actividades de escritura | ✅ Disponible |
| Imágenes en actividades | ✅ Disponible |
| Múltiples intentos por actividad | ✅ Disponible |
| Variantes de respuesta aceptadas | ✅ Disponible |
| Feedback personalizado por actividad | ✅ Disponible |
| Guardado de progreso por nivel | ✅ Disponible |
| Mejor score por nivel en pantalla de inicio | ✅ Disponible |
| Nuevos tipos de actividad (arrastrar, emparejar, etc.) | 🔜 Extensible |
| Motor adaptativo (ajusta dificultad según desempeño) | 🔜 Extensible |
| Panel docente con reportes | 🔜 Extensible |

---

## En resumen

El motor permite escalar el contenido educativo de forma independiente al código. El equipo de contenido puede crear cientos de actividades sin depender del equipo de desarrollo, y el equipo técnico puede mejorar la plataforma sin tener que tocar cada actividad individualmente.
