// Constantes médicas y utilidades de fecha. Los catálogos (sexo, derechohabiencia, estatus, médicos) se leen del backend.

// Lista fija: el backend valida el mismo formato
export const TIPOS_SANGRE = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export function hoyISO() {
  const d = new Date()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

export function edad(fechaISO) {
  if (!fechaISO) return null
  const n = new Date(`${fechaISO}T00:00:00`)
  if (Number.isNaN(n.getTime())) return null
  const h = new Date()
  let e = h.getFullYear() - n.getFullYear()
  const m = h.getMonth() - n.getMonth()
  if (m < 0 || (m === 0 && h.getDate() < n.getDate())) e--
  return e
}
