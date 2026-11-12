import { useState } from 'react'
import Encabezado from '../components/Encabezado.jsx'
import Seccion from '../components/Seccion.jsx'
import Icono from '../components/Icono.jsx'
import {
  ESTATUS, ESTATUS_CAT, MEDICOS, hoyISO, nombreCompleto, nombreEstatus, edad,
} from '../recepcion/datos.js'

export default function AgendarCitas({ rec, onIr }) {
  const [busqueda, setBusqueda] = useState('')
  const [form, setForm] = useState({ id_medico: '', fecha: hoyISO(), hora: '', motivo: '' })
  const [fechaVista, setFechaVista] = useState(hoyISO())
  const [errores, setErrores] = useState([])
  const [aviso, setAviso] = useState('')

  const paciente = rec.pacienteActivo ? rec.pacientePorId(rec.pacienteActivo) : null
  const expediente = paciente ? rec.expedienteDe(paciente.id_paciente) : null
  const sugerencias = paciente ? [] : rec.buscar(busqueda)

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const delDia = rec.citas
    .filter((c) => c.fecha === fechaVista)
    .sort((a, b) => a.hora.localeCompare(b.hora))

  const cuenta = (id) => delDia.filter((c) => c.id_estatus === id).length
  const RESUMEN = [
    { texto: 'Citas del día', clase: '', n: delDia.length },
    { texto: 'Programadas', clase: 'pend', n: cuenta(ESTATUS.PROGRAMADA) },
    { texto: 'En espera', clase: 'conf', n: cuenta(ESTATUS.EN_ESPERA) },
    { texto: 'En consulta', clase: '', n: cuenta(ESTATUS.EN_CONSULTA) },
    { texto: 'Atendidas', clase: 'aten', n: cuenta(ESTATUS.ATENDIDA) },
  ]

  function agendar(e) {
    e.preventDefault()
    const faltas = []
    if (!paciente) faltas.push('Elige al paciente.')
    if (!form.id_medico) faltas.push('Selecciona el médico.')
    if (!form.fecha) faltas.push('Indica la fecha.')
    else if (form.fecha < hoyISO()) faltas.push('La fecha no puede ser anterior a hoy.')
    if (!form.hora) faltas.push('Indica la hora.')
    if (!form.motivo.trim()) faltas.push('Escribe el motivo de la visita.')

    if (
      form.id_medico && form.fecha && form.hora &&
      rec.citas.some((c) => c.id_medico === Number(form.id_medico) && c.fecha === form.fecha && c.hora === form.hora)
    ) {
      faltas.push('Ese médico ya tiene una cita agendada a esa misma hora.')
    }

    setErrores(faltas)
    setAviso('')
    if (faltas.length) return

    rec.agendarCita({
      id_paciente: paciente.id_paciente,
      id_medico: Number(form.id_medico),
      fecha: form.fecha,
      hora: form.hora,
      motivo: form.motivo.trim(),
    })
    setAviso(`Cita agendada para ${nombreCompleto(paciente)} el ${form.fecha} a las ${form.hora}.`)
    setFechaVista(form.fecha)
    setForm({ ...form, hora: '', motivo: '' })
    rec.setPacienteActivo(null)
    setBusqueda('')
  }

  function tomarSignos(id_cita) {
    rec.setCitaActiva(id_cita)
    onIr('signos')
  }

  const medico = (id) => MEDICOS.find((m) => m.id === id)?.nombre ?? '—'

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
                      <span>{expediente?.no_expediente} · {edad(paciente.fecha_nacimiento)} años · {paciente.curp}</span>
                    </div>
                    <button type="button" className="link" onClick={() => rec.setPacienteActivo(null)}>Cambiar</button>
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
                    {sugerencias.length > 0 && (
                      <ul className="res-lista compacta">
                        {sugerencias.slice(0, 5).map(({ paciente: p, expediente: x }) => (
                          <li key={p.id_paciente}>
                            <button type="button" onClick={() => rec.setPacienteActivo(p.id_paciente)}>
                              <strong>{nombreCompleto(p)}</strong>
                              <span>{x?.no_expediente} · {p.curp}</span>
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
                <select id="med" value={form.id_medico} onChange={set('id_medico')}>
                  <option value="">Selecciona…</option>
                  {MEDICOS.map((m) => <option key={m.id} value={m.id}>{m.nombre} · {m.area}</option>)}
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

              <button className="btn" type="submit">Agendar cita</button>
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
                  {delDia.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        <div className="vacio">
                          <span className="vacio-ico"><Icono nombre="calendario" tam={26} /></span>
                          <strong>No hay citas para este día</strong>
                          <span>Las citas agendadas aparecerán organizadas aquí.</span>
                        </div>
                      </td>
                    </tr>
                  ) : delDia.map((c) => {
                    const p = rec.pacientePorId(c.id_paciente)
                    const est = nombreEstatus(c.id_estatus)
                    return (
                      <tr key={c.id_cita}>
                        <td><strong>{c.hora}</strong></td>
                        <td>
                          {p ? nombreCompleto(p) : '—'}
                          <div className="mini sin-margen">{rec.expedienteDe(c.id_paciente)?.no_expediente}</div>
                        </td>
                        <td>{medico(c.id_medico)}</td>
                        <td>{c.motivo}</td>
                        <td><span className={`badge ${est.clase}`}>{est.nombre}</span></td>
                        <td>
                          {c.id_estatus === ESTATUS.PROGRAMADA && c.fecha === hoyISO() && (
                            <button type="button" className="btn2 chico" onClick={() => tomarSignos(c.id_cita)}>
                              Tomar signos
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <p className="mini">
              Secuencia de estatus: {ESTATUS_CAT.map((e) => e.nombre).join(' → ')}.
            </p>
          </Seccion>
        </div>
      </div>
    </>
  )
}