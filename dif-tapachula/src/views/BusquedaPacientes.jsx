import { useEffect, useState } from 'react'
import Encabezado from '../components/Encabezado.jsx'
import Seccion from '../components/Seccion.jsx'
import Icono from '../components/Icono.jsx'
import { api, buscarPacientes, expedienteDe, nombreCompleto } from '../api.js'
import { edad, hoyISO } from '../recepcion/datos.js'

function leerSesion() {
  try { return JSON.parse(sessionStorage.getItem('sesion')) } catch { return null }
}

function extraerCategoria(antecedentes) {
  if (!antecedentes) return '—'
  const m = /Categoría:\s*([^\n|]+)/i.exec(antecedentes)
  return m ? m[1].trim() : '—'
}

export default function BusquedaPacientes({ rec, onIr }) {
  const sesion = leerSesion()
  const [q, setQ] = useState('')
  const [categoria, setCategoria] = useState('')
  const [fecha, setFecha] = useState(hoyISO())
  const [citasHoy, setCitasHoy] = useState([])
  const [filas, setFilas] = useState([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  // Cargar resumen de citas de hoy del médico
  useEffect(() => {
    api(`/api/citas?fecha=${hoyISO()}`)
      .then((todas) => {
        const mias = sesion?.idMedico
          ? todas.filter((c) => c.medico?.idMedico === sesion.idMedico)
          : todas
        setCitasHoy(mias)
      })
      .catch(() => setCitasHoy([]))
  }, [sesion?.idMedico])

  // Buscar por texto o listar pacientes con cita en la fecha seleccionada
  useEffect(() => {
    let activo = true
    setCargando(true)
    setError('')

    async function cargarDatos() {
      try {
        if (q.trim().length > 0) {
          const res = await buscarPacientes(q)
          const enriquecidos = await Promise.all(
            res.map(async ({ paciente, expediente }) => {
              let ultima = 'Sin consultas'
              if (expediente?.idExpedienteClinico) {
                const cons = await api(`/api/consultas/expediente/${expediente.idExpedienteClinico}`).catch(() => [])
                if (cons.length > 0 && cons[0].fechaHoraAtendida) {
                  ultima = cons[0].fechaHoraAtendida.slice(0, 10)
                }
              }
              const citaPac = citasHoy.find((c) => c.paciente?.idPaciente === paciente.idPaciente)
              return {
                idPaciente: paciente.idPaciente,
                idCita: citaPac?.idCita ?? null,
                paciente,
                expediente,
                categoria: extraerCategoria(expediente?.antecedentes),
                ultimaConsulta: ultima,
              }
            })
          )
          if (activo) setFilas(enriquecidos)
        } else {
          const fechaConsulta = fecha || hoyISO()
          const citasFecha = await api(`/api/citas?fecha=${fechaConsulta}`)
          const filtradasMedico = sesion?.idMedico
            ? citasFecha.filter((c) => c.medico?.idMedico === sesion.idMedico)
            : citasFecha

          const enriquecidos = await Promise.all(
            filtradasMedico.map(async (c) => {
              const idPac = c.paciente.idPaciente
              const [pacCompleto, exp] = await Promise.all([
                api(`/api/pacientes/${idPac}`).catch(() => c.paciente),
                expedienteDe(idPac).catch(() => null),
              ])
              return {
                idPaciente: idPac,
                idCita: c.idCita,
                paciente: pacCompleto,
                expediente: exp,
                categoria: extraerCategoria(exp?.antecedentes),
                ultimaConsulta: `${c.hora ? c.hora.slice(0, 5) + ' hrs' : ''} · ${c.nombreEstatus}`,
              }
            })
          )
          if (activo) setFilas(enriquecidos)
        }
      } catch (err) {
        if (activo) setError(err.message)
      } finally {
        if (activo) setCargando(false)
      }
    }

    const timer = setTimeout(cargarDatos, 200)
    return () => {
      activo = false
      clearTimeout(timer)
    }
  }, [q, fecha, sesion?.idMedico, citasHoy])

  const filasFiltradas = filas.filter((f) => !categoria || f.categoria.toLowerCase() === categoria.toLowerCase())
  const totalMisCitas = citasHoy.filter((c) => c.nombreEstatus !== 'Cancelada').length
  const totalAtendidas = citasHoy.filter((c) => c.nombreEstatus === 'Atendida').length

  function seleccionar(fila, destino) {
    rec?.setPacienteActivo(fila.idPaciente)
    if (fila.idCita) rec?.setCitaActiva(fila.idCita)
    onIr?.(destino)
  }

  return (
    <>
      <Encabezado
        icono="buscar"
        area="Médico"
        titulo="Búsqueda de pacientes"
        sub="Encuentra al paciente para abrir su expediente o iniciar la consulta"
      />

      <div className="cont">
        <div className="resumen">
          <div className="dato">
            <span>Mis citas hoy</span>
            <strong>{totalMisCitas}</strong>
          </div>
          <div className="dato aten">
            <span>Atendidas</span>
            <strong>{totalAtendidas}</strong>
          </div>
        </div>

        <Seccion icono="buscar" titulo="Buscar paciente" sub="Por nombre, CURP o número de expediente">
          {error && (
            <div className="err" role="alert">
              <ul><li>{error}</li></ul>
            </div>
          )}

          <div className="fila3">
            <div className="f">
              <label htmlFor="q">Paciente</label>
              <div className="con-ico">
                <Icono nombre="buscar" tam={16} />
                <input
                  id="q"
                  name="q"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Nombre, CURP o No. de expediente…"
                />
              </div>
            </div>
            <div className="f">
              <label htmlFor="cat">Categoría</label>
              <select id="cat" name="categoria" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                <option value="">Todas</option>
                <option>Sindicalizado</option>
                <option>Institucionalizado</option>
                <option>Confianza</option>
                <option>Foráneo</option>
                <option>Beneficiario</option>
              </select>
            </div>
            <div className="f">
              <label htmlFor="fc">Fecha de cita</label>
              <input id="fc" name="fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
            </div>
          </div>

          <div className="tabla-box">
            <table className="tabla">
              <thead>
                <tr>
                  <th>No. expediente</th>
                  <th>Paciente</th>
                  <th>CURP</th>
                  <th>Edad</th>
                  <th>Categoría</th>
                  <th>Cita / Última consulta</th>
                </tr>
              </thead>
              <tbody>
                {cargando ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="vacio">
                        <strong>Cargando pacientes…</strong>
                      </div>
                    </td>
                  </tr>
                ) : filasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="vacio">
                        <span className="vacio-ico"><Icono nombre="buscar" tam={26} /></span>
                        <strong>Sin resultados</strong>
                        <span>Escribe un nombre, CURP o número de expediente, o verifica la fecha de cita.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filasFiltradas.map((f) => (
                    <tr
                      key={`${f.idPaciente}-${f.idCita ?? 's'}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => seleccionar(f, f.expediente ? 'consulta' : 'expediente')}
                    >
                      <td>
                        <strong>{f.expediente?.noExpediente ?? 'Sin expediente'}</strong>
                      </td>
                      <td>{nombreCompleto(f.paciente)}</td>
                      <td>{f.paciente.curp}</td>
                      <td>{edad(f.paciente.fechaNacimiento) ?? '—'} años</td>
                      <td>{f.categoria}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span>{f.ultimaConsulta}</span>
                          <div style={{ display: 'flex', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                            <button type="button" className="btn2 chico" onClick={() => seleccionar(f, 'expediente')}>
                              Expediente
                            </button>
                            {f.idCita && (
                              <button type="button" className="btn chico" onClick={() => seleccionar(f, 'consulta')}>
                                Atender
                              </button>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Seccion>
      </div>
    </>
  )
}