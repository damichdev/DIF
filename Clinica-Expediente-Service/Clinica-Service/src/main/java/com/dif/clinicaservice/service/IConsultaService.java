package com.dif.clinicaservice.service;

import com.dif.clinicaservice.dto.ConsultaRequestDTO;
import com.dif.clinicaservice.dto.ConsultaResponseDTO;

import java.util.List;

public interface IConsultaService {
    ConsultaResponseDTO registrarConsulta(ConsultaRequestDTO request);
    ConsultaResponseDTO obtenerPorId(Long id);
    List<ConsultaResponseDTO> listarPorExpediente(Long idExpediente);
}