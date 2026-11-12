import { useState } from 'react'
import Encabezado from '../components/Encabezado.jsx'
import Seccion from '../components/Seccion.jsx'
import Icono from '../components/Icono.jsx'

// Un renglón = un registro de Detalle Receta
const VACIO = { medicamento: '', presentacion: '', dosis: '', duracion: '' }

export default function GenerarReceta() {
  const [meds, setMeds] = useState([{ ...VACIO }])

  function cambiar(i, campo, valor) {
    setMeds(meds.map((m, k) => (k === i ? { ...m, [campo]: valor } : m)))
  }

  function generar(e) {
    e.preventDefault()
    const datos = Object.fromEntries(new FormData(e.target))
    console.log('Receta a generar:', { ...datos, detalle: meds })
    alert('Datos listos para enviar. Revisa la consola (F12).')
  }

  return (
    <>
      <Encabezado
        icono="pastilla"
        area="Médico"
        titulo="Generar receta"
        sub="Receta ligada a la consulta del paciente"
      />

      <form className="cont split" onSubmit={generar} onReset={() => setMeds([{ ...VACIO }])}>
        {/* ---------- Datos de la receta ---------- */}
        <div className="col-form stack">
          <Seccion icono="estetoscopio" titulo="Consulta" sub="Elige la consulta de hoy">
            <select name="id_consulta" aria-label="Consulta">
              <option value="">Selecciona una consulta…</option>
            </select>
          </Seccion>

          <Seccion icono="expediente" titulo="Datos de la receta">
            <div className="fila2">
              <div className="f">
                <label htmlFor="folio">Folio</label>
                <input id="folio" placeholder="Automático" readOnly />
              </div>
              <div className="f">
                <label htmlFor="fecha">Fecha</label>
                <input id="fecha" placeholder="Automática" readOnly />
              </div>
            </div>
            <div className="f">
              <label htmlFor="emp">Nombre del empleado</label>
              <input id="emp" placeholder="Del expediente" readOnly />
            </div>
            <div className="fila2">
              <div className="f">
                <label htmlFor="area">Área</label>
                <input id="area" placeholder="Del expediente" readOnly />
              </div>
              <div className="f">
                <label htmlFor="edad">Edad</label>
                <input id="edad" placeholder="—" readOnly />
              </div>
            </div>
            <div className="f">
              <label htmlFor="idx">Diagnóstico (IDX)</label>
              <input id="idx" placeholder="De la consulta" readOnly />
            </div>
          </Seccion>
        </div>

        {/* ---------- Tabla Receta + Detalle Receta ---------- */}
        <div className="col-main stack">
          <Seccion icono="pastilla" titulo="Medicamentos" sub="Un renglón por medicamento">
            {meds.map((m, i) => (
              <div key={i} className="renglon-med">
                <div className="f">
                  <label htmlFor={`med${i}`}>Medicamento</label>
                  <input id={`med${i}`} value={m.medicamento} placeholder="Ej. Paracetamol"
                    onChange={(e) => cambiar(i, 'medicamento', e.target.value)} />
                </div>
                <div className="f">
                  <label htmlFor={`pre${i}`}>Presentación</label>
                  <input id={`pre${i}`} value={m.presentacion} placeholder="Tabletas 500 mg"
                    onChange={(e) => cambiar(i, 'presentacion', e.target.value)} />
                </div>
                <div className="f">
                  <label htmlFor={`dos${i}`}>Dosis</label>
                  <input id={`dos${i}`} value={m.dosis} placeholder="1 cada 8 h"
                    onChange={(e) => cambiar(i, 'dosis', e.target.value)} />
                </div>
                <div className="f">
                  <label htmlFor={`dur${i}`}>Duración</label>
                  <input id={`dur${i}`} value={m.duracion} placeholder="5 días"
                    onChange={(e) => cambiar(i, 'duracion', e.target.value)} />
                </div>
                <button type="button" className="btn2" aria-label="Quitar medicamento"
                  disabled={meds.length === 1}
                  onClick={() => setMeds(meds.filter((_, k) => k !== i))}>
                  Quitar
                </button>
              </div>
            ))}
            <button type="button" className="link" onClick={() => setMeds([...meds, { ...VACIO }])}>
              + Agregar medicamento
            </button>

            <div className="f" style={{ marginTop: 16 }}>
              <label htmlFor="ind">Indicaciones</label>
              <textarea id="ind" name="indicaciones" rows={4} placeholder="Dieta, cuidados, próxima cita…" />
            </div>

            <div className="fila2">
              <div className="f">
                <label htmlFor="medico">Médico</label>
                <input id="medico" placeholder="Del usuario en sesión" readOnly />
              </div>
              <div className="f">
                <label htmlFor="ced">Cédula profesional</label>
                <input id="ced" placeholder="Del usuario en sesión" readOnly />
              </div>
            </div>
          </Seccion>

          <div className="barra-acciones">
            <p className="mini">
              <Icono nombre="info" tam={14} /> El folio y la fecha los asigna el sistema.
            </p>
            <div className="botones">
              <button className="btn2" type="reset">Limpiar</button>
              <button className="btn" type="submit">Generar receta</button>
            </div>
          </div>
        </div>
      </form>
    </>
  )
}
