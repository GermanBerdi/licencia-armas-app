# Licencia Armas App - Contexto del Proyecto

## 📋 Descripción General
Aplicación React interactiva para practicar y prepararse para las pruebas teóricas de la Guardia Civil para obtener licencias de armas **D, E y AEM** (Autorización Especial de armas para menores).

## 🎯 Objetivos
1. Permitir al usuario resolver cuestionarios de práctica
2. Autocorrección automática de respuestas
3. Mostrar número de aciertos al finalizar cada cuestionario
4. Interfaz limpia y fácil de usar

## 📚 Información Oficial - Guardia Civil

### Referencia
- **URL oficial:** https://web.guardiacivil.es/es/tramites/autorizaciones-de-armas-y-explosivos/controldearmas/pruebas_licenciasarmas/Programa_prueba_teorica_D__E_y_AEM/
- **Normativa:** Resolución de 19 de octubre de 1998, ANEXO I (Dirección General de la Guardia Civil)

### Estructura de la Prueba
- **Total de preguntas:** 400 preguntas en la base oficial
- **Preguntas por examen:** 20 preguntas (formato oficial)
- **Formato:** Cada pregunta tiene 1 respuesta correcta y 2 respuestas incorrectas (opción múltiple)

### Distribución por Tema (20 preguntas de examen)
- **Tema 1:** 4 preguntas - Funcionamiento de armas, piezas, mecanismos, conservación
- **Tema 2:** 3 preguntas - Categoría de armas, semiautomáticas, prohibidas
- **Tema 3:** 3 preguntas - Circulación, revista, transferencia de armas
- **Tema 4:** 4 preguntas - Documentación, licencias, Tarjeta Europea de Armas de Fuego
- **Tema 5:** 3 preguntas - Régimen sancionador, infracciones, retirada de armas
- **Tema 6:** 3 preguntas - Reparación, prueba, depósito de armas
- **Tema 7:** 4 preguntas - Armas de colección, historia, calibres, munición

## 📁 Estructura del Proyecto

```
licencia-armas-app/
├── .git/                       # Repositorio Git inicializado
├── PROJECT_CONTEXT.md          # Este archivo (contexto del proyecto)
├── data/
│   └── cuestionarios/          # PDFs de los cuestionarios (descargados por el usuario)
│       ├── tema1_es.pdf
│       ├── tema1r_es.pdf       # Respuestas correctas
│       ├── tema2_es.pdf
│       ├── tema2r_es.pdf
│       └── ... (temas 3-7)
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── utils/
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── vite.config.js              # Configuración de Vite
```

## 🔄 Flujo de Trabajo

### Paso 1: Descarga de Cuestionarios
El usuario descarga los PDFs de los 7 temas desde la web oficial de la Guardia Civil.

**URLs de descargas directas (aproximadas):**
- Tema 1: `https://web.guardiacivil.es/export/sites/guardiaCivil/documentos/iarmas/temarios/tema1_es.pdf`
- Tema 1 Respuestas: `https://web.guardiacivil.es/export/sites/guardiaCivil/documentos/iarmas/temarios/tema1r_es.pdf`
- (Similar para temas 2-7)

### Paso 2: Conversión de PDFs
Los PDFs se convierten a un formato legible (JSON o texto):
- Usando herramienta online (ilovepdf.com) o
- Usando Python + pdfplumber localmente

### Paso 3: Estructura de Datos
Crear archivo JSON con estructura:
```json
{
  "temas": [
    {
      "id": 1,
      "nombre": "Funcionamiento de las armas",
      "preguntas": [
        {
          "id": 1,
          "texto": "¿Cuál es...?",
          "opciones": [
            { "id": "a", "texto": "Opción A", "correcta": true },
            { "id": "b", "texto": "Opción B", "correcta": false },
            { "id": "c", "texto": "Opción C", "correcta": false }
          ]
        }
      ]
    }
  ]
}
```

### Paso 4: Desarrollo React
- Componentes principales: QuizSelector, QuestionCard, Results
- Estado: preguntas, respuestas del usuario, puntuación
- Lógica de corrección automática

### Paso 5: Pruebas y Deploy

## 🛠 Stack Tecnológico Propuesto
- **Frontend:** React + Vite
- **Styling:** Tailwind CSS o CSS modules
- **State Management:** React Hooks (useState, useEffect)
- **Data Format:** JSON

## 📝 Próximos Pasos
1. ✅ Crear carpeta del proyecto e inicializar Git
2. ⏳ **Descargar los 7 PDFs de cuestionarios de la Guardia Civil**
3. ⏳ Convertir PDFs a JSON (el usuario o yo con herramienta)
4. ⏳ Inicializar proyecto React con Vite
5. ⏳ Crear estructura de datos JSON
6. ⏳ Desarrollar componentes React
7. ⏳ Implementar lógica de corrección y puntuación
8. ⏳ Estilizar la interfaz
9. ⏳ Pruebas funcionales

## 📅 Estado
- **Fecha de creación:** 2026-06-08
- **Repositorio:** `/home/berdi/Development/licencia-armas-app`
- **Git:** Inicializado

## 🎓 Funcionalidades Implementadas (por implementar)
- [ ] Selector de tema/cuestionario
- [ ] Interfaz para responder preguntas
- [ ] Corrección automática
- [ ] Pantalla de resultados con puntuación
- [ ] Navegación entre preguntas
- [ ] Feedback visual (respuesta correcta/incorrecta)

## 📌 Notas Importantes
- Los cuestionarios son **dominio público** según la Guardia Civil
- El examen oficial requiere 20 preguntas pero hay 400 preguntas disponibles para práctica
- Cada examen real tiene un tribunal que selecciona según la distribución temática
- Superar la prueba requiere resultado APTO (puntuación mínima a definir según normativa)

---

**Última actualización:** 2026-06-08
