import Encabezado from '../components/Encabezado.jsx'
import Seccion from '../components/Seccion.jsx'
import Icono from '../components/Icono.jsx'

// Contadores del día del médico
const RESUMEN = [
  { texto: 'Mis citas hoy', clase: '' },
  { texto: 'Atendidas', clase: 'aten' },
]

export default function BusquedaPacientes() {
  return (
    <>
      <Encabezado
        icono="buscar"
        area="Médico"
        titulo="Búsqueda de pacientes"
        sub="Encuentra al paciente para abrir su expediente o iniciar la consulta"
      />

      <div className="cont">
        {/* ---------- Resumen del día ---------- */}
        <div className="resumen">
          {RESUMEN.map((r) => (
            <div key={r.texto} className={`dato ${r.clase}`}>
              <span>{r.texto}</span>
              <strong>0</strong>
            </div>
          ))}
        </div>

        <Seccion icono="buscar" titulo="Buscar paciente" sub="Por nombre, CURP o número de expediente">
          <div className="fila3">
            <div className="f">
              <label htmlFor="q">Paciente</label>
              <div className="con-ico">
                <Icono nombre="buscar" tam={16} />
                <input id="q" name="q" placeholder="Nombre, CURP o No. de expediente…" />
              </div>
            </div>
            <div className="f">
              <label htmlFor="cat">Categoría</label>
              <select id="cat" name="categoria">
                <option value="">Todas</option>
                <option>Sindicalizado</option>
                <option>Institucionalizado</option>
                <option>Confianza</option>
                <option>Foráneo</option>
                <option>Beneficiario</option>
              </select>
            </div>
            <div className="f">
              <label htmlFor="fc">Fecha de cita</label>
              <input id="fc" name="fecha" type="date" />
            </div>
          </div>

          <div className="tabla-box">
            <table className="tabla">
              <thead>
                <tr>
                  <th>No. expediente</th>
                  <th>Paciente</th>
                  <th>CURP</th>
                  <th>Edad</th>
                  <th>Categoría</th>
                  <th>Última consulta</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={6}>
                    <div className="vacio">
                      <span className="vacio-ico"><Icono nombre="buscar" tam={26} /></span>
                      <strong>Sin resultados</strong>
                      <span>Escribe un nombre, CURP o número de expediente.</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Seccion>
      </div>
    </>
  )
}
