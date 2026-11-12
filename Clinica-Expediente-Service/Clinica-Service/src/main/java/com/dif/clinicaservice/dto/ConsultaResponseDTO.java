package com.dif.clinicaservice.dto;

import com.dif.clinicaservice.client.dto.CitaDTO;
import com.dif.clinicaservice.client.dto.MedicoDTO;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConsultaResponseDTO {
    private Long idConsulta;
    private LocalDateTime fechaHoraAtendida;
    private String padecimientoActual;
    private String interrogatorio;
    private String exploracionFisica;
    private String diagnostico;
    private Long idExpedienteClinico;
    private CitaDTO cita;
    private MedicoDTO medico;
    private RecetaDTO receta;
}