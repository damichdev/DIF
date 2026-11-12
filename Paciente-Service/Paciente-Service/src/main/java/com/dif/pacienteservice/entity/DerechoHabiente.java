package com.dif.pacienteservice.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "catalogo_derecho_ambiente")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DerechoHabiente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_derecho_ambiente")
    private Long idDerechoAmbiente;

    @Column(name = "nombre_derecho_ambiente", nullable = false, unique = true, length = 100)
    private String nombreDerechoAmbiente;
}