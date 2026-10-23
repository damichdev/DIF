import { useState } from 'react'
import Encabezado from '../components/Encabezado.jsx'
import Seccion from '../components/Seccion.jsx'
import Icono from '../components/Icono.jsx'

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
            <select id="cita" name="id_cita" aria-label="Cita de hoy">
              <option value="">Selecciona una cita…</option>
            </select>
          </Seccion>

          <Seccion icono="usuario" titulo="Paciente">
            <div className="vacio">
              <span className="vacio-ico"><Icono nombre="usuario" tam={26} /></span>
              <strong>Sin paciente seleccionado</strong>
              <span>Elige una cita para ver sus datos.</span>
            </div>
          </Seccion>
        </div>

        {/* ---------- Tabla Signos Vitales ---------- */}
        <form className="col-main">
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
                    <input id={s.id} name={s.name} inputMode="decimal" placeholder={s.ph ?? '—'} />
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

            <div className="barra-acciones dentro">
              <p className="mini">
                <Icono nombre="info" tam={14} /> El IMC se calcula con peso y talla: kg ÷ m².
              </p>
              <button className="btn" type="button">Guardar signos vitales</button>
            </div>
          </Seccion>
        </form>
      </div>
    </>
  )
}