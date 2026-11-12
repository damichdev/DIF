import { useEffect, useState } from 'react'
import Encabezado from '../components/Encabezado.jsx'
import Seccion from '../components/Seccion.jsx'
import Icono from '../components/Icono.jsx'
import { api, hoy, nombreCompleto } from '../api.js'

// Cada signo: id, name (atributo del MER), etiqueta, unidad, icono y ejemplo
const SIGNOS = [
  { id: 'ta', name: 'ta', etq: 'Tensión arterial', u: 'mmHg', icono: 'corazon', ph: '120/80' },
  { id: 'fc', name: 'fc', etq: 'Frec. cardiaca', u: 'lpm', icono: 'pulso' },
  { id: 'fr', name: 'fr', etq: 'Frec. respiratoria', u: 'rpm', icono: 'viento' },
  { id: 'temp', name: 'temperatura', etq: 'Temperatura', u: '°C', icono: 'termometro' },
  { id: 'spo2', name: 'spo2', etq: 'Saturación O₂', u: '%', icono: 'gota' },
]

export default function SignosVitales() {
  const [peso, setPeso] = useState('')
  const [talla, setTalla] = useState('')
  const [citas, setCitas] = useState([])
  const [idCita, setIdCita] = useState('')
  const [msg, setMsg] = useState(null)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    api('/api/citas')
      .then((cs) => setCitas(cs.filter((c) => c.fecha === hoy()).sort((a, b) => a.hora.localeCompare(b.hora))))
      .catch((err) => setMsg({ ok: false, texto: 'No se pudieron cargar las citas: ' + err.message }))
  }, [])

  const cita = citas.find((c) => String(c.idCita) === idCita)

  function elegir(id) {
    const c = citas.find((x) => String(x.idCita) === id)
    setIdCita(id)
    setPeso(c?.signosVitales?.peso ?? '')
    setTalla(c?.signosVitales?.talla ?? '')
    setMsg(null)
  }

  async function guardar(e) {
    e.preventDefault()
    if (!cita) {
      setMsg({ ok: false, texto: 'Primero elige una cita.' })
      return
    }
    const d = Object.fromEntries(new FormData(e.target))
    const num = (v) => (v === '' ? null : Number(v))
    setEnviando(true)
    setMsg(null)
    try {
      const nueva = await api(`/api/citas/${cita.idCita}/signos`, 'PUT', {
        ta: d.ta || null,
        fc: num(d.fc),
        fr: num(d.fr),
        temperatura: num(d.temperatura),
        spo2: num(d.spo2),
        peso: num(d.peso),
        talla: num(d.talla),
      })
      setCitas((cs) => cs.map((c) => (c.idCita === nueva.idCita ? nueva : c)))
      setMsg({ ok: true, texto: `Signos guardados. IMC registrado: ${nueva.signosVitales?.imc ?? '—'}.` })
    } catch (err) {
      setMsg({ ok: false, texto: err.message })
    } finally {
      setEnviando(false)
    }
  }

  // IMC = peso (kg) / talla (m)²
  function calcularImc() {
    const p = parseFloat(peso)
    const t = parseFloat(talla) / 100
    if (!p || !t) return ''
    return (p / (t * t)).toFixed(1)
  }

  return (
    <>
      <Encabezado
        icono="pulso"
        area="Recepción"
        titulo="Registrar signos vitales"
        sub="Se guardan ligados a la cita y el médico los ve al abrir la consulta"
      />

      <div className="cont split">
        {/* ---------- Cita y paciente ---------- */}
        <div className="col-form stack">
          <Seccion icono="reloj" titulo="Cita" sub="Elige la cita de hoy">
            <select id="cita" name="idCita" aria-label="Cita de hoy" value={idCita} onChange={(e) => elegir(e.target.value)}>
              <option value="">{citas.length ? 'Selecciona una cita…' : 'No hay citas hoy'}</option>
              {citas.map((c) => (
                <option key={c.idCita} value={c.idCita}>
                  {c.hora.slice(0, 5)} · {c.paciente ? nombreCompleto(c.paciente) : `Cita #${c.idCita}`}{c.signosVitales ? ' ✓' : ''}
                </option>
              ))}
            </select>
          </Seccion>

          <Seccion icono="usuario" titulo="Paciente">
            {cita ? (
              <div>
                <strong>{cita.paciente ? nombreCompleto(cita.paciente) : '—'}</strong>
                <p className="mini">CURP: {cita.paciente?.curp ?? '—'}</p>
                <p className="mini">Médico: {cita.medico ? nombreCompleto(cita.medico) : '—'}</p>
                <p className="mini">Motivo: {cita.motivo}</p>
              </div>
            ) : <div className="vacio">
              <span className="vacio-ico"><Icono nombre="usuario" tam={26} /></span>
              <strong>Sin paciente seleccionado</strong>
              <span>Elige una cita para ver sus datos.</span>
            </div>}
          </Seccion>
        </div>

        {/* ---------- Tabla Signos Vitales ---------- */}
        <form className="col-main" key={idCita} onSubmit={guardar}>
          <Seccion icono="pulso" titulo="Signos vitales" sub="Captura los valores medidos al paciente">
            <div className="signos">
              {/* los 5 signos del arreglo */}
              {SIGNOS.map((s) => (
                <div key={s.id} className="signo">
                  <label htmlFor={s.id}>
                    <span className="signo-ico"><Icono nombre={s.icono} tam={16} /></span>
                    {s.etq}
                  </label>
                  <div className="con-unidad">
                    <input id={s.id} name={s.name} inputMode="decimal" placeholder={s.ph ?? '—'}
                      defaultValue={cita?.signosVitales?.[s.name] ?? ''} />
                    <span>{s.u}</span>
                  </div>
                </div>
              ))}

              {/* peso y talla van aparte porque calculan el IMC */}
              <div className="signo">
                <label htmlFor="peso">
                  <span className="signo-ico"><Icono nombre="bascula" tam={16} /></span>
                  Peso
                </label>
                <div className="con-unidad">
                  <input id="peso" name="peso" inputMode="decimal" placeholder="—"
                    value={peso} onChange={(e) => setPeso(e.target.value)} />
                  <span>kg</span>
                </div>
              </div>

              <div className="signo">
                <label htmlFor="talla">
                  <span className="signo-ico"><Icono nombre="regla" tam={16} /></span>
                  Talla
                </label>
                <div className="con-unidad">
                  <input id="talla" name="talla" inputMode="decimal" placeholder="—"
                    value={talla} onChange={(e) => setTalla(e.target.value)} />
                  <span>cm</span>
                </div>
              </div>

              {/* IMC: se calcula solo */}
              <div className="signo imc">
                <label htmlFor="imc">
                  <span className="signo-ico"><Icono nombre="calcular" tam={16} /></span>
                  IMC (automático)
                </label>
                <div className="con-unidad">
                  <input id="imc" name="imc" value={calcularImc()} placeholder="—" readOnly />
                  <span>kg/m²</span>
                </div>
              </div>
            </div>

            {msg && <p className={msg.ok ? 'ok' : 'err'} role="status">{msg.texto}</p>}
            <div className="barra-acciones dentro">
              <p className="mini">
                <Icono nombre="info" tam={14} /> El IMC se calcula con peso y talla: kg ÷ m².
              </p>
              <button className="btn" type="submit" disabled={enviando}>{enviando ? 'Guardando…' : 'Guardar signos vitales'}</button>
            </div>
          </Seccion>
        </form>
      </div>
    </>
  )
}