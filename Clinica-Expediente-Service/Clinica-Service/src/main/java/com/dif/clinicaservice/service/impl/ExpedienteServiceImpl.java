package com.dif.clinicaservice.service.impl;

import com.dif.clinicaservice.client.PacienteClient;
import com.dif.clinicaservice.client.dto.PacienteDTO;
import com.dif.clinicaservice.dto.ExpedienteRequestDTO;
import com.dif.clinicaservice.dto.ExpedienteResponseDTO;
import com.dif.clinicaservice.dto.ExpedienteUpdateDTO;
import com.dif.clinicaservice.entity.ExpedienteClinico;
import com.dif.clinicaservice.exception.ResourceNotFoundException;
import com.dif.clinicaservice.repository.ExpedienteClinicoRepository;
import com.dif.clinicaservice.service.IExpedienteService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.UUID;

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
        boolean generar = request.getNoExpediente() == null || request.getNoExpediente().isBlank();
        if (!generar && expedienteRepository.existsByNoExpediente(request.getNoExpediente())) {
            throw new IllegalArgumentException("El número de expediente ya está en uso");
        }

        ExpedienteClinico expediente = ExpedienteClinico.builder()
                // Provisional si hay que generarlo: se reemplaza abajo con el id ya asignado
                .noExpediente(generar ? "TMP-" + UUID.randomUUID() : request.getNoExpediente())
                .tipoSangre(request.getTipoSangre())
                .alergias(request.getAlergias())
                .antecedentes(request.getAntecedentes())
                .fechaApertura(request.getFechaApertura() != null ? request.getFechaApertura() : LocalDate.now())
                .idPaciente(request.getIdPaciente())
                .build();

        expediente = expedienteRepository.save(expediente);
        if (generar) {
            expediente.setNoExpediente(String.format("EXP-%06d", expediente.getIdExpedienteClinico()));
            expediente = expedienteRepository.save(expediente);
        }
        return mapToResponse(expediente, paciente);
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

    @Override
    @Transactional(readOnly = true)
    public ExpedienteResponseDTO obtenerPorNumero(String noExpediente) {
        ExpedienteClinico exp = expedienteRepository.findByNoExpediente(noExpediente.trim().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Expediente no encontrado con número: " + noExpediente));
        return mapToResponse(exp, pacienteClient.obtenerPorId(exp.getIdPaciente()));
    }

    @Override
    @Transactional
    public ExpedienteResponseDTO actualizarExpediente(Long id, ExpedienteUpdateDTO request) {
        ExpedienteClinico exp = expedienteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expediente no encontrado con ID: " + id));
        exp.setTipoSangre(request.getTipoSangre());
        exp.setAlergias(request.getAlergias());
        exp.setAntecedentes(request.getAntecedentes());
        exp = expedienteRepository.save(exp);
        return mapToResponse(exp, pacienteClient.obtenerPorId(exp.getIdPaciente()));
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