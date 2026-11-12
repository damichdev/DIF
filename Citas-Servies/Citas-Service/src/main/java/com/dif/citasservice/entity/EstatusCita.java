package com.dif.citasservice.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "catalogo_estatus_cita")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EstatusCita {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_estatus")
    private Long idEstatus;

    @Column(name = "nombre_estatus", nullable = false, unique = true, length = 50)
    private String nombreEstatus;
}