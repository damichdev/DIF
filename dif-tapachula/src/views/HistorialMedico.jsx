import { useEffect, useState } from 'react'
import Encabezado from '../components/Encabezado.jsx'
import Seccion from '../components/Seccion.jsx'
import Icono from '../components/Icono.jsx'
import { api, buscarPacientes, expedienteDe, nombreCompleto } from '../api.js'
import { edad } from '../recepcion/datos.js'

export default function HistorialMedico({ rec, onIr }) {
  const [busqueda, setBusqueda] = useState('')
  const [resultados, setResultados] = useState([])
  const [paciente, setPaciente] = useState(null)
  const [expediente, setExpediente] = useState(null)
  const [consultas, setConsultas] = useState([])

  async function cargarHistorial(idPaciente) {
    if (!idPaciente) return
    try {
      const [pac, exp] = await Promise.all([
        api(`/api/pacientes/${idPaciente}`),
        expedienteDe(idPaciente),
      ])
      setPaciente(pac)
      setExpediente(exp)
      if (exp?.idExpedienteClinico) {
        const lista = await api(`/api/consultas/expediente/${exp.idExpedienteClinico}`)
        setConsultas(lista)
      } else {
        setConsultas([])
      }
    } catch {
      setConsultas([])
    }
  }

  useEffect(() => {
    if (rec?.pacienteActivo) {
      cargarHistorial(rec.pacienteActivo)
    }
  }, [rec?.pacienteActivo])

  useEffect(() => {
    if (busqueda.trim().length < 2) {
      setResultados([])
      return
    }
    let activo = true
    const t = setTimeout(() => {
      buscarPacientes(busqueda)
        .then((r) => { if (activo) setResultados(r) })
        .catch(() => { if (activo) setResultados([]) })
    }, 250)
    return () => { activo = false; clearTimeout(t) }
  }, [busqueda])

  const totalConsultas = consultas.length
  const totalRecetas = consultas.filter((c) => c.receta != null).length
  const totalReferencias = consultas.filter((c) => /\[REFERENCIA:/i.test(c.exploracionFisica ?? '')).length
  const totalLicencias = consultas.filter((c) => /\[LICENCIA:/i.test(c.exploracionFisica ?? '')).length

  return (
    <>
      <Encabezado
        icono="lista"
        area="Médico"
        titulo="Historial médico"
        sub="Consultas, recetas, referencias y licencias del paciente"
      />

      <div className="cont split">
        <div className="col-form stack">
          <Seccion icono="buscar" titulo="Paciente" sub="Busca al paciente">
            <div className="con-ico">
              <Icono nombre="buscar" tam={16} />
              <input
                name="paciente"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                aria-label="Paciente"
                placeholder="Nombre, CURP o No. de expediente…"
              />
            </div>
            {resultados.length > 0 && (
              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {resultados.map(({ paciente: p, expediente: ex }) => (
                  <button
                    key={p.idPaciente}
                    type="button"
                    className="btn2 chico"
                    style={{ textAlign: 'left', justifyContent: 'flex-start' }}
                    onClick={() => {
                      rec?.setPacienteActivo(p.idPaciente)
                      setBusqueda('')
                      setResultados([])
                      cargarHistorial(p.idPaciente)
                    }}
                  >
                    {nombreCompleto(p)} · {ex?.noExpediente ?? 'Sin exp.'}
                  </button>
                ))}
              </div>
            )}
          </Seccion>

          <Seccion icono="expediente" titulo="Expediente">
            {paciente ? (
              <dl className="datos-pac">
                <div><dt>Paciente</dt><dd>{nombreCompleto(paciente)}</dd></div>
                <div><dt>Edad / Sexo</dt><dd>{edad(paciente.fechaNacimiento)} años · {paciente.nombreSexo}</dd></div>
                <div><dt>No. Expediente</dt><dd>{expediente?.noExpediente ?? 'Sin expediente'}</dd></div>
                <div><dt>Tipo de sangre</dt><dd>{expediente?.tipoSangre ?? '—'}</dd></div>
                <div><dt>Alergias</dt><dd>{expediente?.alergias ?? 'Ninguna'}</dd></div>
                <div><dt>Antecedentes</dt><dd style={{ whiteSpace: 'pre-line' }}>{expediente?.antecedentes ?? '—'}</dd></div>
              </dl>
            ) : (
              <div className="vacio">
                <span className="vacio-ico"><Icono nombre="carpeta" tam={26} /></span>
                <strong>Sin paciente seleccionado</strong>
                <span>Tipo de sangre, alergias y antecedentes aparecerán aquí.</span>
              </div>
            )}
          </Seccion>
        </div>

        <div className="col-main">
          <div className="resumen">
            <div className="dato">
              <span>Consultas</span>
              <strong>{totalConsultas}</strong>
            </div>
            <div className="dato conf">
              <span>Recetas</span>
              <strong>{totalRecetas}</strong>
            </div>
            <div className="dato pend">
              <span>Referencias</span>
              <strong>{totalReferencias}</strong>
            </div>
            <div className="dato aten">
              <span>Licencias</span>
              <strong>{totalLicencias}</strong>
            </div>
          </div>

          <Seccion icono="lista" titulo="Consultas" sub="De la más reciente a la más antigua">
            <div className="tabla-box">
              <table className="tabla">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Médico</th>
                    <th>Padecimiento</th>
                    <th>Diagnóstico</th>
                    <th>Receta</th>
                  </tr>
                </thead>
                <tbody>
                  {consultas.length === 0 ? (
                    <tr>
                      <td colSpan={5}>
                        <div className="vacio">
                          <span className="vacio-ico"><Icono nombre="lista" tam={26} /></span>
                          <strong>Sin consultas registradas</strong>
                          <span>Las notas médicas del paciente aparecerán aquí.</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    consultas.map((c) => (
                      <tr key={c.idConsulta}>
                        <td>{c.fechaHoraAtendida?.slice(0, 16).replace('T', ' ')}</td>
                        <td>{c.medico ? nombreCompleto(c.medico) : '—'}</td>
                        <td>{c.padecimientoActual}</td>
                        <td>{c.diagnostico}</td>
                        <td>
                          {c.receta ? (
                            <span>
                              <strong>{c.receta.folio}</strong> ({c.receta.detalles?.map((d) => d.medicamento).join(', ')})
                            </span>
                          ) : (
                            <button
                              type="button"
                              className="btn2 chico"
                              onClick={() => {
                                rec?.setConsultaActiva(c.idConsulta)
                                onIr?.('receta')
                              }}
                            >
                              Generar receta
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Seccion>
        </div>
      </div>
    </>
  )
}