package com.dif.medicoservice.entity;

import jakarta.persistence.*;
import lombok.*;

// Cuenta de acceso al sistema. rol: R = Recepción, M = Médico, E = Enfermería.
@Entity
@Table(name = "usuarios")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Long idUsuario;

    @Column(nullable = false, length = 150)
    private String nombre;

    @Column(nullable = false, unique = true, length = 150)
    private String correo;

    // Hash BCrypt, nunca el texto plano
    @Column(nullable = false)
    private String contrasena;

    @Column(nullable = false, length = 1)
    private String rol;

    // Solo para rol M: enlaza con la fila de medicos
    @Column(name = "id_medico")
    private Long idMedico;
}
