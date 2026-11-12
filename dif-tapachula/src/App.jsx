import { useState } from 'react'
import { api } from './api.js'
import Login from './views/Login.jsx'
import Layout from './components/Layout.jsx'
import RegistrarPaciente from './views/RegistrarPaciente.jsx'
import AgendarCitas from './views/AgendarCitas.jsx'
import SignosVitales from './views/SignosVitales.jsx'
import { useRecepcion } from './recepcion/useRecepcion.js'
import BusquedaPacientes from './views/BusquedaPacientes.jsx'
import ExpedienteClinico from './views/ExpedienteClinico.jsx'
import ConsultaMedica from './views/ConsultaMedica.jsx'
import HistorialMedico from './views/HistorialMedico.jsx'
import GenerarReceta from './views/GenerarReceta.jsx'

const VISTAS = {
  registrar: RegistrarPaciente,
  agendar: AgendarCitas,
  signos: SignosVitales,
  busqueda: BusquedaPacientes,
  expediente: ExpedienteClinico,
  consulta: ConsultaMedica,
  historial: HistorialMedico,
  receta: GenerarReceta,
}

// Pantalla con la que abre cada rol
const INICIO = { R: 'registrar', M: 'busqueda', E: 'signos' }

// La sesión sobrevive a recargar la página, pero no a cerrar la pestaña
function leerSesion(){
  try { return JSON.parse(sessionStorage.getItem('sesion')) } catch { return null }
}

export default function App(){
  const [sesion, setSesion] = useState(leerSesion)
  const [vista, setVista] = useState(() => (leerSesion() ? INICIO[leerSesion().rol] : ''))
  const rec = useRecepcion() // paciente y cita en mano entre pantallas

  // Lanza Error con el mensaje del backend si las credenciales no valen
  async function entrar(correo, contrasena){
    const u = await api('/api/auth/login', 'POST', { correo, contrasena })
    sessionStorage.setItem('sesion', JSON.stringify(u))
    setSesion(u)
    setVista(INICIO[u.rol])
  }

  function salir(){
    sessionStorage.removeItem('sesion')
    setSesion(null)
    setVista('')
  }

  if(!sesion){
    return <Login onEntrar={entrar}/>

  }

  const Vista = VISTAS[vista]

  return (
    <Layout sesion={sesion} vista={vista} onIr={setVista} onSalir={salir}>
      {Vista ? (
        <Vista rec={rec} onIr={setVista} />
      ) : (
        <div className="cont">
          <h1>{vista}</h1>
        </div>
      )}
    </Layout>
  )
}
