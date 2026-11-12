package com.dif.clinicaservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DetalleRecetaDTO {
    private Long idDetalle;

    @NotBlank(message = "El medicamento es obligatorio")
    private String medicamento;

    @NotBlank(message = "La dosis es obligatoria")
    private String dosis;

    @NotBlank(message = "La presentación es obligatoria")
    private String presentacion;

    @NotBlank(message = "La duración es obligatoria")
    private String duracion;
}