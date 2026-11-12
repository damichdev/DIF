package com.dif.pacienteservice.service;

import com.dif.pacienteservice.dto.PacienteRequestDTO;
import com.dif.pacienteservice.dto.PacienteResponseDTO;

import com.dif.pacienteservice.dto.CatalogoItemDTO;

import java.util.List;
import java.util.Map;

public interface IPacienteService {
    PacienteResponseDTO crearPaciente(PacienteRequestDTO request);
    PacienteResponseDTO obtenerPorId(Long id);
    PacienteResponseDTO obtenerPorCurp(String curp);
    List<PacienteResponseDTO> listarTodos();
    List<PacienteResponseDTO> buscar(String texto);
    Map<String, List<CatalogoItemDTO>> catalogos();
    PacienteResponseDTO actualizarPaciente(Long id, PacienteRequestDTO request);
    void eliminarPaciente(Long id);
}