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
import java.util.Comparator;
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
        CitaDTO cita = citaClient.obtenerPorId(request.getIdCita());
        MedicoDTO medico = medicoClient.obtenerPorId(request.getIdMedico());

        ExpedienteClinico expediente = expedienteRepository.findById(request.getIdExpedienteClinico())
                .orElseThrow(() -> new ResourceNotFoundException("Expediente no encontrado con ID: " + request.getIdExpedienteClinico()));

        Receta receta = construirReceta(request.getReceta(), null);

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

        try {
            citaClient.cambiarEstatus(request.getIdCita(), 3L);
        } catch (Exception ignored) {
        }

        return mapToResponse(saved, cita, medico);
    }

    @Override
    @Transactional
    public ConsultaResponseDTO guardarReceta(Long idConsulta, RecetaDTO request) {
        ConsultaMedica consulta = consultaRepository.findById(idConsulta)
                .orElseThrow(() -> new ResourceNotFoundException("Consulta médica no encontrada con ID: " + idConsulta));

        // Usamos milisegundos para garantizar un folio único y que no choque en PostgreSQL
        String folioAuto = "REC-" + System.currentTimeMillis();
        Receta receta = construirReceta(request, folioAuto);

        // Si la consulta ya tenía una receta previa, le ponemos su mismo ID para actualizarla en vez de duplicarla
        if (consulta.getReceta() != null) {
            receta.setIdReceta(consulta.getReceta().getIdReceta());
        }

        consulta.setReceta(receta);
        ConsultaMedica saved = consultaRepository.save(consulta);
        
        return mapToResponse(saved, obtenerCitaSegura(saved.getIdCita()), obtenerMedicoSeguro(saved.getIdMedico()));
    }

    private Receta construirReceta(RecetaDTO dto, String folioPorDefecto) {
        if (dto == null) return null;
        String folio = (dto.getFolio() != null && !dto.getFolio().isBlank())
                ? dto.getFolio()
                : (folioPorDefecto != null ? folioPorDefecto : "REC-" + System.currentTimeMillis());

        Receta receta = Receta.builder()
                .folio(folio)
                .indicaciones(dto.getIndicaciones())
                .build();

        if (dto.getDetalles() != null) {
            for (DetalleRecetaDTO d : dto.getDetalles()) {
                DetalleReceta det = DetalleReceta.builder()
                        .medicamento(d.getMedicamento())
                        .dosis(d.getDosis())
                        .presentacion(d.getPresentacion())
                        .duracion(d.getDuracion())
                        .build();
                receta.agregarDetalle(det);
            }
        }
        return receta;
    }

    @Override
    @Transactional(readOnly = true)
    public ConsultaResponseDTO obtenerPorId(Long id) {
        ConsultaMedica c = consultaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Consulta médica no encontrada con ID: " + id));

        return mapToResponse(c, obtenerCitaSegura(c.getIdCita()), obtenerMedicoSeguro(c.getIdMedico()));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConsultaResponseDTO> listarPorExpediente(Long idExpediente) {
        return consultaRepository.findByExpedienteClinicoIdExpedienteClinico(idExpediente).stream()
                .sorted(Comparator.comparing(ConsultaMedica::getFechaHoraAtendida, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(c -> mapToResponse(c, obtenerCitaSegura(c.getIdCita()), obtenerMedicoSeguro(c.getIdMedico())))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConsultaResponseDTO> listarTodas() {
        return consultaRepository.findAll().stream()
                .sorted(Comparator.comparing(ConsultaMedica::getFechaHoraAtendida, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(c -> mapToResponse(c, obtenerCitaSegura(c.getIdCita()), obtenerMedicoSeguro(c.getIdMedico())))
                .collect(Collectors.toList());
    }

    private CitaDTO obtenerCitaSegura(Long idCita) {
        try { return citaClient.obtenerPorId(idCita); } catch (Exception e) { return null; }
    }

    private MedicoDTO obtenerMedicoSeguro(Long idMedico) {
        try { return medicoClient.obtenerPorId(idMedico); } catch (Exception e) { return null; }
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