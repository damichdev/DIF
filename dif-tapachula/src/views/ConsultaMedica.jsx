import { useState } from 'react'
import Encabezado from '../components/Encabezado.jsx'
import Seccion from '../components/Seccion.jsx'
import Icono from '../components/Icono.jsx'

// Signos que capturó enfermería (solo lectura para el médico)
const SIGNOS = [
  { id: 'ta', etq: 'T/A', u: 'mmHg', icono: 'corazon' },
  { id: 'fc', etq: 'FC', u: 'lpm', icono: 'pulso' },
  { id: 'fr', etq: 'FR', u: 'rpm', icono: 'viento' },
  { id: 'temp', etq: 'Temp.', u: '°C', icono: 'termometro' },
  { id: 'spo2', etq: 'SpO₂', u: '%', icono: 'gota' },
  { id: 'peso', etq: 'Peso', u: 'kg', icono: 'bascula' },
  { id: 'talla', etq: 'Talla', u: 'cm', icono: 'regla' },
  { id: 'imc', etq: 'IMC', u: 'kg/m²', icono: 'calcular' },
]

// Formatos "Hoja de referencia" y "Licencia médica"
const COORDINACIONES = ['TEA / Equino', 'Nutrición', 'Odontología', 'Med. Gral.', 'Psicología', 'UBR']
const ESTUDIOS = ['Laboratorio', 'Gabinete', 'Hospital']
const MOTIVOS_LIC = ['Enfermedad profesional', 'Probable riesgo de trabajo', 'Enfermedad / accidente', 'Prenatal', 'Posparto', 'Transmisión']

export default function ConsultaMedica() {
  const [referencia, setReferencia] = useState(false)
  const [licencia, setLicencia] = useState(false)

  function guardar(e) {
    e.preventDefault()
    const datos = Object.fromEntries(new FormData(e.target))
    console.log('Consulta a guardar:', datos)
    alert('Datos listos para enviar. Revisa la consola (F12).')
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
        {/* ---------- Cita, paciente y signos ---------- */}
        <div className="col-form stack">
          <Seccion icono="reloj" titulo="Cita" sub="Elige la cita de hoy">
            <select name="id_cita" aria-label="Cita de hoy">
              <option value="">Selecciona una cita…</option>
            </select>
          </Seccion>

          <Seccion icono="usuario" titulo="Paciente">
            <div className="vacio">
              <span className="vacio-ico"><Icono nombre="usuario" tam={26} /></span>
              <strong>Sin paciente seleccionado</strong>
              <span>Nombre, edad, categoría y alergias aparecerán aquí.</span>
            </div>
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
                    <input id={`c-${s.id}`} placeholder="—" readOnly />
                    <span>{s.u}</span>
                  </div>
                </div>
              ))}
              {/* la glucosa la toma el médico en la nota */}
              <div className="signo">
                <label htmlFor="glu">
                  <span className="signo-ico"><Icono nombre="gota" tam={16} /></span>
                  Glucosa
                </label>
                <div className="con-unidad">
                  <input id="glu" name="glucosa" inputMode="decimal" placeholder="—" />
                  <span>mg/dL</span>
                </div>
              </div>
            </div>
          </Seccion>
        </div>

        <div className="col-main stack">
          {/* ---------- Tabla Consulta Médica (Nota médica) ---------- */}
          <Seccion icono="estetoscopio" titulo="Nota médica" sub="Datos de la tabla Consulta Médica">
            <div className="fila2">
              <div className="f">
                <label htmlFor="fh">Fecha y hora atendida</label>
                <input id="fh" placeholder="Automática" readOnly />
              </div>
              <div className="f">
                <label htmlFor="alg">Alergias</label>
                <input id="alg" placeholder="Del expediente" readOnly />
              </div>
            </div>
            <div className="f">
              <label htmlFor="inte">Interrogatorio</label>
              <textarea id="inte" name="interrogatorio" rows={3} />
            </div>
            <div className="f">
              <label htmlFor="pad">Padecimiento actual</label>
              <textarea id="pad" name="padecimiento_actual" rows={3} />
            </div>
            <div className="f">
              <label htmlFor="exp">Exploración física</label>
              <textarea id="exp" name="exploracion_fisica" rows={4} />
            </div>
            <div className="f">
              <label htmlFor="dx">Diagnóstico (IDX)</label>
              <textarea id="dx" name="diagnostico" rows={2} />
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

          {/* ---------- Hoja de referencia ---------- */}
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

          {/* ---------- Licencia médica ---------- */}
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

          {/* ---------- Botones ---------- */}
          <div className="barra-acciones">
            <p className="mini">
              <Icono nombre="info" tam={14} /> Al guardar, la cita cambia a estatus "Atendida".
            </p>
            <div className="botones">
              <button className="btn2" type="reset">Limpiar</button>
              <button className="btn" type="submit">Guardar consulta</button>
            </div>
          </div>
        </div>
      </form>
    </>
  )
}
