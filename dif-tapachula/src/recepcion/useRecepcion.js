import { useState } from 'react'
import { ESTATUS, hoyISO, horaActual, nombreCompleto, normalizar } from './datos.js'

// Estado compartido de Recepción (en memoria hasta conectar el backend).
// Mantiene el hilo del flujo: Paciente + Expediente → Cita → Signos vitales.
export function useRecepcion(sesion) {
  const [pacientes, setPacientes] = useState([])
  const [expedientes, setExpedientes] = useState([])
  const [citas, setCitas] = useState([])
  const [signos, setSignos] = useState([])

  // Lo que una vista le pasa a la siguiente
  const [pacienteActivo, setPacienteActivo] = useState(null) // id_paciente
  const [citaActiva, setCitaActiva] = useState(null) // id_cita

  const expedienteDe = (idPaciente) => expedientes.find((e) => e.id_paciente === idPaciente)
  const pacientePorId = (id) => pacientes.find((p) => p.id_paciente === id)

  // Busca por nombre, CURP o número de expediente (RF-01).
  function buscar(texto) {
    const q = normalizar(texto)
    if (q.length < 2) return []
    return pacientes
      .map((p) => ({ paciente: p, expediente: expedienteDe(p.id_paciente) }))
      .filter(({ paciente, expediente }) =>
        normalizar(nombreCompleto(paciente)).includes(q) ||
        normalizar(paciente.curp).includes(q) ||
        normalizar(expediente?.no_expediente).includes(q))
  }

  // Paciente y expediente se crean juntos: o se guardan los dos o ninguno.
  function registrarPaciente(datosPaciente, datosExpediente) {
    const id_paciente = pacientes.length + 1
    const consecutivo = String(expedientes.length + 1).padStart(4, '0')
    const paciente = { ...datosPaciente, id_paciente }
    const expediente = {
      ...datosExpediente,
      id_expediente: expedientes.length + 1,
      id_paciente,
      no_expediente: `EXP-${consecutivo}`,
      fecha_apertura: hoyISO(),
    }
    setPacientes((l) => [...l, paciente])
    setExpedientes((l) => [...l, expediente])
    return { paciente, expediente }
  }

  function agendarCita(datos) {
    const cita = {
      ...datos,
      id_cita: citas.length + 1,
      id_estatus: ESTATUS.PROGRAMADA,
    }
    setCitas((l) => [...l, cita])
    return cita
  }

  // Guarda los signos ligados a la cita y la pone "En espera" para el médico.
  function guardarSignos(id_cita, valores) {
    const registro = {
      ...valores,
      id_signos: signos.length + 1,
      id_cita,
      fecha: hoyISO(),
      hora: horaActual(),
      registrado_por: sesion?.correo ?? '',
    }
    setSignos((l) => [...l, registro])
    setCitas((l) => l.map((c) => (c.id_cita === id_cita ? { ...c, id_estatus: ESTATUS.EN_ESPERA } : c)))
    return registro
  }

  return {
    pacientes, expedientes, citas, signos,
    pacienteActivo, setPacienteActivo,
    citaActiva, setCitaActiva,
    expedienteDe, pacientePorId,
    buscar, registrarPaciente, agendarCita, guardarSignos,
  }
}
