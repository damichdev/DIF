import { useState } from 'react'

// Solo guarda qué paciente/cita está "en mano" al pasar de una pantalla de Recepción a la siguiente
// (Registrar → Agendar → Signos). Todos los datos viven en el backend.
export function useRecepcion() {
  const [pacienteActivo, setPacienteActivo] = useState(null) // idPaciente
  const [citaActiva, setCitaActiva] = useState(null) // idCita
  return { pacienteActivo, setPacienteActivo, citaActiva, setCitaActiva }
}
