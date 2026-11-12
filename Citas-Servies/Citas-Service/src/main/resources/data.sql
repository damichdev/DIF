-- Clinica-Service marca la cita como atendida con el ID 3: no cambiar ese ID.
-- Flujo: Programada -> En espera (al tomar signos) -> En consulta -> Atendida; Cancelada aparte.
INSERT INTO catalogo_estatus_cita (id_estatus, nombre_estatus) VALUES
  (1, 'Programada'), (2, 'En espera'), (3, 'Atendida'), (4, 'Cancelada'), (5, 'En consulta')
ON CONFLICT (id_estatus) DO UPDATE SET nombre_estatus = EXCLUDED.nombre_estatus;
