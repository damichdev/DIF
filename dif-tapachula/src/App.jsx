import { useState } from 'react'
import Login from './views/Login.jsx'
import Layout from './components/Layout.jsx'
import RegistrarPaciente from './views/RegistrarPaciente.jsx'
import AgendarCitas from './views/AgendarCitas.jsx'
import SignosVitales from './views/SignosVitales.jsx'
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

// shortcut: usuarios de prueba en el frontend, sin seguridad real; pasar al login del Medico-Service cuando el backend esté conectado
const USUARIOS = [
  { correo: 'recepcion@dif.gob.mx', pass: 'recepcion123', rol: 'R' },
  { correo: 'medico@dif.gob.mx', pass: 'medico123', rol: 'M' },
  { correo: 'enfermera@dif.gob.mx', pass: 'enfermera123', rol: 'E' },
]

// Pantalla con la que abre cada rol
const INICIO = { R: 'registrar', M: 'busqueda', E: 'signos' }

export default function App(){
  const [sesion, setSesion] = useState(null)
  const [vista, setVista] = useState('')

  // Devuelve un mensaje de error, o nada si entró
  function entrar(datos){
    const u = USUARIOS.find((x) => x.correo === datos.correo.trim().toLowerCase() && x.pass === datos.pass)
    if(!u) return 'Correo o contraseña incorrectos.'
    setSesion({ correo: u.correo, rol: u.rol })
    setVista(INICIO[u.rol])
  }

  function salir(){
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
        <Vista onIr={setVista} />
      ) : (
        <div className="cont">
          <h1>{vista}</h1>
        </div>
      )}
    </Layout>
  )
}
