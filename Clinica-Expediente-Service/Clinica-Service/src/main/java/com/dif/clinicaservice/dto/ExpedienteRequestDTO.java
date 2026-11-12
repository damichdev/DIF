package com.dif.clinicaservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpedienteRequestDTO {

    // Opcional: si no viene, el servidor lo asigna (EXP-000001, ...)
    private String noExpediente;

    @NotBlank(message = "El tipo de sangre es obligatorio")
    @Pattern(regexp = "^(A|B|AB|O)[+-]$", message = "El tipo de sangre no es válido")
    private String tipoSangre;

    private String alergias;
    private String antecedentes;

    // Opcional: por defecto, hoy
    private LocalDate fechaApertura;

    @NotNull(message = "El ID del paciente es obligatorio")
    private Long idPaciente;
}