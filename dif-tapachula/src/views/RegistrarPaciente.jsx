import { useState } from 'react'
import Encabezado from '../components/Encabezado.jsx'
import Seccion from '../components/Seccion.jsx'
import Icono from '../components/Icono.jsx'
import {
  SEXOS, DERECHOS, TIPOS_SANGRE, edad, nombreCompleto, nombreSexo,
} from '../recepcion/datos.js'

const VACIO = {
  nombre: '', ap_paterno: '', ap_materno: '', curp: '', fecha_nacimiento: '',
  id_sexo: '', telefono: '', id_derecho: '', tutor: '', tel_tutor: '',
  tipo_sangre: '', alergias: '', antecedentes: '',
}

const CURP_RE = /^[A-Z]{4}\d{6}[HMX][A-Z]{2}[B-DF-HJ-NP-TV-Z]{3}[A-Z0-9]\d$/
const pareceCurp = (t) => /^[A-Z]{4}\d/.test(t.trim().toUpperCase())

export default function RegistrarPaciente({ rec, onIr }) {
  const [busqueda, setBusqueda] = useState('')
  const [resultados, setResultados] = useState(null)
  const [nuevo, setNuevo] = useState(false)
  const [form, setForm] = useState(VACIO)
  const [errores, setErrores] = useState([])
  const [creado, setCreado] = useState(null)

  const años = edad(form.fecha_nacimiento)
  const esMenor = años !== null && años >= 0 && años < 18

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  function buscar(e) {
    e.preventDefault()
    setResultados(rec.buscar(busqueda))
    setNuevo(false)
    setCreado(null)
  }

  function empezarRegistro() {
    const curpLimpia = pareceCurp(busqueda) ? busqueda.trim().toUpperCase() : ''
    setForm({ ...VACIO, curp: curpLimpia })
    setErrores([])
    setNuevo(true)
  }

  function irAAgendar(idPaciente) {
    rec.setPacienteActivo(idPaciente)
    onIr('agendar')
  }

  function validar() {
    const e = []
    const curpProcesada = form.curp.trim().toUpperCase()

    if (!form.nombre.trim()) e.push('Escribe el nombre del paciente.')
    if (!form.ap_paterno.trim()) e.push('Escribe el apellido paterno.')
    if (!CURP_RE.test(curpProcesada)) e.push('La CURP no es válida (requiere 18 caracteres en formato oficial).')
    else if (rec.pacientes.some((p) => p.curp === curpProcesada)) {
      e.push('Ya existe un paciente registrado con esa CURP. Búscalo en el paso 1.')
    }
    if (!form.fecha_nacimiento) e.push('Indica la fecha de nacimiento.')
    else if (años < 0) e.push('La fecha de nacimiento no puede ser futura.')
    if (!form.id_sexo) e.push('Selecciona el sexo.')
    if (form.telefono && !/^\d{10}$/.test(form.telefono)) e.push('El teléfono del paciente debe tener 10 dígitos.')
    if (esMenor && !form.tutor.trim()) e.push('Paciente menor de edad: registra el nombre del tutor responsable.')
    if (esMenor && form.tel_tutor && !/^\d{10}$/.test(form.tel_tutor)) {
      e.push('El teléfono del tutor debe contener 10 dígitos.')
    }
    return e
  }

  function registrar(e) {
    e.preventDefault()
    const faltas = validar()
    setErrores(faltas)
    if (faltas.length) return

    const r = rec.registrarPaciente(
      {
        nombre: form.nombre.trim(),
        ap_paterno: form.ap_paterno.trim(),
        ap_materno: form.ap_materno.trim(),
        curp: form.curp.trim().toUpperCase(),
        fecha_nacimiento: form.fecha_nacimiento,
        id_sexo: Number(form.id_sexo),
        telefono: form.telefono,
        id_derecho: form.id_derecho ? Number(form.id_derecho) : null,
        tutor: esMenor ? form.tutor.trim() : '',
        tel_tutor: esMenor ? form.tel_tutor : '',
      },
      {
        tipo_sangre: form.tipo_sangre,
        alergias: form.alergias.trim(),
        antecedentes: form.antecedentes.trim(),
      },
    )
    setCreado(r)
    setNuevo(false)
    setResultados(null)
    setBusqueda('')
    setForm(VACIO)
  }

  return (
    <>
      <Encabezado
        icono="usuarioMas"
        area="Recepción"
        titulo="Registrar paciente"
        sub="Busca al paciente; si es de primera vez, se da de alta junto con su expediente"
      />

      <div className="cont">
        {creado && (
          <div className="ok" role="status">
            <Icono nombre="check" tam={20} />
            <div>
              <strong>{nombreCompleto(creado.paciente)} quedó registrado correctamente</strong>
              <span>Expediente {creado.expediente.no_expediente} aperturado el {creado.expediente.fecha_apertura}.</span>
            </div>
            <div className="botones">
              <button type="button" className="btn2" onClick={() => setCreado(null)}>Registrar otro</button>
              <button type="button" className="btn" onClick={() => irAAgendar(creado.paciente.id_paciente)}>
                Agendar cita
              </button>
            </div>
          </div>
        )}

        <Seccion icono="buscar" titulo="1. Buscar paciente" sub="Por CURP, nombre o número de expediente">
          <form onSubmit={buscar} className="busca">
            <div className="con-ico">
              <Icono nombre="buscar" tam={16} />
              <input
                aria-label="Buscar paciente"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="CURP, nombre o No. de expediente…"
              />
            </div>
            <button className="btn" type="submit" disabled={busqueda.trim().length < 2}>Buscar</button>
          </form>

          {resultados && resultados.length > 0 && (
            <ul className="res-lista">
              {resultados.map(({ paciente, expediente }) => (
                <li key={paciente.id_paciente}>
                  <div>
                    <strong>{nombreCompleto(paciente)}</strong>
                    <span>
                      {paciente.curp} · {edad(paciente.fecha_nacimiento)} años · {nombreSexo(paciente.id_sexo)} · Exp: {expediente?.no_expediente}
                    </span>
                  </div>
                  <button type="button" className="btn2" onClick={() => irAAgendar(paciente.id_paciente)}>
                    Agendar cita
                  </button>
                </li>
              ))}
            </ul>
          )}

          {resultados && resultados.length === 0 && !nuevo && (
            <div className="vacio">
              <span className="vacio-ico"><Icono nombre="usuario" tam={26} /></span>
              <strong>No se encontró ningún paciente con esos datos</strong>
              <span>Verifica la ortografía o procede a darle de alta.</span>
              <button type="button" className="btn" onClick={empezarRegistro}>Registrar paciente nuevo</button>
            </div>
          )}

          {resultados && resultados.length > 0 && !nuevo && (
            <p className="mini">
              ¿No coincide? <button type="button" className="link" onClick={empezarRegistro}>Registrar paciente nuevo</button>
            </p>
          )}
        </Seccion>

        {nuevo && (
          <form onSubmit={registrar} noValidate className="paso2">
            {errores.length > 0 && (
              <div className="err" role="alert">
                <ul>{errores.map((m) => <li key={m}>{m}</li>)}</ul>
              </div>
            )}

            <div className="grid2">
              <Seccion icono="usuario" titulo="2. Datos del paciente" sub="Información personal y contacto">
                <div className="f">
                  <label htmlFor="nombre">Nombre(s)</label>
                  <input id="nombre" value={form.nombre} onChange={set('nombre')} placeholder="Ej. Ana María" />
                </div>

                <div className="fila2">
                  <div className="f">
                    <label htmlFor="app">Apellido paterno</label>
                    <input id="app" value={form.ap_paterno} onChange={set('ap_paterno')} />
                  </div>
                  <div className="f">
                    <label htmlFor="apm">Apellido materno</label>
                    <input id="apm" value={form.ap_materno} onChange={set('ap_materno')} />
                  </div>
                </div>

                <div className="f">
                  <label htmlFor="curp">CURP</label>
                  <input
                    id="curp"
                    maxLength={18}
                    className="mayus"
                    placeholder="18 caracteres"
                    value={form.curp}
                    onChange={(e) => setForm({ ...form, curp: e.target.value.toUpperCase() })}
                  />
                </div>

                <div className="fila2">
                  <div className="f">
                    <label htmlFor="fn">Fecha de nacimiento</label>
                    <input id="fn" type="date" value={form.fecha_nacimiento} onChange={set('fecha_nacimiento')} />
                    {años !== null && años >= 0 && <p className="mini">{años} años cumplidos</p>}
                  </div>
                  <div className="f">
                    <label htmlFor="sexo">Sexo</label>
                    <select id="sexo" value={form.id_sexo} onChange={set('id_sexo')}>
                      <option value="">Selecciona…</option>
                      {SEXOS.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                    </select>
                  </div>
                </div>

                <div className="fila2">
                  <div className="f">
                    <label htmlFor="tel">Teléfono</label>
                    <input
                      id="tel"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="10 dígitos"
                      value={form.telefono}
                      onChange={(e) => setForm({ ...form, telefono: e.target.value.replace(/\D/g, '') })}
                    />
                  </div>
                  <div className="f">
                    <label htmlFor="da">Derechohabiencia</label>
                    <select id="da" value={form.id_derecho} onChange={set('id_derecho')}>
                      <option value="">Selecciona…</option>
                      {DERECHOS.map((d) => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                    </select>
                  </div>
                </div>

                {esMenor && (
                  <div className="tutor">
                    <p className="mini"><Icono nombre="info" tam={14} /> Menor de edad: requiere datos del tutor.</p>
                    <div className="fila2">
                      <div className="f">
                        <label htmlFor="tutor">Nombre del tutor</label>
                        <input id="tutor" value={form.tutor} onChange={set('tutor')} />
                      </div>
                      <div className="f">
                        <label htmlFor="ttel">Teléfono del tutor</label>
                        <input
                          id="ttel"
                          type="tel"
                          inputMode="numeric"
                          maxLength={10}
                          value={form.tel_tutor}
                          onChange={(e) => setForm({ ...form, tel_tutor: e.target.value.replace(/\D/g, '') })}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </Seccion>

              <Seccion icono="expediente" titulo="Expediente clínico" sub="Generación automática de expediente">
                <div className="fila3">
                  <div className="f">
                    <label htmlFor="nexp">No. expediente</label>
                    <input id="nexp" value="Asignado por sistema" readOnly />
                  </div>
                  <div className="f">
                    <label htmlFor="fa">Fecha apertura</label>
                    <input id="fa" value="Hoy" readOnly />
                  </div>
                  <div className="f">
                    <label htmlFor="ts">Tipo de sangre</label>
                    <select id="ts" value={form.tipo_sangre} onChange={set('tipo_sangre')}>
                      <option value="">—</option>
                      {TIPOS_SANGRE.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div className="f">
                  <label htmlFor="alg">Alergias</label>
                  <input
                    id="alg"
                    value={form.alergias}
                    onChange={set('alergias')}
                    placeholder="Ej. Penicilina (dejar vacío si niega)"
                  />
                </div>

                <div className="f">
                  <label htmlFor="ant">Antecedentes</label>
                  <textarea
                    id="ant"
                    rows={7}
                    value={form.antecedentes}
                    onChange={set('antecedentes')}
                    placeholder="Antecedentes hereditarios, patológicos y personales…"
                  />
                </div>
              </Seccion>
            </div>

            <div className="barra-acciones">
              <p className="mini">El expediente se vincula automáticamente al guardar al paciente.</p>
              <div className="botones">
                <button className="btn2" type="button" onClick={() => { setNuevo(false); setErrores([]) }}>Cancelar</button>
                <button className="btn" type="submit">Registrar paciente</button>
              </div>
            </div>
          </form>
        )}
      </div>
    </>
  )
}