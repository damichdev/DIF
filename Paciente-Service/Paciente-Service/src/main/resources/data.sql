INSERT INTO catalogo_sexo (id_sexo, nombre_sexo) VALUES
  (1, 'Masculino'), (2, 'Femenino')
ON CONFLICT DO NOTHING;

INSERT INTO catalogo_derecho_ambiente (id_derecho_ambiente, nombre_derecho_ambiente) VALUES
  (1, 'Ninguno'), (2, 'IMSS'), (3, 'ISSSTE'), (4, 'IMSS-Bienestar'), (5, 'Otro')
ON CONFLICT DO NOTHING;
