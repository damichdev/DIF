import Encabezado from '../components/Encabezado.jsx'
import Seccion from '../components/Seccion.jsx'
import Icono from '../components/Icono.jsx'

// Lo que se ha generado al paciente en sus consultas
const RESUMEN = [
  { texto: 'Consultas', clase: '' },
  { texto: 'Recetas', clase: 'conf' },
  { texto: 'Referencias', clase: 'pend' },
  { texto: 'Licencias', clase: 'aten' },
]

export default function HistorialMedico() {
  return (
    <>
      <Encabezado
        icono="lista"
        area="Médico"
        titulo="Historial médico"
        sub="Consultas, recetas, referencias y licencias del paciente"
      />

      <div className="cont split">
        <div className="col-form stack">
          <Seccion icono="buscar" titulo="Paciente" sub="Busca al paciente">
            <div className="con-ico">
              <Icono nombre="buscar" tam={16} />
              <input name="paciente" aria-label="Paciente" placeholder="Nombre, CURP o No. de expediente…" />
            </div>
          </Seccion>

          <Seccion icono="expediente" titulo="Expediente">
            <div className="vacio">
              <span className="vacio-ico"><Icono nombre="carpeta" tam={26} /></span>
              <strong>Sin paciente seleccionado</strong>
              <span>Tipo de sangre, alergias y antecedentes aparecerán aquí.</span>
            </div>
          </Seccion>
        </div>

        <div className="col-main">
          <div className="resumen">
            {RESUMEN.map((r) => (
              <div key={r.texto} className={`dato ${r.clase}`}>
                <span>{r.texto}</span>
                <strong>0</strong>
              </div>
            ))}
          </div>

          <Seccion icono="lista" titulo="Consultas" sub="De la más reciente a la más antigua">
            <div className="tabla-box">
              <table className="tabla">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Médico</th>
                    <th>Padecimiento</th>
                    <th>Diagnóstico</th>
                    <th>Receta</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={5}>
                      <div className="vacio">
                        <span className="vacio-ico"><Icono nombre="lista" tam={26} /></span>
                        <strong>Sin consultas registradas</strong>
                        <span>Las notas médicas del paciente aparecerán aquí.</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Seccion>
        </div>
      </div>
    </>
  )
}
