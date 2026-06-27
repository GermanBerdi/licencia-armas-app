import { useState } from 'react'
import tema1 from './data/tema1.json'
import tema2 from './data/tema2.json'
import tema3 from './data/tema3.json'
import tema4 from './data/tema4.json'
import tema5 from './data/tema5.json'
import tema6 from './data/tema6.json'
import tema7 from './data/tema7.json'
import temarioEstudio from './data/temarioEstudio.json'
import temarioCompleto from './data/temarioCompleto.json'
import './App.css'

const TEMAS = [tema1, tema2, tema3, tema4, tema5, tema6, tema7]

const TODOS_LOS_TEMAS = [
  { id: 1, nombre: 'Mecánica y seguridad de las armas', cargado: true, podcast: '/audios/tema1.m4a' },
  { id: 2, nombre: 'Categoría de Armas', cargado: true, podcast: '/audios/tema2.m4a' },
  { id: 3, nombre: 'Circulación y Transferencia', cargado: true, podcast: '/audios/tema3.m4a' },
  { id: 4, nombre: 'Documentación y Licencias', cargado: true, podcast: '/audios/tema4.m4a' },
  { id: 5, nombre: 'Régimen Sancionador', cargado: true, podcast: '/audios/tema5.m4a' },
  { id: 6, nombre: 'Reparación y Depósito', cargado: true, podcast: '/audios/tema6.m4a' },
  { id: 7, nombre: 'Armas de Colección e Historia', cargado: true, podcast: '/audios/tema7.m4a' },
]

const DISTRIBUCION_EXAMEN = { 1: 4, 2: 3, 3: 3, 4: 4, 5: 3, 6: 3 }

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5)
}

function construirSimulacro(temasDisponibles) {
  const porTema = new Map(temasDisponibles.map(t => [t.id, t.preguntas]))
  const seleccion = []

  Object.entries(DISTRIBUCION_EXAMEN).forEach(([temaId, cantidad]) => {
    const preguntasTema = porTema.get(Number(temaId)) || []
    const muestreo = shuffle(preguntasTema).slice(0, cantidad).map(p => ({ ...p, temaId: Number(temaId) }))
    seleccion.push(...muestreo)
  })

  if (seleccion.length < 20) {
    const idsActuales = new Set(seleccion.map(p => p.id))
    const bolsa = temasDisponibles
      .flatMap(t => t.preguntas.map(p => ({ ...p, temaId: t.id })))
      .filter(p => !idsActuales.has(p.id))
    const faltan = 20 - seleccion.length
    seleccion.push(...shuffle(bolsa).slice(0, faltan))
  }

  return shuffle(seleccion).slice(0, 20)
}

function abrirExplicacionChatGPT(pregunta, seleccionadaId) {
  const correcta = pregunta.opciones.find(o => o.correcta)
  const opcionesTexto = pregunta.opciones
    .map(o => `${o.id.toUpperCase()}) ${o.texto}`)
    .join(', ')

  const marcado = seleccionadaId
    ? `marqué la opción ${seleccionadaId.toUpperCase()}) "${pregunta.opciones.find(o => o.id === seleccionadaId).texto}"`
    : 'no llegué a responderla'

  const prompt = `Estoy preparándome para sacarme la licencia de armas. En el cuestionario oficial aparece la siguiente pregunta: "${pregunta.texto}". Las opciones son: ${opcionesTexto}. Yo ${marcado} y la correcta es la ${correcta.id.toUpperCase()}) "${correcta.texto}". Explícame en un párrafo por qué las otras dos opciones están mal y por qué la correcta es la ${correcta.id.toUpperCase()}.`

  window.open(`https://chatgpt.com/?q=${encodeURIComponent(prompt)}`, '_blank')
}

function Quiz({ preguntas, onFinish, onRetry, temaId, passThreshold = 12 }) {
  const [respuestas, setRespuestas] = useState({})
  const [corregido, setCorregido] = useState(false)
  const [advertencia, setAdvertencia] = useState(false)

  function seleccionar(preguntaId, opcionId) {
    if (corregido) return
    setRespuestas(r => ({ ...r, [preguntaId]: opcionId }))
  }

  function intentarCorregir() {
    const sinResponder = preguntas.length - Object.keys(respuestas).length
    if (sinResponder > 0) {
      setAdvertencia(true)
    } else {
      confirmarCorrecion()
    }
  }

  function confirmarCorrecion() {
    setAdvertencia(false)
    setCorregido(true)
  }

  function limpiarFormulario() {
    if (corregido) return
    setRespuestas({})
  }

  function calcularAciertos() {
    return preguntas.filter(p => {
      const correcta = p.opciones.find(o => o.correcta)
      return respuestas[p.id] === correcta.id
    }).length
  }

  const respondidas = Object.keys(respuestas).length
  const sinResponder = preguntas.length - respondidas
  const aciertos = corregido ? calcularAciertos() : 0

  return (
    <div className="quiz">
      {advertencia && (
        <div className="modal-overlay">
          <div className="modal">
            <p className="modal-titulo">⚠️ Quedan preguntas sin responder</p>
            <p className="modal-texto">Todavía tienes <strong>{sinResponder} {sinResponder === 1 ? 'pregunta' : 'preguntas'}</strong> sin responder. ¿Quieres corregir igualmente?</p>
            <div className="modal-botones">
              <button className="btn-modal-cancelar" onClick={() => setAdvertencia(false)}>Volver y seguir</button>
              <button className="btn-modal-confirmar" onClick={confirmarCorrecion}>Corregir así</button>
            </div>
          </div>
        </div>
      )}

      {preguntas.map((pregunta, i) => {
        const seleccionada = respuestas[pregunta.id]
        const correcta = pregunta.opciones.find(o => o.correcta)
        const acerto = corregido && seleccionada === correcta.id
        const fallo = corregido && seleccionada && seleccionada !== correcta.id
        const sinResponder = corregido && !seleccionada
        const mostrarBotonExplicacion = corregido && (fallo || sinResponder)

        return (
          <div key={pregunta.id} className={`pregunta-bloque ${acerto ? 'bloque-ok' : ''} ${fallo ? 'bloque-fail' : ''} ${sinResponder ? 'bloque-vacia' : ''}`}>
            <div className="pregunta-contenido">
              <p className="pregunta-num">Pregunta {i + 1}</p>
              <p className="pregunta-texto">{pregunta.texto}</p>
              <ul className="opciones">
                {pregunta.opciones.map(opcion => {
                  let clase = 'opcion'
                  if (corregido && opcion.correcta) clase += ' correcta'
                  if (corregido && seleccionada === opcion.id && !opcion.correcta) clase += ' incorrecta'
                  return (
                    <li key={opcion.id}>
                      <label className={clase}>
                        <input
                          type="radio"
                          name={`pregunta-${pregunta.id}`}
                          value={opcion.id}
                          checked={seleccionada === opcion.id}
                          onChange={() => seleccionar(pregunta.id, opcion.id)}
                          disabled={corregido}
                        />
                        <span className="opcion-letra">{opcion.id.toUpperCase()}</span>
                        {opcion.texto}
                      </label>
                    </li>
                  )
                })}
              </ul>
              {sinResponder && <p className="feedback-vacia">— Sin responder</p>}
            </div>
            {mostrarBotonExplicacion && (
              <div className="explicacion-accion">
                <button className="btn-chatgpt" onClick={() => abrirExplicacionChatGPT(pregunta, seleccionada)}>
                  Explicar con ChatGPT
                </button>
              </div>
            )}
          </div>
        )
      })}

      {corregido && (
        <div className="resumen-correccion">
          <span className={aciertos >= passThreshold ? 'badge-apto' : 'badge-no-apto'}>
            {aciertos >= passThreshold ? 'APTO' : 'NO APTO'}
          </span>
          <span className="resumen-score">{aciertos} / {preguntas.length} correctas</span>
          {onRetry && <button className="btn-reintentar" onClick={onRetry}>Nuevo simulacro</button>}
          <button className="btn-reintentar btn-volver" onClick={() => onFinish()}>Volver al menú</button>
        </div>
      )}

      {!corregido && (
        <div className="barra-corregir">
          <span className="respondidas-count">{respondidas} / {preguntas.length} respondidas</span>
          <div className="acciones-quiz">
            <button className="btn-secundario" onClick={limpiarFormulario}>Limpiar respuestas</button>
            <button className="btn-secundario" onClick={onFinish}>Volver al menú</button>
            <button className="btn-corregir" onClick={intentarCorregir}>Corregir</button>
          </div>
        </div>
      )}
    </div>
  )
}


function ModoEstudio({ contenido, titulo = 'Modo Estudio', desplegable = false }) {
  const [seccionAbiertaId, setSeccionAbiertaId] = useState(contenido.secciones?.[0]?.id ?? null)

  function alternarSeccion(id) {
    setSeccionAbiertaId(actual => (actual === id ? null : id))
  }

  return (
    <div className="modo-estudio">
      <div className="estudio-cabecera">
        <div className="info-examen-icono">📚</div>
        <div>
          <h1>{titulo}</h1>
          <p>{contenido.aviso}</p>
          <p className="estudio-fuente">
            Fuente base: <a href={contenido.fuente} target="_blank" rel="noreferrer">CP Guadalentin</a>
          </p>
        </div>
      </div>

      {desplegable ? (
        <div className="estudio-acordeon-lista">
          {contenido.secciones.map(seccion => (
            <article key={seccion.id} className={`estudio-acordeon ${seccionAbiertaId === seccion.id ? 'abierto' : ''}`}>
              <button
                type="button"
                className="estudio-acordeon-trigger"
                onClick={() => alternarSeccion(seccion.id)}
                aria-expanded={seccionAbiertaId === seccion.id}
              >
                {seccion.titulo}
              </button>
              {seccionAbiertaId === seccion.id && (
                <ul>
                  {seccion.puntos.map((punto, i) => (
                    <li key={`${seccion.id}-${i}`}>{punto}</li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className="estudio-grid">
          {contenido.secciones.map(seccion => (
            <article key={seccion.id} className="estudio-card">
              <h2>{seccion.titulo}</h2>
              <ul>
                {seccion.puntos.map((punto, i) => (
                  <li key={`${seccion.id}-${i}`}>{punto}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

function CuestionarioEstudio({ preguntas, onFinish }) {
  return (
    <div className="quiz">
      {preguntas.map((pregunta, i) => (
        <div key={pregunta.id} className="pregunta-bloque">
          <div className="pregunta-contenido">
            <p className="pregunta-num">Pregunta {i + 1}</p>
            <p className="pregunta-texto">{pregunta.texto}</p>
            <ul className="opciones">
              {pregunta.opciones.map(opcion => (
                <li key={opcion.id}>
                  <div className={`opcion${opcion.correcta ? ' correcta' : ''}`}>
                    <span className="opcion-letra">{opcion.id.toUpperCase()}</span>
                    {opcion.texto}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
      <div style={{ textAlign: 'center', margin: '2rem 0' }}>
        <button className="btn-reintentar" onClick={onFinish}>Volver al menú</button>
      </div>
    </div>
  )
}

function InfoExamen({ temasDisponibles, onStart }) {
  const totalDisponibles = temasDisponibles.reduce((acc, t) => acc + t.preguntas.length, 0)
  const puedeIniciar = totalDisponibles >= 20

  return (
    <div className="info-examen">
      <div className="info-examen-icono">📋</div>
      <h2>Simulacro de Examen</h2>
      <p>
        Este modo genera <strong>20 preguntas aleatorias</strong> usando la distribución oficial entre temas.
      </p>
      <table className="distribucion-tabla">
        <thead>
          <tr><th>Tema</th><th>Preguntas</th></tr>
        </thead>
        <tbody>
          {Object.entries(DISTRIBUCION_EXAMEN).map(([tema, n]) => (
            <tr key={tema}>
              <td>Tema {tema}</td>
              <td>{n}</td>
            </tr>
          ))}
          <tr className="total-row"><td>Total</td><td>20</td></tr>
        </tbody>
      </table>
      <p className="info-pendiente">Banco actual: {totalDisponibles} preguntas disponibles.</p>
      <button className="btn-corregir" onClick={onStart} disabled={!puedeIniciar}>
        {puedeIniciar ? 'Empezar simulacro' : 'Necesitas al menos 20 preguntas cargadas'}
      </button>
    </div>
  )
}

export default function App() {
  const [vista, setVista] = useState(null)
  const [preguntas, setPreguntas] = useState(null)
  const [quizKey, setQuizKey] = useState(0)
  const [seccionAbierta, setSeccionAbierta] = useState(null)

  function iniciarTema(temaData) {
    const seleccion = shuffle(temaData.preguntas).slice(0, 20).map(p => ({ ...p, temaId: temaData.id }))
    setPreguntas(seleccion)
    setVista({ tipo: 'tema', tema: temaData })
  }

  function iniciarEstudio(temaData) {
    setPreguntas(temaData.preguntas.map(p => ({ ...p, temaId: temaData.id })))
    setVista({ tipo: 'estudiar', tema: temaData })
  }

  function iniciarSimulacro(temasDisponibles) {
    const seleccion = construirSimulacro(temasDisponibles)
    setPreguntas(seleccion)
    setQuizKey(k => k + 1)
    setVista('examen')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function volver() {
    setVista(null)
    setPreguntas(null)
  }

  const temasDisponibles = TEMAS

  return (
    <div className="layout">
      <nav className="sidebar">
        <div className="sidebar-logo">Licencia de Armas D/E</div>

        <p className="sidebar-seccion">Estudiar</p>
        <button
          className={`sidebar-item ${vista === 'estudio' ? 'activo' : ''}`}
          onClick={() => { setVista('estudio'); setPreguntas(null) }}
        >
          <span className="sidebar-num">📚</span>
          <span className="sidebar-nombre">Temario Resumido</span>
        </button>

        <button
          className={`sidebar-item ${vista === 'estudio-completo' ? 'activo' : ''}`}
          onClick={() => { setVista('estudio-completo'); setPreguntas(null) }}
        >
          <span className="sidebar-num">📖</span>
          <span className="sidebar-nombre">Temario Completo</span>
        </button>

        <p className="sidebar-seccion">Audios</p>
        <button
          className={`sidebar-item ${vista === 'audios' ? 'activo' : ''}`}
          onClick={() => { setVista('audios'); setPreguntas(null) }}
        >
          <span className="sidebar-num">🎙️</span>
          <span className="sidebar-nombre">Podcasts por tema</span>
        </button>

        <p className="sidebar-seccion sidebar-seccion-toggle" onClick={() => setSeccionAbierta(s => s === 'practicar' ? null : 'practicar')}>
          <span>{seccionAbierta === 'practicar' ? '▾' : '▸'} Practicar por tema</span>
        </p>
        {seccionAbierta === 'practicar' && TODOS_LOS_TEMAS.map(t => {
          const datos = temasDisponibles.find(td => td.id === t.id)
          const activo = vista?.tipo === 'tema' && vista?.tema?.id === t.id
          return (
            <button
              key={t.id}
              className={`sidebar-item ${activo ? 'activo' : ''} ${!t.cargado ? 'deshabilitado' : ''}`}
              onClick={() => t.cargado ? iniciarTema({ ...datos, podcast: t.podcast ?? null }) : null}
              title={!t.cargado ? 'Próximamente' : ''}
            >
              <span className="sidebar-num">T{t.id}</span>
              <span className="sidebar-nombre">{t.nombre}</span>
              {!t.cargado && <span className="sidebar-badge">Pronto</span>}
            </button>
          )
        })}

        <p className="sidebar-seccion sidebar-seccion-toggle" onClick={() => setSeccionAbierta(s => s === 'estudiar' ? null : 'estudiar')}>
          <span>{seccionAbierta === 'estudiar' ? '▾' : '▸'} Estudiar cuestionarios</span>
        </p>
        {seccionAbierta === 'estudiar' && TODOS_LOS_TEMAS.map(t => {
          const datos = temasDisponibles.find(td => td.id === t.id)
          const activo = vista?.tipo === 'estudiar' && vista?.tema?.id === t.id
          return (
            <button
              key={t.id}
              className={`sidebar-item ${activo ? 'activo' : ''} ${!t.cargado ? 'deshabilitado' : ''}`}
              onClick={() => t.cargado ? iniciarEstudio({ ...datos }) : null}
              title={!t.cargado ? 'Próximamente' : ''}
            >
              <span className="sidebar-num">T{t.id}</span>
              <span className="sidebar-nombre">{t.nombre}</span>
              {!t.cargado && <span className="sidebar-badge">Pronto</span>}
            </button>
          )
        })}

        <div className="sidebar-separador" />

        <button
          className={`sidebar-item examen ${vista === 'examen' ? 'activo' : ''}`}
          onClick={() => { setVista('examen'); setPreguntas(null) }}
        >
          <span className="sidebar-num">📋</span>
          <span className="sidebar-nombre">Practicar Examen</span>
        </button>
      </nav>

      <main className="contenido">
        {vista === 'estudio' ? (
          <ModoEstudio contenido={temarioEstudio} titulo="Temario Resumido" />
        ) : vista === 'estudio-completo' ? (
          <ModoEstudio contenido={temarioCompleto} titulo="Temario Completo" desplegable />
        ) : vista === 'examen' && preguntas ? (
          <>
            <h1 className="contenido-titulo">Simulacro de Examen</h1>
            <Quiz key={quizKey} preguntas={preguntas} onFinish={volver} onRetry={() => iniciarSimulacro(temasDisponibles)} temaId={null} passThreshold={16} />
          </>
        ) : vista === 'examen' ? (
          <InfoExamen temasDisponibles={temasDisponibles} onStart={() => iniciarSimulacro(temasDisponibles)} />
        ) : vista === 'audios' ? (
          <div className="audio-vista">
            <h1 className="contenido-titulo">Podcasts por tema</h1>
            {TODOS_LOS_TEMAS.filter(t => t.podcast).map(t => (
              <div key={t.id} className="podcast-item">
                <p className="podcast-tema-nombre">Tema {t.id} — {t.nombre}</p>
                <audio controls src={t.podcast} className="audio-player" />
              </div>
            ))}
          </div>
        ) : vista?.tipo === 'estudiar' && preguntas ? (
          <>
            <h1 className="contenido-titulo">Tema {vista.tema.id} — {vista.tema.nombre}</h1>
            <CuestionarioEstudio preguntas={preguntas} onFinish={volver} />
          </>
        ) : vista?.tipo === 'tema' && preguntas ? (
          <>
            <h1 className="contenido-titulo">Tema {vista.tema.id} — {vista.tema.nombre}</h1>
            <Quiz preguntas={preguntas} onFinish={volver} temaId={vista.tema.id} />
          </>
        ) : (
          <div className="bienvenida">
            <h1>Bienvenido</h1>
            <p>Selecciona un tema del menú lateral para empezar a practicar.</p>
          </div>
        )}
      </main>
    </div>
  )
}
