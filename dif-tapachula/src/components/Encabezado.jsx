import Icono from './Icono.jsx'

// Fecha de hoy en español, ej. "jueves, 22 de octubre de 2026"
const hoy = new Date().toLocaleDateString('es-MX', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
})

export default function Encabezado({ icono, area, titulo, sub }) {
  return (
    <header className="top">
      <div className="top-tit">
        <span className="top-ico"><Icono nombre={icono} tam={22} /></span>
        <div>
          <p className="miga">{area}</p>
          <h1>{titulo}</h1>
          <p className="sub">{sub}</p>
        </div>
      </div>
      <span className="chip-fecha">
        <Icono nombre="calendario" tam={15} />
        {hoy}
      </span>
    </header>
  )
}