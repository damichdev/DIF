import { useCallback, useEffect, useState } from 'react'
import Encabezado from '../components/Encabezado.jsx'
import Seccion from '../components/Seccion.jsx'
import Icono from '../components/Icono.jsx'
import { api, buscarPacientes, expedienteDe, nombreCompleto } from '../api.js'
import { edad, hoyISO } from '../recepcion/datos.js'

// Estilo de cada estatus (los nombres e ids vienen del backend)
const CLASE = {
  Programada: 'prog', 'En espera': 'espera', 'En consulta': 'consulta', Atendida: 'atendida', Cancelada: '',
}
const CLASE_RESUMEN = { Programada: 'pend', 'En espera': 'conf', Atendida: 'aten' }

// Orden del flujo (los ids del catálogo no lo siguen: Clínica usa el 3 para «Atendida»)
const ORDEN = ['Programada', 'En espera', 'En consulta', 'Atendida', 'Cancelada']
const porFlujo = (a, b) => ORDEN.indexOf(a.nombreEstatus) - ORDEN.indexOf(b.nombreEstatus)

const nombreMedico = (m) => [m.nombre, m.apPaterno].filter(Boolean).join(' ')

export default function AgendarCitas({ rec, onIr }) {
  const [medicos, setMedicos] = useState([])
  const [estatus, setEstatus] = useState([])
  const [agenda, setAgenda] = useState({ fecha: null, citas: [] })
  const [ocupado, setOcupado] = useState(false)

  const [busqueda, setBusqueda] = useState('')
  const [sugerencias, setSugerencias] = useState([])
  const [paciente, setPaciente] = useState(null)
  const [expediente, setExpediente] = useState(null)

  const [form, setForm] = useState({ idMedico: '', fecha: hoyISO(), hora: '', motivo: '' })
  const [fechaVista, setFechaVista] = useState(hoyISO())
  const [errores, setErrores] = useState([])
  const [aviso, setAviso] = useState('')

  const citas = agenda.citas
  const cargando = agenda.fecha !== fechaVista

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  // Médicos y catálogo de estatus: una sola vez
  useEffect(() => {
    Promise.all([api('/api/medicos'), api('/api/citas/estatus')])
      .then(([m, e]) => { setMedicos(m); setEstatus([...e].sort(porFlujo)) })
      .catch((err) => setErrores([`No se pudieron cargar médicos y estatus: ${err.message}`]))
  }, [])

  // Agenda del día que se está viendo; "cargando" = todavía no llega la del día pedido
  const cargarCitas = useCallback((fecha) => api(`/api/citas?fecha=${fecha}`)
    .then((lista) => setAgenda({ fecha, citas: lista }))
    .catch((err) => {
      setAgenda({ fecha, citas: [] })
      setErrores([`No se pudo cargar la agenda: ${err.message}`])
    }), [])

  useEffect(() => { if (fechaVista) cargarCitas(fechaVista) }, [fechaVista, cargarCitas])

  // Paciente que viene de "Registrar paciente"
  useEffect(() => {
    if (!rec.pacienteActivo) return
    let vigente = true
    Promise.all([api(`/api/pacientes/${rec.pacienteActivo}`), expedienteDe(rec.pacienteActivo)])
      .then(([p, x]) => { if (vigente) { setPaciente(p); setExpediente(x) } })
      .catch((err) => { if (vigente) setErrores([err.message]) })
    return () => { vigente = false }
  }, [rec.pacienteActivo])

  // Sugerencias mientras se escribe (espera 300 ms para no saturar el servidor)
  useEffect(() => {
    if (paciente || busqueda.trim().length < 2) return
    let vigente = true
    const t = setTimeout(() => {
      buscarPacientes(busqueda)
        .then((r) => { if (vigente) setSugerencias(r) })
        .catch(() => { if (vigente) setSugerencias([]) })
    }, 300)
    return () => { vigente = false; clearTimeout(t) }
  }, [busqueda, paciente])

  function elegir(p, x) {
    setPaciente(p)
    setExpediente(x)
    setSugerencias([])
    setBusqueda('')
  }

  function cambiarPaciente() {
    rec.setPacienteActivo(null)
    setPaciente(null)
    setExpediente(null)
  }

  const idDe = (nombre) => estatus.find((e) => e.nombreEstatus === nombre)?.idEstatus
  const cuenta = (nombre) => citas.filter((c) => c.nombreEstatus === nombre).length
  const RESUMEN = [
    { texto: 'Citas del día', clase: '', n: citas.length },
    ...estatus
      .filter((e) => e.nombreEstatus !== 'Cancelada')
      .map((e) => ({ texto: e.nombreEstatus, clase: CLASE_RESUMEN[e.nombreEstatus] ?? '', n: cuenta(e.nombreEstatus) })),
  ]

  async function agendar(e) {
    e.preventDefault()
    if (ocupado) return
    const faltas = []
    if (!paciente) faltas.push('Elige al paciente.')
    if (!form.idMedico) faltas.push('Selecciona el médico.')
    if (!form.fecha) faltas.push('Indica la fecha.')
    else if (form.fecha < hoyISO()) faltas.push('La fecha no puede ser anterior a hoy.')
    if (!form.hora) faltas.push('Indica la hora.')
    if (!form.motivo.trim()) faltas.push('Escribe el motivo de la visita.')
    setErrores(faltas)
    setAviso('')
    if (faltas.length) return

    setOcupado(true)
    try {
      // El servidor valida choques de horario y fechas pasadas, y la deja "Programada"
      await api('/api/citas', 'POST', {
        idPaciente: paciente.idPaciente,
        idMedico: Number(form.idMedico),
        fecha: form.fecha,
        hora: form.hora,
        motivo: form.motivo.trim(),
      })
      setAviso(`Cita agendada para ${nombreCompleto(paciente)} el ${form.fecha} a las ${form.hora}.`)
      setForm({ ...form, hora: '', motivo: '' })
      cambiarPaciente()
      if (fechaVista === form.fecha) await cargarCitas(form.fecha)
      else setFechaVista(form.fecha)
    } catch (err) {
      setErrores([err.message])
    } finally {
      setOcupado(false)
    }
  }

  function tomarSignos(idCita) {
    rec.setCitaActiva(idCita)
    onIr('signos')
  }

  return (
    <>
      <Encabezado
        icono="calendario"
        area="Recepción"
        titulo="Agendar citas"
        sub="Programa la visita del paciente; al tomar sus signos pasa a lista de espera"
      />

      <div className="cont">
        <div className="resumen">
          {RESUMEN.map((r) => (
            <div key={r.texto} className={`dato ${r.clase}`}>
              <span>{r.texto}</span>
              <strong>{r.n}</strong>
            </div>
          ))}
        </div>

        <div className="split">
          <form className="col-form" onSubmit={agendar} noValidate>
            <Seccion icono="calendario" titulo="Nueva cita" sub="Paciente, médico, fecha y motivo">
              {errores.length > 0 && (
                <div className="err" role="alert">
                  <ul>{errores.map((m) => <li key={m}>{m}</li>)}</ul>
                </div>
              )}
              {aviso && (
                <div className="ok chico" role="status">
                  <Icono nombre="check" tam={18} />
                  <div><strong>{aviso}</strong></div>
                </div>
              )}

              <div className="f">
                <label htmlFor="pac">Paciente</label>
                {paciente ? (
                  <div className="chip-pac">
                    <div>
                      <strong>{nombreCompleto(paciente)}</strong>
                      <span>{expediente?.noExpediente ?? 'sin expediente'} · {edad(paciente.fechaNacimiento)} años · {paciente.curp}</span>
                    </div>
                    <button type="button" className="link" onClick={cambiarPaciente}>Cambiar</button>
                  </div>
                ) : (
                  <>
                    <div className="con-ico">
                      <Icono nombre="buscar" tam={16} />
                      <input
                        id="pac"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        placeholder="Nombre, CURP o No. de expediente…"
                        autoComplete="off"
                      />
                    </div>
                    {busqueda.trim().length >= 2 && sugerencias.length > 0 && (
                      <ul className="res-lista compacta">
                        {sugerencias.slice(0, 5).map(({ paciente: p, expediente: x }) => (
                          <li key={p.idPaciente}>
                            <button type="button" onClick={() => elegir(p, x)}>
                              <strong>{nombreCompleto(p)}</strong>
                              <span>{x?.noExpediente ?? 'sin expediente'} · {p.curp}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                    {busqueda.trim().length >= 2 && sugerencias.length === 0 && (
                      <p className="mini">Sin resultados.</p>
                    )}
                    <p className="mini">
                      ¿No existe? <button type="button" className="link" onClick={() => onIr('registrar')}>Registrar paciente</button>
                    </p>
                  </>
                )}
              </div>

              <div className="f">
                <label htmlFor="med">Médico</label>
                <select id="med" value={form.idMedico} onChange={set('idMedico')}>
                  <option value="">Selecciona…</option>
                  {medicos.map((m) => (
                    <option key={m.idMedico} value={m.idMedico}>{nombreMedico(m)} · {m.areaEspecialidad}</option>
                  ))}
                </select>
              </div>

              <div className="fila2">
                <div className="f">
                  <label htmlFor="fecha">Fecha</label>
                  <input id="fecha" type="date" min={hoyISO()} value={form.fecha} onChange={set('fecha')} />
                </div>
                <div className="f">
                  <label htmlFor="hora">Hora</label>
                  <input id="hora" type="time" value={form.hora} onChange={set('hora')} />
                </div>
              </div>

              <div className="f">
                <label htmlFor="mot">Motivo de la visita</label>
                <textarea
                  id="mot"
                  rows={3}
                  value={form.motivo}
                  onChange={set('motivo')}
                  placeholder="Ej. consulta general, control de rutina"
                />
              </div>

              <div className="f">
                <label htmlFor="est">Estatus de la cita</label>
                <input id="est" value="Programada" readOnly />
                <p className="mini">Cambia automáticamente a «En espera» al registrar signos vitales.</p>
              </div>

              <button className="btn" type="submit" disabled={ocupado}>{ocupado ? 'Agendando…' : 'Agendar cita'}</button>
            </Seccion>
          </form>

          <Seccion
            className="col-main"
            icono="reloj"
            titulo="Citas del día"
            sub="Agenda general de la consulta médica"
            extra={
              <input
                type="date"
                aria-label="Fecha a consultar"
                className="fecha-chica"
                value={fechaVista}
                onChange={(e) => setFechaVista(e.target.value)}
              />
            }
          >
            <div className="tabla-box">
              <table className="tabla">
                <thead>
                  <tr>
                    <th>Hora</th>
                    <th>Paciente</th>
                    <th>Médico</th>
                    <th>Motivo</th>
                    <th>Estatus</th>
                    <th><span className="sr">Acción</span></th>
                  </tr>
                </thead>
                <tbody>
                  {cargando ? (
                    <tr><td colSpan={6}><p className="mini">Cargando agenda…</p></td></tr>
                  ) : citas.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        <div className="vacio">
                          <span className="vacio-ico"><Icono nombre="calendario" tam={26} /></span>
                          <strong>No hay citas para este día</strong>
                          <span>Las citas agendadas aparecerán organizadas aquí.</span>
                        </div>
                      </td>
                    </tr>
                  ) : citas.map((c) => (
                    <tr key={c.idCita}>
                      <td><strong>{c.hora.slice(0, 5)}</strong></td>
                      <td>
                        {nombreCompleto(c.paciente)}
                        <div className="mini sin-margen">{c.paciente.curp}</div>
                      </td>
                      <td>{nombreMedico(c.medico)}</td>
                      <td>{c.motivo}</td>
                      <td><span className={`badge ${CLASE[c.nombreEstatus] ?? ''}`}>{c.nombreEstatus}</span></td>
                      <td>
                        {c.idEstatus === idDe('Programada') && c.fecha === hoyISO() && (
                          <button type="button" className="btn2 chico" onClick={() => tomarSignos(c.idCita)}>
                            Tomar signos
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mini">
              Secuencia de estatus: {estatus.filter((e) => e.nombreEstatus !== 'Cancelada').map((e) => e.nombreEstatus).join(' → ')}.
            </p>
          </Seccion>
        </div>
      </div>
    </>
  )
}
