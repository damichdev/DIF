package com.dif.clinicaservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpedienteRequestDTO {

    @NotBlank(message = "El número de expediente es obligatorio")
    private String noExpediente;

    @NotBlank(message = "El tipo de sangre es obligatorio")
    private String tipoSangre;

    private String alergias;
    private String antecedentes;

    @NotNull(message = "La fecha de apertura es obligatoria")
    private LocalDate fechaApertura;

    @NotNull(message = "El ID del paciente es obligatorio")
    private Long idPaciente;
}