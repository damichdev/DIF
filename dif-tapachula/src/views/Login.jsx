import { useState } from "react";

export default function Login({ onEntrar }) {
    const [rol, setRol] = useState('R')
    const [correo, setCorreo] = useState('')
    const [pass, setPass] = useState('')
    const [error, setError] = useState('')

    function enviar(e) {
        e.preventDefault()
        if (!correo.trim() || !pass) {
            setError('Escribe tu correo y contraseña.')
            return
        }
        onEntrar({ rol, correo })
    }

    return (
    <div className="login">
        {/* ---------- Panel institucional ---------- */}
        <aside className="login-panel">
            <div className="marca claro">
                <span className="marca-sello">DIF</span>
                <div>
                    <strong>DIF Tapachula</strong>
                    <span>Dirección de Salud</span>
                </div>
            </div>

            <div className="login-texto">
                <h2>Sistema de citas y expediente clínico</h2>
                <p>Registro de pacientes, agenda médica, consultas y recetas en un solo lugar.</p>
            </div>

            <p className="login-pie">Sistema para el Desarrollo Integral de la Familia · Tapachula, Chiapas</p>
        </aside>

        {/* ---------- Formulario ---------- */}
        <div className="login-form">
            <form className="lcard" onSubmit={enviar}>
                <h1>Iniciar sesión</h1>
                <p className="sub">Selecciona tu área y accede al sistema</p>

                <div className="seg">
                    <button type="button" className={rol === 'R' ? 'on' : ''} onClick={() => setRol('R')}>Recepción</button>
                    <button type="button" className={rol === 'M' ? 'on' : ''} onClick={() => setRol('M')}>Médico</button>
                </div>

                <div className="f">
                    <label htmlFor="usuario">Correo</label>
                    <input id="usuario" type="email" value={correo} onChange={(e) => setCorreo(e.target.value)}
                        placeholder={rol === 'M' ? 'dratorres@gmail.com' : 'nombreapellido@gmail.com'} />
                </div>

                <div className="f">
                    <label htmlFor="pass">Contraseña</label>
                    <input id="pass" type="password" value={pass} onChange={(e) => setPass(e.target.value)} />
                </div>

                {error && <p className="err">{error}</p>}

                <button className="btn" type="submit">Iniciar sesión</button>
            </form>
        </div>
    </div>
)
}