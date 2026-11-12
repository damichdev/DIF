package com.dif.clinicaservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "consultas_medicas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConsultaMedica {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_consulta")
    private Long idConsulta;

    @Column(name = "fecha_hora_atendida", nullable = false)
    private LocalDateTime fechaHoraAtendida;

    @Column(name = "padecimiento_actual", columnDefinition = "TEXT", nullable = false)
    private String padecimientoActual;

    @Column(columnDefinition = "TEXT")
    private String interrogatorio;

    @Column(name = "exploracion_fisica", columnDefinition = "TEXT")
    private String exploracionFisica;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String diagnostico;

    @Column(name = "id_cita", nullable = false, unique = true)
    private Long idCita;

    @Column(name = "id_medico", nullable = false)
    private Long idMedico;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_expediente_clinico", nullable = false)
    private ExpedienteClinico expedienteClinico;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "id_receta")
    private Receta receta;
}