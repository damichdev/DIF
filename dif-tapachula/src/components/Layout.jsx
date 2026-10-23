import Icono from './Icono.jsx'

const MENU = {
  R: [
    { vista: 'registrar', texto: 'Registrar paciente', icono: 'usuarioMas' },
    { vista: 'agendar', texto: 'Agendar citas', icono: 'calendario' },
    { vista: 'signos', texto: 'Signos vitales', icono: 'pulso' },
  ],
  M: [
    { vista: 'busqueda', texto: 'Búsqueda de pacientes', icono: 'buscar' },
    { vista: 'expediente', texto: 'Expediente clínico', icono: 'carpeta' },
    { vista: 'consulta', texto: 'Consulta médica', icono: 'estetoscopio' },
    { vista: 'historial', texto: 'Historial médico', icono: 'lista' },
    { vista: 'receta', texto: 'Generar receta', icono: 'pastilla' },
  ],
}

export default function Layout({ sesion, vista, onIr, onSalir, children }) {
  const rolTexto = sesion.rol === 'R' ? 'Recepción' : 'Médico'

  return (
    <div className="app">
      <nav className="side" aria-label="Menú principal">
        {/* ---------- Logo ---------- */}
        <div className="marca">
          <span className="marca-sello">DIF</span>
          <div>
            <strong>DIF Tapachula</strong>
            <span>Dirección de Salud</span>
          </div>
        </div>

        {/* ---------- Opciones ---------- */}
        <p className="side-eti">{rolTexto}</p>
        {MENU[sesion.rol].map((m) => (
          <button
            key={m.vista}
            type="button"
            className={vista === m.vista ? 'nav on' : 'nav'}
            onClick={() => onIr(m.vista)}
          >
            <Icono nombre={m.icono} />
            {m.texto}
          </button>
        ))}

        {/* ---------- Usuario y salir ---------- */}
        <div className="side-pie">
          <div className="yo">
            <span className="yo-av"><Icono nombre="usuario" /></span>
            <div>
              <strong>{sesion.correo}</strong>
              <span>{rolTexto}</span>
            </div>
          </div>
          <button type="button" className="nav" onClick={onSalir}>
            <Icono nombre="salir" />
            Cerrar sesión
          </button>
        </div>
      </nav>

      <main className="main">{children}</main>
    </div>
  )
}