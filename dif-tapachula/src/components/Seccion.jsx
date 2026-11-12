import Icono from './Icono.jsx'

// Tarjeta con encabezado: icono + título + descripción
export default function Seccion({ icono, titulo, sub, extra, className = '', children }) {
  return (
    <section className={`card ${className}`}>
      <div className="card-h">
        <span className="card-ico"><Icono nombre={icono} tam={18} /></span>
        <div className="card-tit">
          <h2>{titulo}</h2>
          {sub && <p>{sub}</p>}
        </div>
        {extra}
      </div>
      {children}
    </section>
  )
}