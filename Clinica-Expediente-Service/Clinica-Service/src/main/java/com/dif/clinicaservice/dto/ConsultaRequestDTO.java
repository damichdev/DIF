package com.dif.clinicaservice.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConsultaRequestDTO {

    @NotNull(message = "El ID de la cita es obligatorio")
    private Long idCita;

    @NotNull(message = "El ID del médico es obligatorio")
    private Long idMedico;

    @NotNull(message = "El ID del expediente clínico es obligatorio")
    private Long idExpedienteClinico;

    @NotBlank(message = "El padecimiento actual es obligatorio")
    private String padecimientoActual;

    private String interrogatorio;
    private String exploracionFisica;

    @NotBlank(message = "El diagnóstico es obligatorio")
    private String diagnostico;

    @Valid
    private RecetaDTO receta;
}