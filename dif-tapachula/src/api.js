// Llama a un microservicio (vía el proxy de vite.config.js) y lanza Error con el mensaje del backend
export async function api(ruta, metodo = 'GET', cuerpo) {
  const r = await fetch(ruta, {
    method: metodo,
    headers: cuerpo ? { 'Content-Type': 'application/json' } : undefined,
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  })
  const datos = r.status === 204 ? null : await r.json().catch(() => null)
  if (!r.ok) {
    // 404/400 traen { error: mensaje }, la validación trae { campo: mensaje }
    const msg = typeof datos?.error === 'string' ? datos.error
      : datos ? Object.values(datos).join(' · ') : `Error ${r.status} en ${ruta}`
    throw new Error(msg)
  }
  return datos
}

export const nombreCompleto = (p) =>
  [p.nombrePaciente ?? p.nombre, p.apPaterno, p.apMaterno].filter(Boolean).join(' ')

export const hoy = () => new Date().toLocaleDateString('en-CA') // AAAA-MM-DD en hora local

// El paciente puede no tener expediente todavía: 404 = "no hay", cualquier otro error sí se propaga
export async function expedienteDe(idPaciente) {
  try {
    return await api(`/api/expedientes/paciente/${idPaciente}`)
  } catch (e) {
    if (/no encontrado/i.test(e.message)) return null
    throw e
  }
}

// Busca por CURP, nombre o número de expediente (EXP-…). Devuelve [{ paciente, expediente }]
export async function buscarPacientes(texto) {
  const q = texto.trim()
  let pacientes
  if (/^exp-/i.test(q)) {
    // El número de expediente vive en Clínica; de ahí sale el paciente
    try {
      const exp = await api(`/api/expedientes/numero/${encodeURIComponent(q)}`)
      pacientes = [await api(`/api/pacientes/${exp.paciente.idPaciente}`)]
    } catch (err) {
      if (!/no encontrado/i.test(err.message)) throw err
      pacientes = []
    }
  } else {
    pacientes = await api(`/api/pacientes/buscar?q=${encodeURIComponent(q)}`)
  }
  return Promise.all(pacientes.map(async (paciente) => ({
    paciente, expediente: await expedienteDe(paciente.idPaciente),
  })))
}
