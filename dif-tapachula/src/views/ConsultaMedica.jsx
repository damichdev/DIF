import { useCallback, useEffect, useState } from 'react'
import Encabezado from '../components/Encabezado.jsx'
import Seccion from '../components/Seccion.jsx'
import Icono from '../components/Icono.jsx'
import { api, expedienteDe, nombreCompleto } from '../api.js'
import { edad, hoyISO } from '../recepcion/datos.js'

const SIGNOS = [
  { id: 'ta', campo: 'ta', etq: 'T/A', u: 'mmHg', icono: 'corazon' },
  { id: 'fc', campo: 'fc', etq: 'FC', u: 'lpm', icono: 'pulso' },
  { id: 'fr', campo: 'fr', etq: 'FR', u: 'rpm', icono: 'viento' },
  { id: 'temp', campo: 'temperatura', etq: 'Temp.', u: '°C', icono: 'termometro' },
  { id: 'spo2', campo: 'spo2', etq: 'SpO₂', u: '%', icono: 'gota' },
  { id: 'peso', campo: 'peso', etq: 'Peso', u: 'kg', icono: 'bascula' },
  { id: 'talla', campo: 'talla', etq: 'Talla', u: 'cm', icono: 'regla' },
  { id: 'imc', campo: 'imc', etq: 'IMC', u: 'kg/m²', icono: 'calcular' },
]

const COORDINACIONES = ['TEA / Equino', 'Nutrición', 'Odontología', 'Med. Gral.', 'Psicología', 'UBR']
const ESTUDIOS = ['Laboratorio', 'Gabinete', 'Hospital']
const MOTIVOS_LIC = ['Enfermedad profesional', 'Probable riesgo de trabajo', 'Enfermedad / accidente', 'Prenatal', 'Posparto', 'Transmisión']

function leerSesion() {
  try { return JSON.parse(sessionStorage.getItem('sesion')) } catch { return null }
}

export default function ConsultaMedica({ rec, onIr }) {
  const sesion = leerSesion()
  const [citas, setCitas] = useState([])
  const [idCitaSel, setIdCitaSel] = useState(rec?.citaActiva ?? '')
  const [paciente, setPaciente] = useState(null)
  const [expediente, setExpediente] = useState(null)
  const [interrogatorio, setInterrogatorio] = useState('')
  const [padecimiento, setPadecimiento] = useState('')
  const [exploracion, setExploracion] = useState('')
  const [diagnostico, setDiagnostico] = useState('')
  const [referencia, setReferencia] = useState(false)
  const [licencia, setLicencia] = useState(false)
  const [errores, setErrores] = useState([])
  const [guardado, setGuardado] = useState(null)
  const [ocupado, setOcupado] = useState(false)

  const cargarCitas = useCallback(() => {
    api(`/api/citas?fecha=${hoyISO()}`)
      .then((todas) => {
        const delMedico = sesion?.idMedico
          ? todas.filter((c) => c.medico?.idMedico === sesion.idMedico)
          : todas
        const disponibles = delMedico.filter((c) => c.nombreEstatus !== 'Cancelada')
        setCitas(disponibles)
        if (!idCitaSel && rec?.citaActiva) {
          setIdCitaSel(rec.citaActiva)
        } else if (!idCitaSel && rec?.pacienteActivo) {
          const dePac = disponibles.find((c) => c.paciente?.idPaciente === rec.pacienteActivo)
          if (dePac) setIdCitaSel(dePac.idCita)
        }
      })
      .catch((err) => setErrores([err.message]))
  }, [sesion?.idMedico, rec?.citaActiva, rec?.pacienteActivo, idCitaSel])

  useEffect(() => { cargarCitas() }, [cargarCitas])

  const citaActual = citas.find((c) => c.idCita === Number(idCitaSel)) ?? null
  const idPaciente = citaActual?.paciente?.idPaciente ?? rec?.pacienteActivo

  useEffect(() => {
    if (!idPaciente) {
      setPaciente(null)
      setExpediente(null)
      return
    }
    let activo = true
    Promise.all([api(`/api/pacientes/${idPaciente}`), expedienteDe(idPaciente)])
      .then(([pac, exp]) => {
        if (activo) {
          setPaciente(pac)
          setExpediente(exp)
        }
      })
      .catch((err) => { if (activo) setErrores([err.message]) })
    return () => { activo = false }
  }, [idPaciente])

  const sv = citaActual?.signosVitales ?? {}

  async function guardar(e) {
    e.preventDefault()
    if (ocupado) return
    const datosForm = Object.fromEntries(new FormData(e.target))

    const faltas = []
    if (!citaActual) faltas.push('Selecciona una cita del día de hoy.')
    if (!expediente?.idExpedienteClinico) {
      faltas.push('El paciente aún no tiene Expediente Clínico abierto. Ábrelo primero en la pestaña «Expediente clínico».')
    }
    if (!padecimiento.trim()) faltas.push('El padecimiento actual es obligatorio.')
    if (!diagnostico.trim()) faltas.push('El diagnóstico (IDX) es obligatorio.')
    setErrores(faltas)
    if (faltas.length > 0) return

    let extras = []
    if (referencia) {
      extras.push(`[REFERENCIA: Servicio=${datosForm.ref_servicio || 'N/A'}, Urgencia=${datosForm.ref_urgencia || 'no'}, Coord=${datosForm.ref_coordinacion || ''}, Motivo=${datosForm.ref_motivo || ''}]`)
    }
    if (licencia) {
      extras.push(`[LICENCIA: Días=${datosForm.lic_dias || '0'}, Inicia=${datosForm.lic_inicia || ''}, Termina=${datosForm.lic_termina || ''}, Motivo=${datosForm.lic_motivo || ''}]`)
    }
    const expFisicaFinal = [exploracion.trim(), ...extras].filter(Boolean).join('\n')

    setOcupado(true)
    setGuardado(null)
    try {
      const resp = await api('/api/consultas', 'POST', {
        idCita: citaActual.idCita,
        idMedico: citaActual.medico?.idMedico ?? sesion?.idMedico ?? 1,
        idExpedienteClinico: expediente.idExpedienteClinico,
        interrogatorio: interrogatorio.trim(),
        padecimientoActual: padecimiento.trim(),
        exploracionFisica: expFisicaFinal,
        diagnostico: diagnostico.trim(),
      })
      rec?.setConsultaActiva(resp.idConsulta)
      rec?.setPacienteActivo(idPaciente)
      setGuardado(resp)
      await cargarCitas()
    } catch (err) {
      setErrores([err.message])
    } finally {
      setOcupado(false)
    }
  }

  return (
    <>
      <Encabezado
        icono="estetoscopio"
        area="Médico"
        titulo="Consulta médica"
        sub="Nota médica de la cita, con referencia y licencia si se requieren"
      />

      <form className="cont split" onSubmit={guardar}>
        <div className="col-form stack">
          <Seccion icono="reloj" titulo="Cita" sub="Elige la cita de hoy">
            <select
              name="id_cita"
              aria-label="Cita de hoy"
              value={idCitaSel}
              onChange={(e) => {
                setIdCitaSel(e.target.value ? Number(e.target.value) : '')
                rec?.setCitaActiva(e.target.value ? Number(e.target.value) : null)
                setGuardado(null)
                setErrores([])
              }}
            >
              <option value="">{citas.length ? 'Selecciona una cita…' : 'No hay citas registradas hoy'}</option>
              {citas.map((c) => (
                <option key={c.idCita} value={c.idCita}>
                  {c.hora?.slice(0, 5)} hrs · {nombreCompleto(c.paciente)} ({c.nombreEstatus})
                </option>
              ))}
            </select>
          </Seccion>

          <Seccion icono="usuario" titulo="Paciente">
            {paciente ? (
              <dl className="datos-pac">
                <div><dt>Nombre</dt><dd>{nombreCompleto(paciente)}</dd></div>
                <div><dt>Edad / Sexo</dt><dd>{edad(paciente.fechaNacimiento)} años · {paciente.nombreSexo}</dd></div>
                <div><dt>CURP</dt><dd>{paciente.curp}</dd></div>
                <div><dt>Expediente</dt><dd>{expediente?.noExpediente ?? 'Sin expediente'}</dd></div>
                <div><dt>Alergias</dt><dd>{expediente?.alergias ?? '—'}</dd></div>
                {!expediente && (
                  <div style={{ marginTop: 8 }}>
                    <button
                      type="button"
                      className="btn chico"
                      onClick={() => {
                        rec?.setPacienteActivo(paciente.idPaciente)
                        onIr?.('expediente')
                      }}
                    >
                      Abrir expediente primero
                    </button>
                  </div>
                )}
              </dl>
            ) : (
              <div className="vacio">
                <span className="vacio-ico"><Icono nombre="usuario" tam={26} /></span>
                <strong>Sin paciente seleccionado</strong>
                <span>Nombre, edad, categoría y alergias aparecerán aquí.</span>
              </div>
            )}
          </Seccion>

          <Seccion icono="pulso" titulo="Signos vitales" sub="Registrados por enfermería">
            <div className="signos">
              {SIGNOS.map((s) => (
                <div key={s.id} className="signo">
                  <label htmlFor={`c-${s.id}`}>
                    <span className="signo-ico"><Icono nombre={s.icono} tam={16} /></span>
                    {s.etq}
                  </label>
                  <div className="con-unidad">
                    <input id={`c-${s.id}`} value={sv[s.campo] ?? ''} placeholder="—" readOnly />
                    <span>{s.u}</span>
                  </div>
                </div>
              ))}
              <div className="signo">
                <label htmlFor="glu">
                  <span className="signo-ico"><Icono nombre="gota" tam={16} /></span>
                  Glucosa
                </label>
                <div className="con-unidad">
                  <input id="glu" name="glucosa" defaultValue={sv.glucosa ?? ''} inputMode="decimal" placeholder="—" />
                  <span>mg/dL</span>
                </div>
              </div>
            </div>
          </Seccion>
        </div>

        <div className="col-main stack">
          <Seccion icono="estetoscopio" titulo="Nota médica" sub="Datos de la tabla Consulta Médica">
            {guardado && (
              <div className="ok chico" role="status">
                <Icono nombre="check" tam={18} />
                <div>
                  <strong>Consulta #{guardado.idConsulta} registrada con éxito</strong>
                  <span>La cita cambió a estatus «Atendida».</span>
                </div>
                <button type="button" className="btn chico" onClick={() => onIr?.('receta')}>
                  Generar receta
                </button>
              </div>
            )}
            {errores.length > 0 && (
              <div className="err" role="alert">
                <ul>{errores.map((m) => <li key={m}>{m}</li>)}</ul>
              </div>
            )}

            <div className="fila2">
              <div className="f">
                <label htmlFor="fh">Fecha y hora atendida</label>
                <input id="fh" value={guardado?.fechaHoraAtendida?.slice(0, 16).replace('T', ' ') ?? ''} placeholder="Automática" readOnly />
              </div>
              <div className="f">
                <label htmlFor="alg">Alergias</label>
                <input id="alg" value={expediente?.alergias ?? ''} placeholder="Del expediente" readOnly />
              </div>
            </div>
            <div className="f">
              <label htmlFor="inte">Interrogatorio</label>
              <textarea id="inte" name="interrogatorio" rows={3} value={interrogatorio} onChange={(e) => setInterrogatorio(e.target.value)} />
            </div>
            <div className="f">
              <label htmlFor="pad">Padecimiento actual</label>
              <textarea id="pad" name="padecimiento_actual" rows={3} value={padecimiento} onChange={(e) => setPadecimiento(e.target.value)} />
            </div>
            <div className="f">
              <label htmlFor="exp">Exploración física</label>
              <textarea id="exp" name="exploracion_fisica" rows={4} value={exploracion} onChange={(e) => setExploracion(e.target.value)} />
            </div>
            <div className="f">
              <label htmlFor="dx">Diagnóstico (IDX)</label>
              <textarea id="dx" name="diagnostico" rows={2} value={diagnostico} onChange={(e) => setDiagnostico(e.target.value)} />
            </div>

            <div className="opciones">
              <label className="opcion">
                <input type="checkbox" checked={referencia} onChange={(e) => setReferencia(e.target.checked)} />
                Requiere hoja de referencia
              </label>
              <label className="opcion">
                <input type="checkbox" checked={licencia} onChange={(e) => setLicencia(e.target.checked)} />
                Requiere licencia médica
              </label>
            </div>
          </Seccion>

          {referencia && (
            <Seccion icono="expediente" titulo="Hoja de referencia" sub="Folio automático">
              <div className="fila2">
                <div className="f">
                  <label htmlFor="urg">Urgencia</label>
                  <select id="urg" name="ref_urgencia">
                    <option value="no">No</option>
                    <option value="si">Sí</option>
                  </select>
                </div>
                <div className="f">
                  <label htmlFor="serv">Servicio al que se envía</label>
                  <input id="serv" name="ref_servicio" placeholder="Ej. Hospital General, Cardiología" />
                </div>
              </div>
              <div className="f">
                <label>Coordinación que envía</label>
                <div className="opciones">
                  {COORDINACIONES.map((c) => (
                    <label key={c} className="opcion">
                      <input type="radio" name="ref_coordinacion" value={c} defaultChecked={c === 'Med. Gral.'} /> {c}
                    </label>
                  ))}
                </div>
              </div>
              <div className="f">
                <label>Estudios / referencia a</label>
                <div className="opciones">
                  {ESTUDIOS.map((c) => (
                    <label key={c} className="opcion">
                      <input type="checkbox" name={`ref_${c.toLowerCase()}`} /> {c}
                    </label>
                  ))}
                </div>
              </div>
              <div className="f">
                <label htmlFor="rmot">Motivo de la referencia (resumen clínico)</label>
                <textarea id="rmot" name="ref_motivo" rows={3} />
              </div>
              <div className="f">
                <label htmlFor="rimp">Impresión diagnóstica</label>
                <textarea id="rimp" name="ref_impresion" rows={2} />
              </div>
            </Seccion>
          )}

          {licencia && (
            <Seccion icono="calendario" titulo="Licencia médica" sub="Folio automático">
              <div className="fila3">
                <div className="f">
                  <label htmlFor="ldias">Días otorgados</label>
                  <input id="ldias" name="lic_dias" type="number" min={1} />
                </div>
                <div className="f">
                  <label htmlFor="lini">Inicia</label>
                  <input id="lini" name="lic_inicia" type="date" />
                </div>
                <div className="f">
                  <label htmlFor="lfin">Termina</label>
                  <input id="lfin" name="lic_termina" type="date" />
                </div>
              </div>
              <div className="fila2">
                <div className="f">
                  <label htmlFor="lcar">Carácter</label>
                  <select id="lcar" name="lic_caracter">
                    <option>Inicial</option>
                    <option>Subsecuente</option>
                  </select>
                </div>
                <div className="f">
                  <label htmlFor="lnc">No. de cobro</label>
                  <input id="lnc" name="lic_no_cobro" />
                </div>
              </div>
              <div className="f">
                <label>Motivo</label>
                <div className="opciones">
                  {MOTIVOS_LIC.map((m) => (
                    <label key={m} className="opcion">
                      <input type="radio" name="lic_motivo" value={m} /> {m}
                    </label>
                  ))}
                </div>
              </div>
            </Seccion>
          )}

          <div className="barra-acciones">
            <p className="mini">
              <Icono nombre="info" tam={14} /> Al guardar, la cita cambia a estatus "Atendida".
            </p>
            <div className="botones">
              <button
                className="btn2"
                type="button"
                onClick={() => {
                  setInterrogatorio('')
                  setPadecimiento('')
                  setExploracion('')
                  setDiagnostico('')
                }}
              >
                Limpiar
              </button>
              <button className="btn" type="submit" disabled={ocupado}>
                {ocupado ? 'Guardando…' : 'Guardar consulta'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </>
  )
}