import { useState } from 'react'

export function useRecepcion() {
  const [pacienteActivo, setPacienteActivo] = useState(null) // idPaciente
  const [citaActiva, setCitaActiva] = useState(null) // idCita
  const [consultaActiva, setConsultaActiva] = useState(null) // idConsulta
  return {
    pacienteActivo,
    setPacienteActivo,
    citaActiva,
    setCitaActiva,
    consultaActiva,
    setConsultaActiva,
  }
}