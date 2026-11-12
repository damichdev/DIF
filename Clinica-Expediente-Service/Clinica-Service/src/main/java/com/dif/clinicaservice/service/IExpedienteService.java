package com.dif.clinicaservice.service;

import com.dif.clinicaservice.dto.ExpedienteRequestDTO;
import com.dif.clinicaservice.dto.ExpedienteResponseDTO;

public interface IExpedienteService {
    ExpedienteResponseDTO abrirExpediente(ExpedienteRequestDTO request);
    ExpedienteResponseDTO obtenerPorId(Long id);
    ExpedienteResponseDTO obtenerPorPaciente(Long idPaciente);
}