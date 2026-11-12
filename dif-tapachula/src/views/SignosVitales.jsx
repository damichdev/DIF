import { useCallback, useEffect, useState } from 'react'
import Encabezado from '../components/Encabezado.jsx'
import Seccion from '../components/Seccion.jsx'
import Icono from '../components/Icono.jsx'
import { api, expedienteDe, nombreCompleto } from '../api.js'
import { hoyISO, edad } from '../recepcion/datos.js'

const SIGNOS = [
  { id: 'ta', name: 'ta', etq: 'Tensión arterial', u: 'mmHg', icono: 'corazon', ph: '120/80' },
  { id: 'fc', name: 'fc', etq: 'Frec. cardiaca', u: 'lpm', icono: 'pulso' },
  { id: 'fr', name: 'fr', etq: 'Frec. respiratoria', u: 'rpm', icono: 'viento' },
  { id: 'temp', name: 'temperatura', etq: 'Temperatura', u: '°C', icono: 'termometro' },
  { id: 'spo2', name: 'spo2', etq: 'Saturación O₂', u: '%', icono: 'gota' },
]

const RANGOS = {
  fc: [30, 220, 'Frecuencia cardiaca'],
  fr: [5, 60, 'Frecuencia respiratoria'],
  temperatura: [30, 45, 'Temperatura'],
  spo2: [50, 100, 'Saturación de oxígeno'],
  peso: [0.5, 300, 'Peso'],
  talla: [30, 250, 'Talla'],
  glucosa: [20, 600, 'Glucosa'],
}

const VACIO = { ta: '', fc: '', fr: '', temperatura: '', spo2: '', peso: '', talla: '', glucosa: '' }

function calcularImc(peso, talla) {
  const p = parseFloat(peso)
  const t = parseFloat(talla) / 100
  if (!p || !t || t <= 0) return ''
  return (p / (t * t)).toFixed(1)
}

export default function SignosVitales({ rec, onIr }) {
  const [v, setV] = useState(VACIO)
  const [errores, setErrores] = useState([])
  const [guardado, setGuardado] = useState(null)
  const [ocupado, setOcupado] = useState(false)
  const [lista, setLista] = useState(null) // citas de hoy; null = cargando
  const [detalle, setDetalle] = useState(null) // { idPaciente, paciente, expediente } de la cita elegida

  // Citas de hoy que siguen "Programada" (las que ya tienen signos pasan a "En espera")
  const cargar = useCallback(() => api(`/api/citas?fecha=${hoyISO()}`)
    .then((citas) => setLista(citas.filter((c) => c.nombreEstatus === 'Programada')))
    .catch((err) => {
      setLista([])
      setErrores([`No se pudieron cargar las citas: ${err.message}`])
    }), [])

  useEffect(() => { cargar() }, [cargar])

  const pendientes = lista ?? []
  const cita = pendientes.find((c) => c.idCita === rec.citaActiva) ?? null
  const idPaciente = cita?.paciente.idPaciente

  // Datos completos del paciente (edad, sexo, alergias) de la cita elegida
  useEffect(() => {
    if (!idPaciente) return
    let vigente = true
    Promise.all([api(`/api/pacientes/${idPaciente}`), expedienteDe(idPaciente)])
      .then(([paciente, expediente]) => { if (vigente) setDetalle({ idPaciente, paciente, expediente }) })
      .catch((err) => { if (vigente) setErrores([err.message]) })
    return () => { vigente = false }
  }, [idPaciente])

  const paciente = idPaciente && detalle?.idPaciente === idPaciente ? detalle.paciente : null
  const expediente = paciente ? detalle.expediente : null
  const imc = calcularImc(v.peso, v.talla)

  const set = (k) => (e) => setV({ ...v, [k]: e.target.value.replace(',', '.') })
  const setTa = (e) => setV({ ...v, ta: e.target.value.replace(/[^\d/]/g, '') })

  function elegirCita(e) {
    rec.setCitaActiva(e.target.value ? Number(e.target.value) : null)
    setGuardado(null)
    setErrores([])
    setV(VACIO)
  }

  function validar() {
    const faltas = []
    if (!cita) {
      faltas.push('Elige una cita de la lista.')
      return faltas
    }

    const m = /^(\d{2,3})\/(\d{2,3})$/.exec(v.ta)
    if (!m) faltas.push('La tensión arterial debe registrarse en formato 120/80.')
    else {
      const [sis, dia] = [Number(m[1]), Number(m[2])]
      if (sis < 60 || sis > 260 || dia < 30 || dia > 160 || dia >= sis) {
        faltas.push('Tensión arterial fuera de límites fisiológicos válidos.')
      }
    }

    for (const [campo, [min, max, nombre]] of Object.entries(RANGOS)) {
      if (campo === 'glucosa' && v.glucosa === '') continue
      const n = parseFloat(v[campo])
      if (v[campo] === '' || Number.isNaN(n)) faltas.push(`Ingresa un valor válido para ${nombre.toLowerCase()}.`)
      else if (n < min || n > max) faltas.push(`${nombre} fuera de rango (${min}–${max}).`)
      else if (['fc', 'fr', 'spo2'].includes(campo) && !Number.isInteger(n)) {
        faltas.push(`${nombre} debe ser un número entero.`)
      }
    }
    return faltas
  }

  async function guardar(e) {
    e.preventDefault()
    if (ocupado) return
    const faltas = validar()
    setErrores(faltas)
    if (faltas.length) return

    setOcupado(true)
    try {
      // El servidor valida, calcula el IMC y pasa la cita a «En espera» en la misma operación
      const r = await api(`/api/citas/${cita.idCita}/signos`, 'PUT', {
        ta: v.ta,
        fc: Number(v.fc),
        fr: Number(v.fr),
        temperatura: Number(v.temperatura),
        spo2: Number(v.spo2),
        peso: Number(v.peso),
        talla: Number(v.talla),
        glucosa: v.glucosa === '' ? null : Number(v.glucosa),
      })
      setGuardado({ paciente: nombreCompleto(r.paciente), hora: r.signosVitales.fechaRegistro.slice(11, 16) })
      rec.setCitaActiva(null)
      setV(VACIO)
      await cargar()
    } catch (err) {
      setErrores([err.message])
    } finally {
      setOcupado(false)
    }
  }

  const medico = cita ? [cita.medico.nombre, cita.medico.apPaterno].filter(Boolean).join(' ') : ''

  return (
    <>
      <Encabezado
        icono="pulso"
        area="Recepción"
        titulo="Registrar signos vitales"
        sub="Se guardan ligados a la cita y el médico los ve al abrir la consulta"
      />

      <div className="cont split">
        <div className="col-form stack">
          <Seccion icono="reloj" titulo="Cita" sub="Citas programadas para el día de hoy">
            <select id="cita" aria-label="Cita de hoy" value={cita?.idCita ?? ''} onChange={elegirCita}>
              <option value="">
                {lista === null ? 'Cargando citas…' : pendientes.length ? 'Selecciona una cita…' : 'No hay citas pendientes hoy'}
              </option>
              {pendientes.map((c) => (
                <option key={c.idCita} value={c.idCita}>{c.hora.slice(0, 5)} hrs · {nombreCompleto(c.paciente)}</option>
              ))}
            </select>
            {pendientes.length === 0 && (
              <p className="mini">
                <button type="button" className="link" onClick={() => onIr('agendar')}>Agendar una cita</button>
              </p>
            )}
          </Seccion>

          <Seccion icono="usuario" titulo="Paciente">
            {paciente ? (
              <dl className="datos-pac">
                <div><dt>Nombre</dt><dd>{nombreCompleto(paciente)}</dd></div>
                <div><dt>Edad / Sexo</dt><dd>{edad(paciente.fechaNacimiento)} años · {paciente.nombreSexo}</dd></div>
                <div><dt>CURP</dt><dd>{paciente.curp}</dd></div>
                <div><dt>Expediente</dt><dd>{expediente?.noExpediente ?? 'sin expediente'}</dd></div>
                <div><dt>Médico asignado</dt><dd>{medico}</dd></div>
                <div><dt>Motivo</dt><dd>{cita.motivo}</dd></div>
                {expediente?.alergias && <div><dt>Alergias</dt><dd>{expediente.alergias}</dd></div>}
              </dl>
            ) : (
              <div className="vacio">
                <span className="vacio-ico"><Icono nombre="usuario" tam={26} /></span>
                <strong>Sin paciente seleccionado</strong>
                <span>Elige una cita programada para cargar los datos.</span>
              </div>
            )}
          </Seccion>
        </div>

        <form className="col-main" onSubmit={guardar} noValidate>
          <Seccion icono="pulso" titulo="Signos vitales" sub="Captura de constantes somatométricas y fisiológicas">
            {guardado && (
              <div className="ok chico" role="status">
                <Icono nombre="check" tam={18} />
                <div>
                  <strong>Signos de {guardado.paciente} guardados a las {guardado.hora} hrs</strong>
                  <span>La cita pasó a «En espera» y está lista para el médico.</span>
                </div>
                <button type="button" className="btn2 chico" onClick={() => onIr('agendar')}>Ver agenda</button>
              </div>
            )}
            {errores.length > 0 && (
              <div className="err" role="alert">
                <ul>{errores.map((m) => <li key={m}>{m}</li>)}</ul>
              </div>
            )}

            <fieldset className="sin-borde" disabled={!cita}>
              <div className="signos">
                {SIGNOS.map((s) => (
                  <div key={s.id} className="signo">
                    <label htmlFor={s.id}>
                      <span className="signo-ico"><Icono nombre={s.icono} tam={16} /></span>
                      {s.etq}
                    </label>
                    <div className="con-unidad">
                      <input
                        id={s.id}
                        inputMode={s.id === 'ta' ? 'text' : 'decimal'}
                        placeholder={s.ph ?? '—'}
                        value={v[s.name]}
                        onChange={s.id === 'ta' ? setTa : set(s.name)}
                      />
                      <span>{s.u}</span>
                    </div>
                  </div>
                ))}

                <div className="signo">
                  <label htmlFor="peso">
                    <span className="signo-ico"><Icono nombre="bascula" tam={16} /></span>
                    Peso
                  </label>
                  <div className="con-unidad">
                    <input id="peso" inputMode="decimal" placeholder="—" value={v.peso} onChange={set('peso')} />
                    <span>kg</span>
                  </div>
                </div>

                <div className="signo">
                  <label htmlFor="talla">
                    <span className="signo-ico"><Icono nombre="regla" tam={16} /></span>
                    Talla
                  </label>
                  <div className="con-unidad">
                    <input id="talla" inputMode="decimal" placeholder="—" value={v.talla} onChange={set('talla')} />
                    <span>cm</span>
                  </div>
                </div>

                <div className="signo imc">
                  <label htmlFor="imc">
                    <span className="signo-ico"><Icono nombre="calcular" tam={16} /></span>
                    IMC (calculado)
                  </label>
                  <div className="con-unidad">
                    <input id="imc" value={imc} placeholder="—" readOnly />
                    <span>kg/m²</span>
                  </div>
                </div>

                <div className="signo">
                  <label htmlFor="glucosa">
                    <span className="signo-ico"><Icono nombre="gota" tam={16} /></span>
                    Glucosa (opcional)
                  </label>
                  <div className="con-unidad">
                    <input id="glucosa" inputMode="decimal" placeholder="—" value={v.glucosa} onChange={set('glucosa')} />
                    <span>mg/dL</span>
                  </div>
                </div>
              </div>
            </fieldset>

            <div className="barra-acciones dentro">
              <p className="mini">
                <Icono nombre="info" tam={14} /> El IMC se calcula automáticamente con el peso (kg) y talla (cm).
              </p>
              <button className="btn" type="submit" disabled={!cita || ocupado}>{ocupado ? 'Guardando…' : 'Guardar signos vitales'}</button>
            </div>
          </Seccion>
        </form>
      </div>
    </>
  )
}