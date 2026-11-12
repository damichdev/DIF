// Catálogos y utilidades del módulo de Recepción.
// TODO: cuando exista el backend, estos catálogos se cargan desde las tablas
// Sexo, Derecho Ambiente, Estatus Cita y Médico.

export const SEXOS = [
  { id: 1, nombre: 'Femenino' },
  { id: 2, nombre: 'Masculino' },
]

export const DERECHOS = [
  { id: 1, nombre: 'Ninguno' },
  { id: 2, nombre: 'IMSS' },
  { id: 3, nombre: 'ISSSTE' },
  { id: 4, nombre: 'IMSS-Bienestar' },
  { id: 5, nombre: 'Otro' },
]

export const TIPOS_SANGRE = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

// Ciclo de la cita según el flujo: programada → en espera → en consulta → atendida.
// Recepción solo mueve la cita de "Programada" a "En espera" (al tomar signos).
export const ESTATUS = {
  PROGRAMADA: 1,
  EN_ESPERA: 2,
  EN_CONSULTA: 3,
  ATENDIDA: 4,
}

export const ESTATUS_CAT = [
  { id: 1, nombre: 'Programada', clase: 'prog' },
  { id: 2, nombre: 'En espera', clase: 'espera' },
  { id: 3, nombre: 'En consulta', clase: 'consulta' },
  { id: 4, nombre: 'Atendida', clase: 'atendida' },
]

// Solo para poblar el selector de la agenda (lo administra el área médica).
export const MEDICOS = [
  { id: 1, nombre: 'Médico general 1', area: 'Medicina general' },
  { id: 2, nombre: 'Médico general 2', area: 'Medicina general' },
]

export function hoyISO() {
  const d = new Date()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

export function horaActual() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
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

export function nombreCompleto(p) {
  return [p.nombre, p.ap_paterno, p.ap_materno].filter(Boolean).join(' ')
}

export function nombreSexo(id) {
  return SEXOS.find((s) => s.id === Number(id))?.nombre ?? '—'
}

export function nombreEstatus(id) {
  return ESTATUS_CAT.find((e) => e.id === id)
}

// Quita acentos y pasa a minúsculas para buscar sin importar cómo se escriba.
export function normalizar(t) {
  return String(t ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}
