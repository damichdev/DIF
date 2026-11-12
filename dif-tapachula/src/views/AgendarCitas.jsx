import Encabezado from '../components/Encabezado.jsx'
import Seccion from '../components/Seccion.jsx'
import Icono from '../components/Icono.jsx'
import { useEffect, useState } from 'react'
import { api, hoy, nombreCompleto } from '../api.js'
import { ESTATUS } from '../catalogos.js'

// Contadores del día (salen del catálogo "Estatus Cita")
const RESUMEN = [
  { texto: 'Citas del día', clase: '', id: null },
  { texto: 'Pendientes', clase: 'pend', id: 1 },
  { texto: 'Confirmadas', clase: 'conf', id: 2 },
  { texto: 'Atendidas', clase: 'aten', id: 3 },
]

const etiquetaPaciente = (p) => `${nombreCompleto(p)} · ${p.curp}`

export default function AgendarCitas({ onIr }) {
  const [medicos, setMedicos] = useState([])
  const [pacientes, setPacientes] = useState([])
  const [citas, setCitas] = useState([])
  const [fecha, setFecha] = useState(hoy())
  const [msg, setMsg] = useState(null)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    Promise.all([api('/api/medicos'), api('/api/pacientes'), api('/api/citas')])
      .then(([m, p, c]) => { setMedicos(m); setPacientes(p); setCitas(c) })
      .catch((err) => setMsg({ ok: false, texto: 'No se pudieron cargar los datos: ' + err.message }))
  }, []) 

  const delDia = citas.filter((c) => c.fecha === fecha).sort((a, b) => a.hora.localeCompare(b.hora))

  async function agendar(e) {
    e.preventDefault()
    const form = e.target
    const d = Object.fromEntries(new FormData(form))
    const paciente = pacientes.find((p) => etiquetaPaciente(p) === d.paciente)
    if (!paciente) {
      setMsg({ ok: false, texto: 'Elige un paciente de la lista.' })
      return
    }
    setEnviando(true)
    setMsg(null)
    try {
      const cita = await api('/api/citas', 'POST', {
        idPaciente: paciente.idPaciente,
        idMedico: Number(d.idMedico),
        fecha: d.fecha,
        hora: d.hora,
        motivo: d.motivo,
        idEstatus: Number(d.idEstatus),
      })
      setCitas((cs) => [...cs, cita])
      setFecha(cita.fecha)
      setMsg({ ok: true, texto: `Cita agendada para ${nombreCompleto(cita.paciente)}.` })
      form.reset()
    } catch (err) {
      setMsg({ ok: false, texto: err.message })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <>
      <Encabezado
        icono="calendario"
        area="Recepción"
        titulo="Agendar citas"
        sub="Programa las citas de los pacientes con su médico"
      />

      <div className="cont">
        {/* ---------- Resumen del día ---------- */}
        <div className="resumen">
          {RESUMEN.map((r) => (
            <div key={r.texto} className={`dato ${r.clase}`}>
              <span>{r.texto}</span>
              <strong>{r.id ? delDia.filter((c) => c.idEstatus === r.id).length : delDia.length}</strong>
            </div>
          ))}
        </div>

        <div className="split">
          {/* ---------- Formulario: tabla Cita ---------- */}
          <form className="col-form" onSubmit={agendar}>
            <Seccion icono="calendario" titulo="Nueva cita" sub="Datos de la tabla Cita">
              <div className="f">
                <label htmlFor="pac">Paciente</label>
                <div className="con-ico">
                  <Icono nombre="buscar" tam={16} />
                  <input id="pac" name="paciente" list="lista-pacientes" required autoComplete="off" placeholder="Nombre o CURP…" />
                  <datalist id="lista-pacientes">
                    {pacientes.map((p) => <option key={p.idPaciente} value={etiquetaPaciente(p)} />)}
                  </datalist>
                </div>
                <p className="mini">
                  ¿No existe? <button type="button" className="link" onClick={() => onIr('registrar')}>Registrar paciente</button>
                </p>
              </div>

              <div className="f">
                <label htmlFor="med">Médico</label>
                <select id="med" name="idMedico" required>
                  <option value="">{medicos.length ? 'Selecciona…' : 'No hay médicos registrados'}</option>
                  {medicos.map((m) => (
                    <option key={m.idMedico} value={m.idMedico}>{nombreCompleto(m)} · {m.areaEspecialidad}</option>
                  ))}
                </select>
              </div>

              <div className="fila2">
                <div className="f">
                  <label htmlFor="fecha">Fecha</label>
                  <input id="fecha" name="fecha" type="date" required min={hoy()} />
                </div>
                <div className="f">
                  <label htmlFor="hora">Hora</label>
                  <input id="hora" name="hora" type="time" required />
                </div>
              </div>

              <div className="f">
                <label htmlFor="mot">Motivo</label>
                <textarea id="mot" name="motivo" rows={3} required placeholder="Ej. control de rutina" />
              </div>

              <div className="f">
                <label htmlFor="est">Estatus de la cita</label>
                <select id="est" name="idEstatus" required defaultValue="1">
                  {ESTATUS.map((x) => <option key={x.id} value={x.id}>{x.nombre}</option>)}
                </select>
              </div>

              {msg && <p className={msg.ok ? 'ok' : 'err'} role="status">{msg.texto}</p>}
              <button className="btn" type="submit" disabled={enviando}>{enviando ? 'Guardando…' : 'Agendar cita'}</button>
            </Seccion>
          </form>

          {/* ---------- Citas del día ---------- */}
          <Seccion
            className="col-main"
            icono="reloj"
            titulo="Citas del día"
            sub="Agenda de todos los médicos"
            extra={<input type="date" aria-label="Fecha a consultar" className="fecha-chica" value={fecha} onChange={(e) => setFecha(e.target.value)} />}
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
                  </tr>
                </thead>
                <tbody>
                  {delDia.map((c) => (
                    <tr key={c.idCita}>
                      <td>{c.hora.slice(0, 5)}</td>
                      <td>{c.paciente ? nombreCompleto(c.paciente) : `#${c.idCita}`}</td>
                      <td>{c.medico ? nombreCompleto(c.medico) : '—'}</td>
                      <td>{c.motivo}</td>
                      <td>{c.nombreEstatus}</td>
                    </tr>
                  ))}
                  {!delDia.length && <tr>
                    <td colSpan={5}>
                      <div className="vacio">
                        <span className="vacio-ico"><Icono nombre="calendario" tam={26} /></span>
                        <strong>No hay citas para este día</strong>
                        <span>Las citas que agendes aparecerán aquí.</span>
                      </div>
                    </td>
                  </tr>}
                </tbody>
              </table>
            </div>
          </Seccion>
        </div>
      </div>
    </>
  )
}