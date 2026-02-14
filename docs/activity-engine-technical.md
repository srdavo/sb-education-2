# Activity Engine — Documentación Técnica

## ¿Qué es?

El Activity Engine es el sistema que permite ejecutar actividades educativas interactivas definidas completamente por datos. La aplicación no tiene lógica hardcodeada de "qué pregunta hacer" ni "qué respuesta es correcta" — todo eso vive en la base de datos. El código solo sabe **cómo ejecutar** una actividad, no **qué** actividad ejecutar.

---

## Arquitectura general

```
Base de datos (Supabase)
        │
        │  activities.definition (JSONB)
        ▼
   PlayView.vue
        │  carga actividades por nivel
        │  crea sesión
        ▼
  ActivityPlayer.vue  ◄──── máquina de estados
        │
        │  resuelve tipo
        ▼
 templateRegistry.js
        │
        ├── CHOICE_SELECT ──► ChoiceSelectTemplate.vue
        └── KEYBOARD_INPUT ──► KeyboardInputTemplate.vue
                │
                │  emite submit(payload)
                ▼
         ActivityPlayer evalúa
                │
                ▼
        resultsRecorder.js ──► activity_results (Supabase)
```

---

## Componentes y su responsabilidad

### `engine/playerStates.js`

Define los 6 estados posibles de una actividad:

| Estado | Descripción |
|---|---|
| `LOADING` | Actividad cargando o reseteando |
| `READY` | Lista para empezar (transitorio) |
| `ACTIVE` | El usuario puede interactuar |
| `EVALUATING` | Se está procesando la respuesta |
| `FEEDBACK` | Se muestra si fue correcto o incorrecto |
| `COMPLETED` | Actividad terminada, aparece botón "Siguiente" |

Estas transiciones son estrictas. El template solo puede actuar cuando el estado es `ACTIVE`. Esto evita dobles envíos y estados ambiguos.

---

### `engine/sessionEngine.js`

Gestiona el ciclo de vida de una sesión de juego.

**`createSession({ userId, level, activities })`**
Crea un objeto sesión con:
- `id` — UUID único para rastrear la sesión en resultados
- `queue` — array de ActivityDefinitions a ejecutar
- `current_index` — puntero a la actividad actual
- `results` — array que acumula resultados por actividad

**`advanceSession(session, result)`**
Agrega el resultado al historial e incrementa `current_index`.

**`isSessionComplete(session)`**
Retorna `true` cuando `current_index >= queue.length`.

**`getSessionScore(session)`**
Calcula `{ correct, total, percentage }` sobre los resultados acumulados.

---

### `engine/resultsRecorder.js`

Persistencia desacoplada de la UX. Si Supabase falla, el juego continúa.

**`recordActivityResult(result)`**
Guarda en la tabla `activity_results`:
```js
{
  user_id, activity_id, session_id,
  attempts_count, correct,
  time_spent_ms, hints_used,
  answer_submitted
}
```

**`recordLevelCompletion({ userId, level, score })`**
Guarda en `level_completions` cuando el usuario termina todas las actividades de un nivel. Solo registra `score_percentage`, `correct_count` y `total_count`.

---

### `components/player/templateRegistry.js`

Diccionario que mapea el campo `type` de una actividad al componente Vue correspondiente:

```js
{
  CHOICE_SELECT: ChoiceSelectTemplate,
  KEYBOARD_INPUT: KeyboardInputTemplate
}
```

Para agregar un nuevo tipo de actividad basta con:
1. Crear el componente template
2. Agregar la entrada en este diccionario
3. El `ActivityPlayer` lo resolverá automáticamente

---

### `components/player/ActivityPlayer.vue`

El orquestador principal. Es un componente universal que puede ejecutar cualquier actividad compatible.

**Props:**
- `activity` — ActivityDefinition completa
- `userId` — para registrar el resultado
- `sessionId` — para asociar el resultado a la sesión

**Eventos emitidos:**
- `completed(result)` — cuando la actividad termina (acierto o intentos agotados)
- `next` — cuando el usuario pulsa "Siguiente"

**Flujo interno:**

```
1. Watch detecta cambio de activity.id
2. resetForNewActivity() → estado LOADING → ACTIVE
3. Template dinámico se monta con :key=activity.id
4. Usuario interactúa → template emite submit(payload)
5. evaluate(submission):
   a. EVALUATING → normaliza respuesta
   b. Compara con correct_answer y accepted_variants
   c. FEEDBACK → muestra mensaje
   d. Si correcto o intentos agotados → guarda resultado → COMPLETED
   e. Si incorrecto y quedan intentos → vuelve a ACTIVE tras 350ms
6. Usuario pulsa "Siguiente" → emite 'next'
```

**Reset con `:key=activity.id`**
El template dinámico usa `:key="activity.id"`. Esto fuerza a Vue a destruir y recrear el componente del template al cambiar de actividad, eliminando cualquier estado interno residual (inputs, selecciones). Sin esto ocurre *state bleed*.

**Normalización de respuestas:**
Si `settings.case_sensitive` es `false`, tanto la respuesta del usuario como la correcta se convierten a mayúsculas antes de comparar. Los `accepted_variants` también se normalizan.

---

### Templates

Un template implementa la mecánica de interacción. Contrato mínimo:

- Recibe `activity` y `attemptsUsed` como props
- Renderiza los controles de interacción
- Emite `submit({ answer, attemptsUsed })` al confirmar
- **No evalúa**, **no navega**, **no persiste** — eso es responsabilidad del Player

#### `ChoiceSelectTemplate.vue`
Lee `activity.interaction.options`, opcionalmente los mezcla si `shuffle_choices: true`, y al hacer clic en una opción emite `submit`.

#### `KeyboardInputTemplate.vue`
Muestra un `<input>` con `maxlength` tomado de `interaction.input_rules.maxChars`. Al enviar el formulario emite `submit`. Resetea el input al cambiar de actividad.

---

### `views/PlayView.vue`

Vista que orquesta la sesión completa.

**Ciclo de vida:**
1. `onMounted` — consulta Supabase: `activities` filtradas por `level`
2. Crea la sesión con `createSession`
3. Renderiza `ActivityPlayer` con `currentActivity`
4. `onActivityCompleted(result)` — guarda en `pendingResult` (no avanza aún)
5. `onNext()` — llama `advanceSession` y verifica si la sesión terminó
6. Si terminó → calcula score → `recordLevelCompletion` → muestra pantalla de resultados

**¿Por qué `pendingResult`?**
Si el índice avanzara en `onActivityCompleted`, `currentActivity` pasaría a `null` antes de que el usuario pulsara "Siguiente", y el `watch` del Player intentaría leer `null.id` → crash. El índice solo avanza cuando el usuario confirma con "Siguiente".

---

## ActivityDefinition — Contrato de datos

Cada actividad en Supabase es una fila en la tabla `activities` con un campo `definition` de tipo JSONB:

```json
{
  "id": "string único",
  "type": "CHOICE_SELECT | KEYBOARD_INPUT",
  "level": 1,
  "tags": ["etiqueta_pedagógica"],

  "prompt": {
    "title": "Título visible",
    "instruction": "Instrucción al usuario"
  },

  "stimulus": {
    "text": "Texto o emoji a mostrar",
    "imageUrl": "URL de imagen (opcional)"
  },

  "interaction": {
    "mode": "choices | keyboard",
    "options": ["A", "B", "C"],
    "input_rules": { "maxChars": 4 }
  },

  "evaluation": {
    "correct_answer": "RESPUESTA",
    "accepted_variants": ["respuesta", "Respuesta"]
  },

  "feedback": {
    "on_correct": "Mensaje si acierta",
    "on_wrong": "Mensaje si falla"
  },

  "settings": {
    "attempts_limit": 2,
    "shuffle_choices": true,
    "case_sensitive": false
  }
}
```

---

## Composables con TanStack Query

### `composables/useLevels.js`
Obtiene la lista de niveles desde la tabla `levels`. `staleTime: Infinity` porque los niveles no cambian durante la sesión de uso.

### `composables/useLevelCompletions.js`
Obtiene los completions del usuario actual desde `level_completions`. Solo se activa si hay un `userId` (`enabled`). Reduce los resultados a un objeto `{ [levelId]: mejorScore }`.

---

## Cómo agregar un nuevo tipo de actividad

1. Crear `src/components/templates/MiNuevoTemplate.vue`
   - Props: `activity`, `attemptsUsed`
   - Emits: `submit({ answer, attemptsUsed })`
2. Registrar en `templateRegistry.js`:
   ```js
   MI_NUEVO_TIPO: MiNuevoTemplate
   ```
3. Insertar actividades en Supabase con `"type": "MI_NUEVO_TIPO"`

No hay que tocar `ActivityPlayer`, `PlayView`, ni `sessionEngine`.

---

## Tablas en Supabase

| Tabla | Propósito |
|---|---|
| `levels` | Catálogo de niveles (id, label, description, sort_order) |
| `activities` | Catálogo de actividades (id, level, type, definition JSONB) |
| `activity_results` | Registro de cada respuesta del usuario |
| `level_completions` | Registro de cada vez que un usuario completa un nivel |

---

## Errores comunes y su solución

| Error | Causa | Solución |
|---|---|---|
| `Cannot read properties of null (reading 'id')` | El índice avanzó antes de que el usuario pulsara "Siguiente" | Usar `pendingResult` — solo avanzar en `onNext` |
| Template no aparece | Mismatch de clave en registry (`choice_select` vs `CHOICE_SELECT`) | Verificar que `activity.type` coincida exactamente con la clave del registry |
| Estado `COMPLETED` heredado | Falta `:key=activity.id` en el template dinámico | Siempre usar `:key` para forzar remount |
| Actividades no cargan | Constraint `level between 1 and 4` en DB | Ampliar el constraint con `ALTER TABLE` |
