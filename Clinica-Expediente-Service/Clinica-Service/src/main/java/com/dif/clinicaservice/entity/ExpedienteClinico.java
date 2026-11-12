package com.dif.clinicaservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "expedientes_clinicos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpedienteClinico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_expediente_clinico")
    private Long idExpedienteClinico;

    @Column(name = "no_expediente", nullable = false, unique = true, length = 50)
    private String noExpediente;

    @Column(name = "tipo_sangre", nullable = false, length = 10)
    private String tipoSangre;

    @Column(columnDefinition = "TEXT")
    private String alergias;

    @Column(columnDefinition = "TEXT")
    private String antecedentes;

    @Column(name = "fecha_apertura", nullable = false)
    private LocalDate fechaApertura;

    @Column(name = "id_paciente", nullable = false, unique = true)
    private Long idPaciente;

    @OneToMany(mappedBy = "expedienteClinico", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ConsultaMedica> consultas = new ArrayList<>();
}