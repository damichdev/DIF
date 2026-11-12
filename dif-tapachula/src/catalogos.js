// shortcut: copia de los data.sql de Paciente-Service y Citas-Service; si se agrega un endpoint de catálogos, leerlos de ahí
export const SEXOS = [
  { id: 1, nombre: 'Masculino' },
  { id: 2, nombre: 'Femenino' },
]

export const DERECHOS = [
  { id: 1, nombre: 'Ninguno' },
  { id: 2, nombre: 'IMSS' },
  { id: 3, nombre: 'ISSSTE' },
  { id: 4, nombre: 'IMSS-Bienestar' },
  { id: 5, nombre: 'Otro' },
]

export const ESTATUS = [
  { id: 1, nombre: 'Pendiente', clase: 'pend' },
  { id: 2, nombre: 'Confirmada', clase: 'conf' },
  { id: 3, nombre: 'Atendida', clase: 'aten' },
  { id: 4, nombre: 'Cancelada', clase: '' },
]

export const TIPOS_SANGRE = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']
