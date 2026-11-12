package com.dif.pacienteservice.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "catalogo_sexo")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Sexo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_sexo")
    private Long idSexo;

    @Column(name = "nombre_sexo", nullable = false, unique = true, length = 50)
    private String nombreSexo;
}