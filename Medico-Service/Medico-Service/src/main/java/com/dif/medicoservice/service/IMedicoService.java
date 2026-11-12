package com.dif.medicoservice.service;

import com.dif.medicoservice.dto.MedicoRequestDTO;
import com.dif.medicoservice.dto.MedicoResponseDTO;

import java.util.List;

public interface IMedicoService {
    MedicoResponseDTO crearMedico(MedicoRequestDTO request);
    MedicoResponseDTO obtenerPorId(Long id);
    List<MedicoResponseDTO> listarTodos();
    MedicoResponseDTO actualizarMedico(Long id, MedicoRequestDTO request);
    void eliminarMedico(Long id);
}