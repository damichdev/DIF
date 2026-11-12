package com.dif.clinicaservice.service.impl;

import com.dif.clinicaservice.client.PacienteClient;
import com.dif.clinicaservice.client.dto.PacienteDTO;
import com.dif.clinicaservice.dto.ExpedienteRequestDTO;
import com.dif.clinicaservice.dto.ExpedienteResponseDTO;
import com.dif.clinicaservice.entity.ExpedienteClinico;
import com.dif.clinicaservice.exception.ResourceNotFoundException;
import com.dif.clinicaservice.repository.ExpedienteClinicoRepository;
import com.dif.clinicaservice.service.IExpedienteService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ExpedienteServiceImpl implements IExpedienteService {

    private final ExpedienteClinicoRepository expedienteRepository;
    private final PacienteClient pacienteClient;

    @Override
    @Transactional
    public ExpedienteResponseDTO abrirExpediente(ExpedienteRequestDTO request) {
        PacienteDTO paciente = pacienteClient.obtenerPorId(request.getIdPaciente());

        if (expedienteRepository.existsByIdPaciente(request.getIdPaciente())) {
            throw new IllegalArgumentException("El paciente ya cuenta con un expediente clínico registrado");
        }
        if (expedienteRepository.existsByNoExpediente(request.getNoExpediente())) {
            throw new IllegalArgumentException("El número de expediente ya está en uso");
        }

        ExpedienteClinico expediente = ExpedienteClinico.builder()
                .noExpediente(request.getNoExpediente())
                .tipoSangre(request.getTipoSangre())
                .alergias(request.getAlergias())
                .antecedentes(request.getAntecedentes())
                .fechaApertura(request.getFechaApertura())
                .idPaciente(request.getIdPaciente())
                .build();

        return mapToResponse(expedienteRepository.save(expediente), paciente);
    }

    @Override
    @Transactional(readOnly = true)
    public ExpedienteResponseDTO obtenerPorId(Long id) {
        ExpedienteClinico exp = expedienteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expediente no encontrado con ID: " + id));
        PacienteDTO paciente = pacienteClient.obtenerPorId(exp.getIdPaciente());
        return mapToResponse(exp, paciente);
    }

    @Override
    @Transactional(readOnly = true)
    public ExpedienteResponseDTO obtenerPorPaciente(Long idPaciente) {
        ExpedienteClinico exp = expedienteRepository.findByIdPaciente(idPaciente)
                .orElseThrow(() -> new ResourceNotFoundException("Expediente no encontrado para el paciente con ID: " + idPaciente));
        PacienteDTO paciente = pacienteClient.obtenerPorId(idPaciente);
        return mapToResponse(exp, paciente);
    }

    private ExpedienteResponseDTO mapToResponse(ExpedienteClinico exp, PacienteDTO paciente) {
        return ExpedienteResponseDTO.builder()
                .idExpedienteClinico(exp.getIdExpedienteClinico())
                .noExpediente(exp.getNoExpediente())
                .tipoSangre(exp.getTipoSangre())
                .alergias(exp.getAlergias())
                .antecedentes(exp.getAntecedentes())
                .fechaApertura(exp.getFechaApertura())
                .paciente(paciente)
                .build();
    }
}