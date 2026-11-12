import Encabezado from '../components/Encabezado.jsx'
import Seccion from '../components/Seccion.jsx'
import Icono from '../components/Icono.jsx'

// Formato "Historia clínica" y portada del expediente (Formatos DIF)
const CATEGORIAS = ['Sindicalizado', 'Institucionalizado', 'Confianza', 'Foráneo', 'Beneficiario']
const SANGRE = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export default function ExpedienteClinico() {

  function guardar(e) {
    e.preventDefault()
    const datos = Object.fromEntries(new FormData(e.target))
    console.log('Expediente a guardar:', datos)
    alert('Datos listos para enviar. Revisa la consola (F12).')
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
        {/* ---------- Paciente ---------- */}
        <div className="col-form stack">
          <Seccion icono="buscar" titulo="Paciente" sub="Busca al paciente">
            <div className="con-ico">
              <Icono nombre="buscar" tam={16} />
              <input name="paciente" aria-label="Paciente" placeholder="Nombre, CURP o No. de expediente…" />
            </div>
          </Seccion>

          <Seccion icono="usuario" titulo="Ficha de identificación">
            <div className="vacio">
              <span className="vacio-ico"><Icono nombre="usuario" tam={26} /></span>
              <strong>Sin paciente seleccionado</strong>
              <span>Nombre, edad, sexo, CURP y derecho ambiente aparecerán aquí.</span>
            </div>
          </Seccion>
        </div>

        <div className="col-main stack">
          {/* ---------- Tabla Expediente Clínico ---------- */}
          <Seccion icono="expediente" titulo="Datos del expediente" sub="Portada del expediente">
            <div className="fila3">
              <div className="f">
                <label htmlFor="nexp">No. expediente</label>
                <input id="nexp" placeholder="Automático" readOnly />
              </div>
              <div className="f">
                <label htmlFor="fa">Fecha de apertura</label>
                <input id="fa" placeholder="Automática" readOnly />
              </div>
              <div className="f">
                <label htmlFor="ts">Tipo de sangre</label>
                <select id="ts" name="tipo_sangre">
                  <option value="">—</option>
                  {SANGRE.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="f">
              <label>Categoría</label>
              <div className="opciones">
                {CATEGORIAS.map((c) => (
                  <label key={c} className="opcion">
                    <input type="radio" name="categoria" value={c} /> {c}
                  </label>
                ))}
              </div>
            </div>

            <div className="fila2">
              <div className="f">
                <label htmlFor="area">Área</label>
                <input id="area" name="area" placeholder="Área de trabajo del empleado" />
              </div>
              <div className="f">
                <label htmlFor="benef">Beneficiario de</label>
                <input id="benef" name="beneficiario_de" placeholder="Nombre del trabajador" />
              </div>
            </div>

            <div className="fila2">
              <div className="f">
                <label htmlFor="tutor">Nombre del tutor(a)</label>
                <input id="tutor" name="tutor" placeholder="Solo si es menor de edad" />
              </div>
              <div className="f">
                <label htmlFor="ttel">Teléfono o celular</label>
                <input id="ttel" name="tel_tutor" type="tel" maxLength={10} placeholder="10 dígitos" />
              </div>
            </div>
          </Seccion>

          {/* ---------- Historia clínica: antecedentes ---------- */}
          <Seccion icono="lista" titulo="Antecedentes" sub="Interrogatorio de la historia clínica">
            <div className="f">
              <label htmlFor="alg">Alergias</label>
              <input id="alg" name="alergias" placeholder="Ej. Penicilina · deja vacío si no tiene" />
            </div>
            <div className="f">
              <label htmlFor="ahf">Heredofamiliares</label>
              <textarea id="ahf" name="ant_heredofamiliares" rows={3} placeholder="Diabetes, hipertensión, cáncer en la familia…" />
            </div>
            <div className="f">
              <label htmlFor="apnp">Personales no patológicos</label>
              <textarea id="apnp" name="ant_no_patologicos" rows={3} placeholder="Alimentación, higiene, vivienda, tabaquismo, alcoholismo…" />
            </div>
            <div className="f">
              <label htmlFor="app">Personales patológicos</label>
              <textarea id="app" name="ant_patologicos" rows={3} placeholder="Enfermedades previas, cirugías, hospitalizaciones…" />
            </div>
          </Seccion>

          {/* ---------- Historia clínica: padecimiento actual ---------- */}
          <Seccion icono="estetoscopio" titulo="Padecimiento actual">
            <div className="fila2">
              <div className="f">
                <label htmlFor="fini">Fecha de iniciación</label>
                <input id="fini" name="fecha_inicio" type="date" />
              </div>
              <div className="f">
                <label htmlFor="sini">Principales síntomas de iniciación</label>
                <input id="sini" name="sintomas_inicio" />
              </div>
            </div>
            <div className="f">
              <label htmlFor="evo">Evolución</label>
              <textarea id="evo" name="evolucion" rows={3} />
            </div>
            <div className="f">
              <label htmlFor="sact">Sintomatología actual</label>
              <textarea id="sact" name="sintomatologia_actual" rows={3} />
            </div>

            <label className="opcion">
              <input type="checkbox" name="consentimiento" /> El paciente o tutor firmó el consentimiento informado
            </label>
          </Seccion>

          {/* ---------- Botones ---------- */}
          <div className="barra-acciones">
            <p className="mini">El número de expediente y la fecha de apertura los asigna el sistema.</p>
            <div className="botones">
              <button className="btn2" type="reset">Limpiar</button>
              <button className="btn" type="submit">Guardar expediente</button>
            </div>
          </div>
        </div>
      </form>
    </>
  )
}
