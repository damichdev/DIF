package com.dif.citasservice.service;

import com.dif.citasservice.dto.CitaRequestDTO;
import com.dif.citasservice.dto.CitaResponseDTO;
import com.dif.citasservice.dto.SignosVitalesDTO;

import java.util.List;

public interface ICitaService {
    CitaResponseDTO programarCita(CitaRequestDTO request);
    CitaResponseDTO obtenerPorId(Long id);
    List<CitaResponseDTO> listarTodas();
    CitaResponseDTO registrarSignosVitales(Long idCita, SignosVitalesDTO signosDTO);
    CitaResponseDTO cambiarEstatus(Long idCita, Long nuevoEstatusId);
}