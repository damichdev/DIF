package com.dif.clinicaservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

// Datos del expediente que se pueden corregir: el número, la fecha de apertura y el paciente no cambian
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpedienteUpdateDTO {

    @NotBlank(message = "El tipo de sangre es obligatorio")
    @Pattern(regexp = "^(A|B|AB|O)[+-]$", message = "El tipo de sangre no es válido")
    private String tipoSangre;

    private String alergias;
    private String antecedentes;
}
