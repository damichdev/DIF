import { useState } from "react";

export default function Login({ onEntrar }) {
    const [correo, setCorreo] = useState('')
    const [pass, setPass] = useState('')
    const [error, setError] = useState('')
    const [cargando, setCargando] = useState(false)

    async function enviar(e) {
        e.preventDefault()
        if (!correo.trim() || !pass) {
            setError('Escribe tu correo y contraseña.')
            return
        }
        setError('')
        setCargando(true)
        try {
            await onEntrar(correo, pass)
        } catch (err) {
            // Sin respuesta del servidor el proxy devuelve error de red o 5xx
            setError(err instanceof TypeError ? 'No hay conexión con el servidor.' : err.message)
            setCargando(false)
        }
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
                <p className="sub">Accede con tu cuenta del sistema</p>

                <div className="f">
                    <label htmlFor="usuario">Correo</label>
                    <input id="usuario" type="email" value={correo} onChange={(e) => setCorreo(e.target.value)}
                        autoComplete="username" />
                </div>

                <div className="f">
                    <label htmlFor="pass">Contraseña</label>
                    <input id="pass" type="password" value={pass} onChange={(e) => setPass(e.target.value)}
                        autoComplete="current-password" />
                </div>

                {error && <p className="err">{error}</p>}

                <button className="btn" type="submit" disabled={cargando}>{cargando ? 'Entrando…' : 'Iniciar sesión'}</button>
            </form>
        </div>
    </div>
)
}