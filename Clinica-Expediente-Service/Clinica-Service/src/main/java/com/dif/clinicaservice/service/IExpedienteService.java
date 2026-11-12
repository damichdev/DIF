package com.dif.clinicaservice.service;

import com.dif.clinicaservice.dto.ExpedienteRequestDTO;
import com.dif.clinicaservice.dto.ExpedienteResponseDTO;
import com.dif.clinicaservice.dto.ExpedienteUpdateDTO;

public interface IExpedienteService {
    ExpedienteResponseDTO abrirExpediente(ExpedienteRequestDTO request);
    ExpedienteResponseDTO obtenerPorId(Long id);
    ExpedienteResponseDTO obtenerPorPaciente(Long idPaciente);
    ExpedienteResponseDTO obtenerPorNumero(String noExpediente);
    ExpedienteResponseDTO actualizarExpediente(Long id, ExpedienteUpdateDTO request);
}