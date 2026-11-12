package com.dif.clinicaservice.service.impl;

import com.dif.clinicaservice.client.CitaClient;
import com.dif.clinicaservice.client.MedicoClient;
import com.dif.clinicaservice.client.dto.CitaDTO;
import com.dif.clinicaservice.client.dto.MedicoDTO;
import com.dif.clinicaservice.dto.ConsultaRequestDTO;
import com.dif.clinicaservice.dto.ConsultaResponseDTO;
import com.dif.clinicaservice.dto.DetalleRecetaDTO;
import com.dif.clinicaservice.dto.RecetaDTO;
import com.dif.clinicaservice.entity.ConsultaMedica;
import com.dif.clinicaservice.entity.DetalleReceta;
import com.dif.clinicaservice.entity.ExpedienteClinico;
import com.dif.clinicaservice.entity.Receta;
import com.dif.clinicaservice.exception.ResourceNotFoundException;
import com.dif.clinicaservice.repository.ConsultaMedicaRepository;
import com.dif.clinicaservice.repository.ExpedienteClinicoRepository;
import com.dif.clinicaservice.service.IConsultaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ConsultaServiceImpl implements IConsultaService {

    private final ConsultaMedicaRepository consultaRepository;
    private final ExpedienteClinicoRepository expedienteRepository;
    private final MedicoClient medicoClient;
    private final CitaClient citaClient;

    @Override
    @Transactional
    public ConsultaResponseDTO registrarConsulta(ConsultaRequestDTO request) {
        // Validar citas y médicos en sus microservicios
        CitaDTO cita = citaClient.obtenerPorId(request.getIdCita());
        MedicoDTO medico = medicoClient.obtenerPorId(request.getIdMedico());

        ExpedienteClinico expediente = expedienteRepository.findById(request.getIdExpedienteClinico())
                .orElseThrow(() -> new ResourceNotFoundException("Expediente no encontrado con ID: " + request.getIdExpedienteClinico()));

        Receta receta = null;
        if (request.getReceta() != null) {
            receta = Receta.builder()
                    .folio(request.getReceta().getFolio())
                    .indicaciones(request.getReceta().getIndicaciones())
                    .build();

            if (request.getReceta().getDetalles() != null) {
                for (DetalleRecetaDTO d : request.getReceta().getDetalles()) {
                    DetalleReceta det = DetalleReceta.builder()
                            .medicamento(d.getMedicamento())
                            .dosis(d.getDosis())
                            .presentacion(d.getPresentacion())
                            .duracion(d.getDuracion())
                            .build();
                    receta.agregarDetalle(det);
                }
            }
        }

        ConsultaMedica consulta = ConsultaMedica.builder()
                .fechaHoraAtendida(LocalDateTime.now())
                .padecimientoActual(request.getPadecimientoActual())
                .interrogatorio(request.getInterrogatorio())
                .exploracionFisica(request.getExploracionFisica())
                .diagnostico(request.getDiagnostico())
                .idCita(request.getIdCita())
                .idMedico(request.getIdMedico())
                .expedienteClinico(expediente)
                .receta(receta)
                .build();

        ConsultaMedica saved = consultaRepository.save(consulta);

        // Actualizar estatus de cita a 3 ("Atendida") en citas-service
        try {
            citaClient.cambiarEstatus(request.getIdCita(), 3L);
        } catch (Exception ignored) {
            // Log de advertencia si no se actualizó el estatus
        }

        return mapToResponse(saved, cita, medico);
    }

    @Override
    @Transactional(readOnly = true)
    public ConsultaResponseDTO obtenerPorId(Long id) {
        ConsultaMedica c = consultaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Consulta médica no encontrada con ID: " + id));

        CitaDTO cita = citaClient.obtenerPorId(c.getIdCita());
        MedicoDTO medico = medicoClient.obtenerPorId(c.getIdMedico());
        return mapToResponse(c, cita, medico);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConsultaResponseDTO> listarPorExpediente(Long idExpediente) {
        return consultaRepository.findByExpedienteClinicoIdExpedienteClinico(idExpediente).stream()
                .map(c -> {
                    CitaDTO cita = citaClient.obtenerPorId(c.getIdCita());
                    MedicoDTO medico = medicoClient.obtenerPorId(c.getIdMedico());
                    return mapToResponse(c, cita, medico);
                })
                .collect(Collectors.toList());
    }

    private ConsultaResponseDTO mapToResponse(ConsultaMedica c, CitaDTO cita, MedicoDTO medico) {
        RecetaDTO recetaDTO = null;
        if (c.getReceta() != null) {
            List<DetalleRecetaDTO> detalles = c.getReceta().getDetalles().stream().map(d ->
                    DetalleRecetaDTO.builder()
                            .idDetalle(d.getIdDetalle())
                            .medicamento(d.getMedicamento())
                            .dosis(d.getDosis())
                            .presentacion(d.getPresentacion())
                            .duracion(d.getDuracion())
                            .build()
            ).collect(Collectors.toList());

            recetaDTO = RecetaDTO.builder()
                    .idReceta(c.getReceta().getIdReceta())
                    .folio(c.getReceta().getFolio())
                    .indicaciones(c.getReceta().getIndicaciones())
                    .detalles(detalles)
                    .build();
        }

        return ConsultaResponseDTO.builder()
                .idConsulta(c.getIdConsulta())
                .fechaHoraAtendida(c.getFechaHoraAtendida())
                .padecimientoActual(c.getPadecimientoActual())
                .interrogatorio(c.getInterrogatorio())
                .exploracionFisica(c.getExploracionFisica())
                .diagnostico(c.getDiagnostico())
                .idExpedienteClinico(c.getExpedienteClinico().getIdExpedienteClinico())
                .cita(cita)
                .medico(medico)
                .receta(recetaDTO)
                .build();
    }
}