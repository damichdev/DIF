import { useState } from 'react'
import Encabezado from '../components/Encabezado.jsx'
import Seccion from '../components/Seccion.jsx'
import Icono from '../components/Icono.jsx'
import {
  ESTATUS, MEDICOS, hoyISO, edad, nombreCompleto, nombreSexo,
} from '../recepcion/datos.js'

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

  const pendientes = rec.citas
    .filter((c) => c.fecha === hoyISO() && c.id_estatus === ESTATUS.PROGRAMADA)
    .sort((a, b) => a.hora.localeCompare(b.hora))

  const cita = pendientes.find((c) => c.id_cita === rec.citaActiva) ?? null
  const paciente = cita ? rec.pacientePorId(cita.id_paciente) : null
  const expediente = paciente ? rec.expedienteDe(paciente.id_paciente) : null
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
    }
    return faltas
  }

  function guardar(e) {
    e.preventDefault()
    const faltas = validar()
    setErrores(faltas)
    if (faltas.length) return

    const registro = rec.guardarSignos(cita.id_cita, {
      ta: v.ta,
      fc: Number(v.fc),
      fr: Number(v.fr),
      temperatura: Number(v.temperatura),
      spo2: Number(v.spo2),
      peso: Number(v.peso),
      talla: Number(v.talla),
      imc: Number(imc),
      glucosa: v.glucosa === '' ? null : Number(v.glucosa),
    })

    setGuardado({ paciente: nombreCompleto(paciente), hora: registro.hora })
    rec.setCitaActiva(null)
    setV(VACIO)
  }

  const medico = cita ? MEDICOS.find((m) => m.id === cita.id_medico)?.nombre : ''

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
            <select id="cita" aria-label="Cita de hoy" value={cita?.id_cita ?? ''} onChange={elegirCita}>
              <option value="">
                {pendientes.length ? 'Selecciona una cita…' : 'No hay citas pendientes hoy'}
              </option>
              {pendientes.map((c) => {
                const p = rec.pacientePorId(c.id_paciente)
                return <option key={c.id_cita} value={c.id_cita}>{c.hora} hrs · {p ? nombreCompleto(p) : '—'}</option>
              })}
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
                <div><dt>Edad / Sexo</dt><dd>{edad(paciente.fecha_nacimiento)} años · {nombreSexo(paciente.id_sexo)}</dd></div>
                <div><dt>CURP</dt><dd>{paciente.curp}</dd></div>
                <div><dt>Expediente</dt><dd>{expediente?.no_expediente}</dd></div>
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
              <button className="btn" type="submit" disabled={!cita}>Guardar signos vitales</button>
            </div>
          </Seccion>
        </form>
      </div>
    </>
  )
}