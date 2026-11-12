package com.dif.clinicaservice.dto;

import com.dif.clinicaservice.client.dto.PacienteDTO;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpedienteResponseDTO {
    private Long idExpedienteClinico;
    private String noExpediente;
    private String tipoSangre;
    private String alergias;
    private String antecedentes;
    private LocalDate fechaApertura;
    private PacienteDTO paciente;
}