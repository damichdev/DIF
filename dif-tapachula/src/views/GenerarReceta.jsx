import { useEffect, useState } from 'react'
import Encabezado from '../components/Encabezado.jsx'
import Seccion from '../components/Seccion.jsx'
import Icono from '../components/Icono.jsx'
import { api, nombreCompleto } from '../api.js'
import { edad, hoyISO } from '../recepcion/datos.js'

const VACIO = { medicamento: '', presentacion: '', dosis: '', duracion: '' }

function leerSesion() {
  try { return JSON.parse(sessionStorage.getItem('sesion')) } catch { return null }
}

function leerArea(antecedentes) {
  if (!antecedentes) return '—'
  const m = /Área:\s*([^\n]+)/i.exec(antecedentes)
  return m ? m[1].trim() : '—'
}

export default function GenerarReceta({ rec, onIr }) {
  const sesion = leerSesion()
  const [consultas, setConsultas] = useState([])
  const [idConsulta, setIdConsulta] = useState(rec?.consultaActiva ?? '')
  const [expediente, setExpediente] = useState(null)
  const [paciente, setPaciente] = useState(null)
  const [medicoInfo, setMedicoInfo] = useState(null)
  const [meds, setMeds] = useState([{ ...VACIO }])
  const [indicaciones, setIndicaciones] = useState('')
  const [errores, setErrores] = useState([])
  const [guardado, setGuardado] = useState(null)
  const [ocupado, setOcupado] = useState(false)

  useEffect(() => {
    api('/api/consultas')
      .then((lista) => {
        setConsultas(lista)
        if (!idConsulta && rec?.consultaActiva) {
          setIdConsulta(rec.consultaActiva)
        } else if (!idConsulta && lista.length > 0) {
          setIdConsulta(lista[0].idConsulta)
        }
      })
      .catch(() => setConsultas([]))

    if (sesion?.idMedico) {
      api(`/api/medicos/${sesion.idMedico}`).then(setMedicoInfo).catch(() => {})
    }
  }, [sesion?.idMedico, rec?.consultaActiva, idConsulta])

  const consultaActual = consultas.find((c) => c.idConsulta === Number(idConsulta)) ?? null

  useEffect(() => {
    if (!consultaActual?.idExpedienteClinico) {
      setExpediente(null)
      setPaciente(null)
      return
    }
    let activo = true
    api(`/api/expedientes/${consultaActual.idExpedienteClinico}`)
      .then(async (exp) => {
        if (!activo) return
        setExpediente(exp)
        if (exp?.paciente?.idPaciente) {
          const pac = await api(`/api/pacientes/${exp.paciente.idPaciente}`).catch(() => exp.paciente)
          if (activo) setPaciente(pac)
        }
      })
      .catch(() => {})

    if (consultaActual.receta) {
      setIndicaciones(consultaActual.receta.indicaciones ?? '')
      if (consultaActual.receta.detalles?.length) {
        setMeds(consultaActual.receta.detalles)
      }
    } else {
      setIndicaciones('')
      setMeds([{ ...VACIO }])
    }
    return () => { activo = false }
  }, [consultaActual])

  function cambiar(i, campo, valor) {
    setMeds(meds.map((m, k) => (k === i ? { ...m, [campo]: valor } : m)))
  }

  async function generar(e) {
    e.preventDefault()
    if (ocupado) return

    const faltas = []
    if (!consultaActual) faltas.push('Selecciona una consulta médica.')
    const validos = meds.filter((m) => m.medicamento.trim() || m.presentacion.trim() || m.dosis.trim() || m.duracion.trim())
    if (validos.length === 0) {
      faltas.push('Agrega al menos un medicamento a la receta.')
    } else {
      validos.forEach((m, idx) => {
        if (!m.medicamento.trim() || !m.presentacion.trim() || !m.dosis.trim() || !m.duracion.trim()) {
          faltas.push(`Completa todos los campos del medicamento #${idx + 1}.`)
        }
      })
    }
    setErrores(faltas)
    if (faltas.length > 0) return

    setOcupado(true)
    setGuardado(null)
    try {
      const folioGen = consultaActual.receta?.folio || `REC-${String(consultaActual.idConsulta).padStart(6, '0')}`
      const resp = await api(`/api/consultas/${consultaActual.idConsulta}/receta`, 'POST', {
        folio: folioGen,
        indicaciones: indicaciones.trim(),
        detalles: validos,
      })
      setGuardado(resp.receta)
      setConsultas((prev) => prev.map((c) => (c.idConsulta === resp.idConsulta ? resp : c)))
    } catch (err) {
      setErrores([err.message])
    } finally {
      setOcupado(false)
    }
  }

  const medicoTexto = medicoInfo
    ? nombreCompleto(medicoInfo)
    : consultaActual?.medico
    ? nombreCompleto(consultaActual.medico)
    : sesion?.nombre ?? ''

  const cedulaTexto = medicoInfo?.cedulaProfesional ?? consultaActual?.medico?.cedulaProfesional ?? ''

  return (
    <>
      <Encabezado
        icono="pastilla"
        area="Médico"
        titulo="Generar receta"
        sub="Receta ligada a la consulta del paciente"
      />

      <form className="cont split" onSubmit={generar} onReset={() => { setMeds([{ ...VACIO }]); setIndicaciones('') }}>
        <div className="col-form stack">
          <Seccion icono="estetoscopio" titulo="Consulta" sub="Elige la consulta de hoy">
            <select
              name="id_consulta"
              aria-label="Consulta"
              value={idConsulta}
              onChange={(e) => {
                setIdConsulta(e.target.value ? Number(e.target.value) : '')
                setGuardado(null)
                setErrores([])
              }}
            >
              <option value="">{consultas.length ? 'Selecciona una consulta…' : 'Sin consultas registradas'}</option>
              {consultas.map((c) => (
                <option key={c.idConsulta} value={c.idConsulta}>
                  Consulta #{c.idConsulta} · {c.fechaHoraAtendida?.slice(0, 16).replace('T', ' ')} · {c.diagnostico}
                </option>
              ))}
            </select>
          </Seccion>

          <Seccion icono="expediente" titulo="Datos de la receta">
            <div className="fila2">
              <div className="f">
                <label htmlFor="folio">Folio</label>
                <input id="folio" value={guardado?.folio ?? consultaActual?.receta?.folio ?? ''} placeholder="Automático" readOnly />
              </div>
              <div className="f">
                <label htmlFor="fecha">Fecha</label>
                <input id="fecha" value={consultaActual?.fechaHoraAtendida?.slice(0, 10) ?? hoyISO()} placeholder="Automática" readOnly />
              </div>
            </div>
            <div className="f">
              <label htmlFor="emp">Nombre del paciente</label>
              <input id="emp" value={paciente ? nombreCompleto(paciente) : ''} placeholder="Del expediente" readOnly />
            </div>
            <div className="fila2">
              <div className="f">
                <label htmlFor="area">Área</label>
                <input id="area" value={leerArea(expediente?.antecedentes)} placeholder="Del expediente" readOnly />
              </div>
              <div className="f">
                <label htmlFor="edad">Edad</label>
                <input id="edad" value={paciente?.fechaNacimiento ? `${edad(paciente.fechaNacimiento)} años` : ''} placeholder="—" readOnly />
              </div>
            </div>
            <div className="f">
              <label htmlFor="idx">Diagnóstico (IDX)</label>
              <input id="idx" value={consultaActual?.diagnostico ?? ''} placeholder="De la consulta" readOnly />
            </div>
          </Seccion>
        </div>

        <div className="col-main stack">
          <Seccion icono="pastilla" titulo="Medicamentos" sub="Un renglón por medicamento">
            {guardado && (
              <div className="ok chico" role="status">
                <Icono nombre="check" tam={18} />
                <div>
                  <strong>Receta {guardado.folio} generada correctamente</strong>
                  <span>Ya aparece registrada en el historial médico del paciente.</span>
                </div>
                <button type="button" className="btn2 chico" onClick={() => onIr?.('historial')}>
                  Ver historial
                </button>
              </div>
            )}
            {errores.length > 0 && (
              <div className="err" role="alert">
                <ul>{errores.map((m) => <li key={m}>{m}</li>)}</ul>
              </div>
            )}

            {meds.map((m, i) => (
              <div key={i} className="renglon-med">
                <div className="f">
                  <label htmlFor={`med${i}`}>Medicamento</label>
                  <input id={`med${i}`} value={m.medicamento} placeholder="Ej. Paracetamol"
                    onChange={(e) => cambiar(i, 'medicamento', e.target.value)} />
                </div>
                <div className="f">
                  <label htmlFor={`pre${i}`}>Presentación</label>
                  <input id={`pre${i}`} value={m.presentacion} placeholder="Tabletas 500 mg"
                    onChange={(e) => cambiar(i, 'presentacion', e.target.value)} />
                </div>
                <div className="f">
                  <label htmlFor={`dos${i}`}>Dosis</label>
                  <input id={`dos${i}`} value={m.dosis} placeholder="1 cada 8 h"
                    onChange={(e) => cambiar(i, 'dosis', e.target.value)} />
                </div>
                <div className="f">
                  <label htmlFor={`dur${i}`}>Duración</label>
                  <input id={`dur${i}`} value={m.duracion} placeholder="5 días"
                    onChange={(e) => cambiar(i, 'duracion', e.target.value)} />
                </div>
                <button type="button" className="btn2" aria-label="Quitar medicamento"
                  disabled={meds.length === 1}
                  onClick={() => setMeds(meds.filter((_, k) => k !== i))}>
                  Quitar
                </button>
              </div>
            ))}
            <button type="button" className="link" onClick={() => setMeds([...meds, { ...VACIO }])}>
              + Agregar medicamento
            </button>

            <div className="f" style={{ marginTop: 16 }}>
              <label htmlFor="ind">Indicaciones</label>
              <textarea id="ind" name="indicaciones" rows={4} value={indicaciones} onChange={(e) => setIndicaciones(e.target.value)} placeholder="Dieta, cuidados, próxima cita…" />
            </div>

            <div className="fila2">
              <div className="f">
                <label htmlFor="medico">Médico</label>
                <input id="medico" value={medicoTexto} placeholder="Del usuario en sesión" readOnly />
              </div>
              <div className="f">
                <label htmlFor="ced">Cédula profesional</label>
                <input id="ced" value={cedulaTexto} placeholder="Del usuario en sesión" readOnly />
              </div>
            </div>
          </Seccion>

          <div className="barra-acciones">
            <p className="mini">
              <Icono nombre="info" tam={14} /> El folio y la fecha los asigna el sistema.
            </p>
            <div className="botones">
              <button className="btn2" type="reset">Limpiar</button>
              <button className="btn" type="submit" disabled={ocupado}>
                {ocupado ? 'Guardando…' : 'Generar receta'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </>
  )
}