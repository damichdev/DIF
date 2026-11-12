import { useEffect, useState } from 'react'
import Encabezado from '../components/Encabezado.jsx'
import Seccion from '../components/Seccion.jsx'
import Icono from '../components/Icono.jsx'
import { api, buscarPacientes, expedienteDe, nombreCompleto } from '../api.js'
import { edad } from '../recepcion/datos.js'

const CATEGORIAS = ['Sindicalizado', 'Institucionalizado', 'Confianza', 'Foráneo', 'Beneficiario']
const SANGRE = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const FORM_VACIO = {
  tipo_sangre: '',
  categoria: 'Beneficiario',
  area: '',
  beneficiario_de: '',
  tutor: '',
  tel_tutor: '',
  alergias: '',
  ant_heredofamiliares: '',
  ant_no_patologicos: '',
  ant_patologicos: '',
  fecha_inicio: '',
  sintomas_inicio: '',
  evolucion: '',
  sintomatologia_actual: '',
  consentimiento: true,
}

function armarAntecedentes(f) {
  return [
    `Categoría: ${f.categoria || 'Beneficiario'}`,
    f.area ? `Área: ${f.area}` : '',
    f.beneficiario_de ? `Beneficiario de: ${f.beneficiario_de}` : '',
    f.ant_heredofamiliares ? `Heredofamiliares: ${f.ant_heredofamiliares}` : '',
    f.ant_no_patologicos ? `No patológicos: ${f.ant_no_patologicos}` : '',
    f.ant_patologicos ? `Patológicos: ${f.ant_patologicos}` : '',
    f.sintomatologia_actual ? `Padecimiento inicial: ${f.sintomatologia_actual}` : '',
  ].filter(Boolean).join('\n')
}

function leerCampo(texto, etiqueta) {
  if (!texto) return ''
  const reg = new RegExp(`${etiqueta}:\\s*([^\\n]+)`, 'i')
  const m = reg.exec(texto)
  return m ? m[1].trim() : ''
}

export default function ExpedienteClinico({ rec, onIr }) {
  const [busqueda, setBusqueda] = useState('')
  const [resultados, setResultados] = useState([])
  const [paciente, setPaciente] = useState(null)
  const [expediente, setExpediente] = useState(null)
  const [form, setForm] = useState(FORM_VACIO)
  const [errores, setErrores] = useState([])
  const [guardado, setGuardado] = useState(null)
  const [ocupado, setOcupado] = useState(false)

  async function cargarPaciente(idPaciente) {
    if (!idPaciente) return
    setErrores([])
    try {
      const [pac, exp] = await Promise.all([
        api(`/api/pacientes/${idPaciente}`),
        expedienteDe(idPaciente),
      ])
      setPaciente(pac)
      setExpediente(exp)
      setForm({
        ...FORM_VACIO,
        tipo_sangre: exp?.tipoSangre ?? '',
        alergias: exp?.alergias ?? '',
        tutor: pac?.nombreTutor ?? '',
        tel_tutor: pac?.telefono ?? '',
        categoria: leerCampo(exp?.antecedentes, 'Categoría') || 'Beneficiario',
        area: leerCampo(exp?.antecedentes, 'Área'),
        beneficiario_de: leerCampo(exp?.antecedentes, 'Beneficiario de'),
        ant_heredofamiliares: leerCampo(exp?.antecedentes, 'Heredofamiliares'),
        ant_no_patologicos: leerCampo(exp?.antecedentes, 'No patológicos'),
        ant_patologicos: leerCampo(exp?.antecedentes, 'Patológicos'),
        sintomatologia_actual: leerCampo(exp?.antecedentes, 'Padecimiento inicial'),
      })
    } catch (err) {
      setErrores([err.message])
    }
  }

  useEffect(() => {
    if (rec?.pacienteActivo) {
      cargarPaciente(rec.pacienteActivo)
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

  const set = (campo) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((prev) => ({ ...prev, [campo]: val }))
  }

  async function guardar(e) {
    e.preventDefault()
    if (ocupado) return
    const faltas = []
    if (!paciente) faltas.push('Primero busca y selecciona a un paciente.')
    if (!form.tipo_sangre) faltas.push('Selecciona el tipo de sangre del paciente.')
    setErrores(faltas)
    if (faltas.length > 0) return

    setOcupado(true)
    setGuardado(null)
    try {
      const cuerpo = {
        idPaciente: paciente.idPaciente,
        tipoSangre: form.tipo_sangre,
        alergias: form.alergias.trim() || 'Ninguna conocida',
        antecedentes: armarAntecedentes(form),
      }
      const resp = expediente?.idExpedienteClinico
        ? await api(`/api/expedientes/${expediente.idExpedienteClinico}`, 'PUT', cuerpo)
        : await api('/api/expedientes', 'POST', cuerpo)

      setExpediente(resp)
      setGuardado(`Expediente ${resp.noExpediente} guardado correctamente.`)
    } catch (err) {
      setErrores([err.message])
    } finally {
      setOcupado(false)
    }
  }

  return (
    <>
      <Encabezado
        icono="carpeta"
        area="Médico"
        titulo="Expediente clínico"
        sub="Ficha de identificación e historia clínica del paciente"
      />

      <form className="cont split" onSubmit={guardar}>
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
                      cargarPaciente(p.idPaciente)
                    }}
                  >
                    {nombreCompleto(p)} · {ex?.noExpediente ?? 'Sin exp.'}
                  </button>
                ))}
              </div>
            )}
          </Seccion>

          <Seccion icono="usuario" titulo="Ficha de identificación">
            {paciente ? (
              <dl className="datos-pac">
                <div><dt>Nombre</dt><dd>{nombreCompleto(paciente)}</dd></div>
                <div><dt>Edad / Sexo</dt><dd>{edad(paciente.fechaNacimiento)} años · {paciente.nombreSexo}</dd></div>
                <div><dt>CURP</dt><dd>{paciente.curp}</dd></div>
                <div><dt>Derechohabiencia</dt><dd>{paciente.nombreDerechoHabiente}</dd></div>
                <div><dt>Teléfono</dt><dd>{paciente.telefono || '—'}</dd></div>
                <div><dt>Domicilio</dt><dd>{paciente.domicilio || '—'}</dd></div>
              </dl>
            ) : (
              <div className="vacio">
                <span className="vacio-ico"><Icono nombre="usuario" tam={26} /></span>
                <strong>Sin paciente seleccionado</strong>
                <span>Nombre, edad, sexo, CURP y derecho ambiente aparecerán aquí.</span>
              </div>
            )}
          </Seccion>
        </div>

        <div className="col-main stack">
          <Seccion icono="expediente" titulo="Datos del expediente" sub="Portada del expediente">
            {guardado && (
              <div className="ok chico" role="status">
                <Icono nombre="check" tam={18} />
                <div>
                  <strong>{guardado}</strong>
                  <span>Ya puedes iniciar la consulta médica del paciente.</span>
                </div>
                <button type="button" className="btn2 chico" onClick={() => onIr?.('consulta')}>
                  Ir a consulta
                </button>
              </div>
            )}
            {errores.length > 0 && (
              <div className="err" role="alert">
                <ul>{errores.map((m) => <li key={m}>{m}</li>)}</ul>
              </div>
            )}

            <div className="fila3">
              <div className="f">
                <label htmlFor="nexp">No. expediente</label>
                <input id="nexp" value={expediente?.noExpediente ?? ''} placeholder="Automático" readOnly />
              </div>
              <div className="f">
                <label htmlFor="fa">Fecha de apertura</label>
                <input id="fa" value={expediente?.fechaApertura ?? ''} placeholder="Automática" readOnly />
              </div>
              <div className="f">
                <label htmlFor="ts">Tipo de sangre</label>
                <select id="ts" name="tipo_sangre" value={form.tipo_sangre} onChange={set('tipo_sangre')}>
                  <option value="">—</option>
                  {SANGRE.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="f">
              <label>Categoría</label>
              <div className="opciones">
                {CATEGORIAS.map((c) => (
                  <label key={c} className="opcion">
                    <input
                      type="radio"
                      name="categoria"
                      value={c}
                      checked={form.categoria === c}
                      onChange={set('categoria')}
                    /> {c}
                  </label>
                ))}
              </div>
            </div>

            <div className="fila2">
              <div className="f">
                <label htmlFor="area">Área</label>
                <input id="area" name="area" value={form.area} onChange={set('area')} placeholder="Área de trabajo del empleado" />
              </div>
              <div className="f">
                <label htmlFor="benef">Beneficiario de</label>
                <input id="benef" name="beneficiario_de" value={form.beneficiario_de} onChange={set('beneficiario_de')} placeholder="Nombre del trabajador" />
              </div>
            </div>

            <div className="fila2">
              <div className="f">
                <label htmlFor="tutor">Nombre del tutor(a)</label>
                <input id="tutor" name="tutor" value={form.tutor} onChange={set('tutor')} placeholder="Solo si es menor de edad" />
              </div>
              <div className="f">
                <label htmlFor="ttel">Teléfono o celular</label>
                <input id="ttel" name="tel_tutor" type="tel" maxLength={10} value={form.tel_tutor} onChange={set('tel_tutor')} placeholder="10 dígitos" />
              </div>
            </div>
          </Seccion>

          <Seccion icono="lista" titulo="Antecedentes" sub="Interrogatorio de la historia clínica">
            <div className="f">
              <label htmlFor="alg">Alergias</label>
              <input id="alg" name="alergias" value={form.alergias} onChange={set('alergias')} placeholder="Ej. Penicilina · deja vacío si no tiene" />
            </div>
            <div className="f">
              <label htmlFor="ahf">Heredofamiliares</label>
              <textarea id="ahf" name="ant_heredofamiliares" rows={3} value={form.ant_heredofamiliares} onChange={set('ant_heredofamiliares')} placeholder="Diabetes, hipertensión, cáncer en la familia…" />
            </div>
            <div className="f">
              <label htmlFor="apnp">Personales no patológicos</label>
              <textarea id="apnp" name="ant_no_patologicos" rows={3} value={form.ant_no_patologicos} onChange={set('ant_no_patologicos')} placeholder="Alimentación, higiene, vivienda, tabaquismo, alcoholismo…" />
            </div>
            <div className="f">
              <label htmlFor="app">Personales patológicos</label>
              <textarea id="app" name="ant_patologicos" rows={3} value={form.ant_patologicos} onChange={set('ant_patologicos')} placeholder="Enfermedades previas, cirugías, hospitalizaciones…" />
            </div>
          </Seccion>

          <Seccion icono="estetoscopio" titulo="Padecimiento actual">
            <div className="fila2">
              <div className="f">
                <label htmlFor="fini">Fecha de iniciación</label>
                <input id="fini" name="fecha_inicio" type="date" value={form.fecha_inicio} onChange={set('fecha_inicio')} />
              </div>
              <div className="f">
                <label htmlFor="sini">Principales síntomas de iniciación</label>
                <input id="sini" name="sintomas_inicio" value={form.sintomas_inicio} onChange={set('sintomas_inicio')} />
              </div>
            </div>
            <div className="f">
              <label htmlFor="evo">Evolución</label>
              <textarea id="evo" name="evolucion" rows={3} value={form.evolucion} onChange={set('evolucion')} />
            </div>
            <div className="f">
              <label htmlFor="sact">Sintomatología actual</label>
              <textarea id="sact" name="sintomatologia_actual" rows={3} value={form.sintomatologia_actual} onChange={set('sintomatologia_actual')} />
            </div>

            <label className="opcion">
              <input type="checkbox" name="consentimiento" checked={form.consentimiento} onChange={set('consentimiento')} /> El paciente o tutor firmó el consentimiento informado
            </label>
          </Seccion>

          <div className="barra-acciones">
            <p className="mini">El número de expediente y la fecha de apertura los asigna el sistema.</p>
            <div className="botones">
              <button className="btn2" type="button" onClick={() => setForm(FORM_VACIO)}>Limpiar</button>
              <button className="btn" type="submit" disabled={!paciente || ocupado}>
                {ocupado ? 'Guardando…' : expediente ? 'Actualizar expediente' : 'Guardar expediente'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </>
  )
}