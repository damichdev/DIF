import Encabezado from '../components/Encabezado.jsx'
import Seccion from '../components/Seccion.jsx'
import Icono from '../components/Icono.jsx'

// Contadores del día (salen del catálogo "Estatus Cita")
const RESUMEN = [
  { texto: 'Citas hoy', clase: '' },
  { texto: 'Pendientes', clase: 'pend' },
  { texto: 'Confirmadas', clase: 'conf' },
  { texto: 'Atendidas', clase: 'aten' },
]

export default function AgendarCitas() {
  return (
    <>
      <Encabezado
        icono="calendario"
        area="Recepción"
        titulo="Agendar citas"
        sub="Programa las citas de los pacientes con su médico"
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

        <div className="split">
          {/* ---------- Formulario: tabla Cita ---------- */}
          <form className="col-form">
            <Seccion icono="calendario" titulo="Nueva cita" sub="Datos de la tabla Cita">
              <div className="f">
                <label htmlFor="pac">Paciente</label>
                <div className="con-ico">
                  <Icono nombre="buscar" tam={16} />
                  <input id="pac" name="paciente" placeholder="Nombre, CURP o No. de expediente…" />
                </div>
                <p className="mini">
                  ¿No existe? <button type="button" className="link">Registrar paciente</button>
                </p>
              </div>

              <div className="f">
                <label htmlFor="med">Médico</label>
                <select id="med" name="id_medico">
                  <option value="">Selecciona…</option>
                </select>
              </div>

              <div className="fila2">
                <div className="f">
                  <label htmlFor="fecha">Fecha</label>
                  <input id="fecha" name="fecha" type="date" />
                </div>
                <div className="f">
                  <label htmlFor="hora">Hora</label>
                  <input id="hora" name="hora" type="time" />
                </div>
              </div>

              <div className="f">
                <label htmlFor="mot">Motivo</label>
                <textarea id="mot" name="motivo" rows={3} placeholder="Ej. control de rutina" />
              </div>

              <div className="f">
                <label htmlFor="est">Estatus de la cita</label>
                <select id="est" name="id_estatus">
                  <option value="">Selecciona…</option>
                </select>
              </div>

              <button className="btn" type="button">Agendar cita</button>
            </Seccion>
          </form>

          {/* ---------- Citas del día ---------- */}
          <Seccion
            className="col-main"
            icono="reloj"
            titulo="Citas del día"
            sub="Agenda de todos los médicos"
            extra={<input type="date" aria-label="Fecha a consultar" className="fecha-chica" />}
          >
            <div className="tabla-box">
              <table className="tabla">
                <thead>
                  <tr>
                    <th>Hora</th>
                    <th>Paciente</th>
                    <th>Médico</th>
                    <th>Motivo</th>
                    <th>Estatus</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={5}>
                      <div className="vacio">
                        <span className="vacio-ico"><Icono nombre="calendario" tam={26} /></span>
                        <strong>No hay citas para este día</strong>
                        <span>Las citas que agendes aparecerán aquí.</span>
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