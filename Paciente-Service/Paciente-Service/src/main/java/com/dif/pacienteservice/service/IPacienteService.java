package com.dif.pacienteservice.service;

import com.dif.pacienteservice.dto.PacienteRequestDTO;
import com.dif.pacienteservice.dto.PacienteResponseDTO;

import java.util.List;

public interface IPacienteService {
    PacienteResponseDTO crearPaciente(PacienteRequestDTO request);
    PacienteResponseDTO obtenerPorId(Long id);
    PacienteResponseDTO obtenerPorCurp(String curp);
    List<PacienteResponseDTO> listarTodos();
    PacienteResponseDTO actualizarPaciente(Long id, PacienteRequestDTO request);
    void eliminarPaciente(Long id);
}