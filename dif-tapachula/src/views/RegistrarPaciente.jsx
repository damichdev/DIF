import { useEffect, useState } from 'react'
import Encabezado from '../components/Encabezado.jsx'
import Seccion from '../components/Seccion.jsx'
import Icono from '../components/Icono.jsx'
import { api, buscarPacientes, nombreCompleto } from '../api.js'
import { TIPOS_SANGRE, edad } from '../recepcion/datos.js'

const VACIO = {
  nombrePaciente: '', apPaterno: '', apMaterno: '', curp: '', fechaNacimiento: '',
  idSexo: '', telefono: '', idDerechoAmbiente: '', tutor: '', telTutor: '',
  tipoSangre: '', alergias: '', antecedentes: '',
}

const CURP_RE = /^[A-Z]{4}\d{6}[HMX][A-Z]{2}[B-DF-HJ-NP-TV-Z]{3}[A-Z0-9]\d$/

export default function RegistrarPaciente({ rec, onIr }) {
  const [catalogos, setCatalogos] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [resultados, setResultados] = useState(null)
  const [nuevo, setNuevo] = useState(false)
  const [form, setForm] = useState(VACIO)
  const [errores, setErrores] = useState([])
  const [creado, setCreado] = useState(null)
  const [ocupado, setOcupado] = useState(false)
  const [editando, setEditando] = useState(null) // { idPaciente, idExpediente, noExpediente, fechaApertura }
  const [ver, setVer] = useState(null) // { paciente, expediente } del panel de solo lectura
  const [aviso, setAviso] = useState('')

  useEffect(() => {
    api('/api/pacientes/catalogos')
      .then(setCatalogos)
      .catch(() => setErrores(['No se pudieron cargar los catálogos. Verifica que el servidor esté en línea.']))
  }, [])

  const años = edad(form.fechaNacimiento)
  const esMenor = años !== null && años >= 0 && años < 18

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  async function buscar(e) {
    e.preventDefault()
    setErrores([])
    setOcupado(true)
    setNuevo(false)
    setEditando(null)
    setVer(null)
    setAviso('')
    setCreado(null)
    try {
      setResultados(await buscarPacientes(busqueda))
    } catch (err) {
      setResultados(null)
      setErrores([err.message])
    } finally {
      setOcupado(false)
    }
  }

  function empezarRegistro() {
    setForm(VACIO)
    setErrores([])
    setCreado(null)
    setEditando(null)
    setVer(null)
    setAviso('')
    setNuevo(true)
  }

  function verExpediente(paciente, expediente) {
    setVer({ paciente, expediente })
    setNuevo(false)
    setEditando(null)
    setCreado(null)
    setAviso('')
    setErrores([])
  }

  // Abre el mismo formulario con los datos actuales para corregirlos
  function editar(paciente, expediente) {
    setForm({
      nombrePaciente: paciente.nombrePaciente,
      apPaterno: paciente.apPaterno,
      apMaterno: paciente.apMaterno ?? '',
      curp: paciente.curp,
      fechaNacimiento: paciente.fechaNacimiento,
      idSexo: String(paciente.idSexo),
      telefono: paciente.telefono ?? '',
      idDerechoAmbiente: String(paciente.idDerechoAmbiente),
      tutor: paciente.tutor ?? '',
      telTutor: paciente.telTutor ?? '',
      tipoSangre: expediente?.tipoSangre ?? '',
      alergias: expediente?.alergias ?? '',
      antecedentes: expediente?.antecedentes ?? '',
    })
    setEditando({
      idPaciente: paciente.idPaciente,
      idExpediente: expediente?.idExpedienteClinico ?? null,
      noExpediente: expediente?.noExpediente ?? null,
      fechaApertura: expediente?.fechaApertura ?? null,
    })
    setVer(null)
    setCreado(null)
    setAviso('')
    setErrores([])
    setNuevo(true)
  }

  function cancelarFormulario() {
    setNuevo(false)
    setEditando(null)
    setErrores([])
  }

  function irAAgendar(idPaciente) {
    rec.setPacienteActivo(idPaciente)
    onIr('agendar')
  }

  function validar() {
    const e = []
    const curpProcesada = form.curp.trim().toUpperCase()

    if (!form.nombrePaciente.trim()) e.push('Escribe el nombre del paciente.')
    if (!form.apPaterno.trim()) e.push('Escribe el apellido paterno.')
    if (!CURP_RE.test(curpProcesada)) e.push('La CURP no es válida (requiere 18 caracteres en formato oficial).')
    if (!form.fechaNacimiento) e.push('Indica la fecha de nacimiento.')
    else if (años < 0) e.push('La fecha de nacimiento no puede ser futura.')
    if (!form.idSexo) e.push('Selecciona el sexo.')
    if (!form.idDerechoAmbiente) e.push('Selecciona la derechohabiencia.')
    if (!form.tipoSangre) e.push('Selecciona el tipo de sangre.')
    if (form.telefono && !/^\d{10}$/.test(form.telefono)) e.push('El teléfono del paciente debe tener 10 dígitos.')
    if (esMenor && !form.tutor.trim()) e.push('Paciente menor de edad: registra el nombre del tutor responsable.')
    if (esMenor && form.telTutor && !/^\d{10}$/.test(form.telTutor)) {
      e.push('El teléfono del tutor debe contener 10 dígitos.')
    }
    return e
  }

  const cuerpoPaciente = () => ({
    nombrePaciente: form.nombrePaciente.trim(),
    apPaterno: form.apPaterno.trim(),
    apMaterno: form.apMaterno.trim() || null,
    curp: form.curp.trim().toUpperCase(),
    fechaNacimiento: form.fechaNacimiento,
    telefono: form.telefono || null,
    idSexo: Number(form.idSexo),
    idDerechoAmbiente: Number(form.idDerechoAmbiente),
    tutor: esMenor ? form.tutor.trim() : null,
    telTutor: esMenor && form.telTutor ? form.telTutor : null,
  })

  const cuerpoExpediente = () => ({
    tipoSangre: form.tipoSangre,
    alergias: form.alergias.trim() || null,
    antecedentes: form.antecedentes.trim() || null,
  })

  // Paciente y expediente son servicios distintos: se guardan en dos pasos y se avisa si solo se logró el primero
  async function guardarCambios() {
    setOcupado(true)
    let paciente = null
    try {
      paciente = await api(`/api/pacientes/${editando.idPaciente}`, 'PUT', cuerpoPaciente())
      const expediente = editando.idExpediente
        ? await api(`/api/expedientes/${editando.idExpediente}`, 'PUT', cuerpoExpediente())
        : await api('/api/expedientes', 'POST', { idPaciente: paciente.idPaciente, ...cuerpoExpediente() })
      setResultados((lista) => lista?.map((f) => (
        f.paciente.idPaciente === paciente.idPaciente ? { paciente, expediente } : f)) ?? null)
      setAviso(`Los datos de ${nombreCompleto(paciente)} se actualizaron correctamente.`)
      setVer({ paciente, expediente })
      setNuevo(false)
      setEditando(null)
      setForm(VACIO)
      setErrores([])
    } catch (err) {
      setErrores([paciente
        ? `Los datos personales se guardaron, pero el expediente no: ${err.message}`
        : err.message])
    } finally {
      setOcupado(false)
    }
  }

  async function registrar(e) {
    e.preventDefault()
    if (ocupado) return
    const faltas = validar()
    setErrores(faltas)
    if (faltas.length) return

    if (editando) {
      await guardarCambios()
      return
    }

    setOcupado(true)
    let paciente = null
    try {
      paciente = await api('/api/pacientes', 'POST', cuerpoPaciente())
      // El número de expediente y la fecha de apertura los asigna el servidor
      const expediente = await api('/api/expedientes', 'POST', { idPaciente: paciente.idPaciente, ...cuerpoExpediente() })
      setCreado({ paciente, expediente })
      setNuevo(false)
      setResultados(null)
      setBusqueda('')
      setForm(VACIO)
    } catch (err) {
      // Paciente y expediente son servicios distintos: si falla el segundo, se deshace el primero
      if (paciente) {
        await api(`/api/pacientes/${paciente.idPaciente}`, 'DELETE').catch(() => {})
      }
      setErrores([err.message])
    } finally {
      setOcupado(false)
    }
  }

  return (
    <>
      <Encabezado
        icono="usuarioMas"
        area="Recepción"
        titulo="Registrar paciente"
        sub="Busca un paciente o da de alta uno nuevo junto con su expediente"
        accion={
          <button type="button" className="btn" onClick={empezarRegistro} disabled={nuevo}>
            Registrar paciente nuevo
          </button>
        }
      />

      <div className="cont">
        {creado && (
          <div className="ok" role="status">
            <Icono nombre="check" tam={20} />
            <div>
              <strong>{nombreCompleto(creado.paciente)} quedó registrado correctamente</strong>
              <span>Expediente {creado.expediente.noExpediente} aperturado el {creado.expediente.fechaApertura}.</span>
            </div>
            <div className="botones">
              <button type="button" className="btn2" onClick={() => setCreado(null)}>Registrar otro</button>
              <button type="button" className="btn" onClick={() => irAAgendar(creado.paciente.idPaciente)}>
                Agendar cita
              </button>
            </div>
          </div>
        )}

        {aviso && (
          <div className="ok chico" role="status">
            <Icono nombre="check" tam={18} />
            <div><strong>{aviso}</strong></div>
          </div>
        )}

        <Seccion icono="buscar" titulo="Buscar paciente" sub="Por CURP, nombre o número de expediente">
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
            <button className="btn" type="submit" disabled={busqueda.trim().length < 2 || ocupado}>Buscar</button>
          </form>

          {resultados && resultados.length > 0 && (
            <ul className="res-lista">
              {resultados.map(({ paciente, expediente }) => (
                <li key={paciente.idPaciente}>
                  <div>
                    <strong>{nombreCompleto(paciente)}</strong>
                    <span>
                      {paciente.curp} · {edad(paciente.fechaNacimiento)} años · {paciente.nombreSexo} · Exp: {expediente?.noExpediente ?? 'sin expediente'}
                    </span>
                  </div>
                  <div className="botones">
                    <button type="button" className="btn2" onClick={() => verExpediente(paciente, expediente)}>
                      Ver expediente
                    </button>
                    <button type="button" className="btn2" onClick={() => editar(paciente, expediente)}>
                      Editar
                    </button>
                    <button type="button" className="btn2" onClick={() => irAAgendar(paciente.idPaciente)}>
                      Agendar cita
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {resultados && resultados.length === 0 && !nuevo && (
            <div className="vacio">
              <span className="vacio-ico"><Icono nombre="usuario" tam={26} /></span>
              <strong>No se encontró ningún paciente con esos datos</strong>
              <span>Verifica la ortografía o da de alta al paciente con el botón de arriba.</span>
            </div>
          )}

        </Seccion>

        {ver && (
          <Seccion
            icono="expediente"
            titulo={`Expediente ${ver.expediente?.noExpediente ?? '(sin expediente)'}`}
            sub={nombreCompleto(ver.paciente)}
          >
            <dl className="datos-pac">
              <div><dt>CURP</dt><dd>{ver.paciente.curp}</dd></div>
              <div><dt>Fecha de nacimiento</dt><dd>{ver.paciente.fechaNacimiento} ({edad(ver.paciente.fechaNacimiento)} años)</dd></div>
              <div><dt>Sexo</dt><dd>{ver.paciente.nombreSexo}</dd></div>
              <div><dt>Teléfono</dt><dd>{ver.paciente.telefono ?? '—'}</dd></div>
              <div><dt>Derechohabiencia</dt><dd>{ver.paciente.nombreDerechoAmbiente}</dd></div>
              {ver.paciente.tutor && (
                <div><dt>Tutor</dt><dd>{ver.paciente.tutor}{ver.paciente.telTutor ? ` · ${ver.paciente.telTutor}` : ''}</dd></div>
              )}
              <div><dt>Fecha de apertura</dt><dd>{ver.expediente?.fechaApertura ?? '—'}</dd></div>
              <div><dt>Tipo de sangre</dt><dd>{ver.expediente?.tipoSangre ?? '—'}</dd></div>
              <div><dt>Alergias</dt><dd>{ver.expediente?.alergias || 'Ninguna registrada'}</dd></div>
              <div><dt>Antecedentes</dt><dd>{ver.expediente?.antecedentes || 'Ninguno registrado'}</dd></div>
            </dl>
            <div className="barra-acciones dentro">
              <p className="mini">Aquí se ve la ficha de identificación; la historia clínica la lleva el médico.</p>
              <div className="botones">
                <button type="button" className="btn2" onClick={() => setVer(null)}>Cerrar</button>
                <button type="button" className="btn2" onClick={() => editar(ver.paciente, ver.expediente)}>Editar datos</button>
                <button type="button" className="btn" onClick={() => irAAgendar(ver.paciente.idPaciente)}>Agendar cita</button>
              </div>
            </div>
          </Seccion>
        )}

        {nuevo && (
          <form onSubmit={registrar} noValidate className="paso2">
            {errores.length > 0 && (
              <div className="err" role="alert">
                <ul>{errores.map((m) => <li key={m}>{m}</li>)}</ul>
              </div>
            )}

            <div className="grid2">
              <Seccion icono="usuario" titulo={editando ? 'Editar datos del paciente' : 'Datos del paciente'} sub="Información personal y contacto">
                <div className="f">
                  <label htmlFor="nombre">Nombre(s)</label>
                  <input id="nombre" value={form.nombrePaciente} onChange={set('nombrePaciente')} placeholder="Ej. Ana María" />
                </div>

                <div className="fila2">
                  <div className="f">
                    <label htmlFor="app">Apellido paterno</label>
                    <input id="app" value={form.apPaterno} onChange={set('apPaterno')} />
                  </div>
                  <div className="f">
                    <label htmlFor="apm">Apellido materno</label>
                    <input id="apm" value={form.apMaterno} onChange={set('apMaterno')} />
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
                    <input id="fn" type="date" value={form.fechaNacimiento} onChange={set('fechaNacimiento')} />
                    {años !== null && años >= 0 && <p className="mini">{años} años cumplidos</p>}
                  </div>
                  <div className="f">
                    <label htmlFor="sexo">Sexo</label>
                    <select id="sexo" value={form.idSexo} onChange={set('idSexo')}>
                      <option value="">Selecciona…</option>
                      {catalogos?.sexos.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
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
                    <select id="da" value={form.idDerechoAmbiente} onChange={set('idDerechoAmbiente')}>
                      <option value="">Selecciona…</option>
                      {catalogos?.derechos.map((d) => <option key={d.id} value={d.id}>{d.nombre}</option>)}
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
                          value={form.telTutor}
                          onChange={(e) => setForm({ ...form, telTutor: e.target.value.replace(/\D/g, '') })}
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
                    <input id="nexp" value={editando ? (editando.noExpediente ?? 'Se asignará al guardar') : 'Asignado por sistema'} readOnly />
                  </div>
                  <div className="f">
                    <label htmlFor="fa">Fecha apertura</label>
                    <input id="fa" value={editando ? (editando.fechaApertura ?? 'Hoy') : 'Hoy'} readOnly />
                  </div>
                  <div className="f">
                    <label htmlFor="ts">Tipo de sangre</label>
                    <select id="ts" value={form.tipoSangre} onChange={set('tipoSangre')}>
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
              <p className="mini">{editando ? 'Los cambios se guardan en el paciente y en su expediente.' : 'El expediente se vincula automáticamente al guardar al paciente.'}</p>
              <div className="botones">
                <button className="btn2" type="button" onClick={cancelarFormulario}>Cancelar</button>
                <button className="btn" type="submit" disabled={ocupado || !catalogos}>{ocupado ? 'Guardando…' : editando ? 'Guardar cambios' : 'Registrar paciente'}</button>
              </div>
            </div>
          </form>
        )}
      </div>
    </>
  )
}