import { useState } from 'react'
import Login from './views/Login.jsx'
import Layout from './components/Layout.jsx'
import RegistrarPaciente from './views/RegistrarPaciente.jsx'
import AgendarCitas from './views/AgendarCitas.jsx'
import SignosVitales from './views/SignosVitales.jsx'
import { useRecepcion } from './recepcion/useRecepcion.js'

const VISTAS = {
  registrar: RegistrarPaciente,
  agendar: AgendarCitas,
  signos: SignosVitales,
}

export default function App(){
  const [sesion, setSesion] = useState(null)
  const [vista, setVista] = useState('')
  const rec = useRecepcion(sesion) // estado compartido de Recepción

  function entrar(datos){
    setSesion(datos)
    setVista(datos.rol === 'R' ? 'registrar' : 'busqueda')
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
        <Vista rec={rec} onIr={setVista} />
      ) : (
        <div className="cont">
          <h1>{vista}</h1>
        </div>
      )}
    </Layout>
  )
}