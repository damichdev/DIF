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
