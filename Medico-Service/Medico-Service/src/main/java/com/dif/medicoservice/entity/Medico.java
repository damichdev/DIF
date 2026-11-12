package com.dif.medicoservice.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "medicos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Medico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_medico")
    private Long idMedico;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(name = "ap_paterno", nullable = false, length = 100)
    private String apPaterno;

    @Column(name = "ap_materno", length = 100)
    private String apMaterno;

    @Column(name = "cedula_profesional", nullable = false, unique = true, length = 50)
    private String cedulaProfesional;

    @Column(name = "area_especialidad", nullable = false, length = 120)
    private String areaEspecialidad;

    @Column(nullable = false, unique = true, length = 150)
    private String correo;

    @Column(nullable = false)
    private String contrasena;
}