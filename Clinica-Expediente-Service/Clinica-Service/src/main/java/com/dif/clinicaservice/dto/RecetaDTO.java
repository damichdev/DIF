package com.dif.clinicaservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecetaDTO {
    private Long idReceta;

    @NotBlank(message = "El folio de la receta es obligatorio")
    private String folio;

    private String indicaciones;
    private List<DetalleRecetaDTO> detalles;
}