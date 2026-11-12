package com.dif.citasservice.service.impl;

import com.dif.citasservice.client.MedicoClient;
import com.dif.citasservice.client.PacienteClient;
import com.dif.citasservice.client.dto.MedicoDTO;
import com.dif.citasservice.client.dto.PacienteDTO;
import com.dif.citasservice.dto.CitaRequestDTO;
import com.dif.citasservice.dto.CitaResponseDTO;
import com.dif.citasservice.dto.SignosVitalesDTO;
import com.dif.citasservice.entity.Cita;
import com.dif.citasservice.entity.EstatusCita;
import com.dif.citasservice.entity.SignosVitales;
import com.dif.citasservice.exception.ResourceNotFoundException;
import com.dif.citasservice.repository.CitaRepository;
import com.dif.citasservice.repository.EstatusCitaRepository;
import com.dif.citasservice.service.ICitaService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CitaServiceImpl implements ICitaService {

    private static final Long ESTATUS_PROGRAMADA = 1L;
    private static final Long ESTATUS_EN_ESPERA = 2L;
    private static final Long ESTATUS_CANCELADA = 4L;

    private final CitaRepository citaRepository;
    private final EstatusCitaRepository estatusCitaRepository;
    private final MedicoClient medicoClient;
    private final PacienteClient pacienteClient;

    @Override
    @Transactional
    public CitaResponseDTO programarCita(CitaRequestDTO request) {
        validarAgenda(request);
        // Validar existencia de dependencias externas por Feign
        MedicoDTO medico = medicoClient.obtenerPorId(request.getIdMedico());
        PacienteDTO paciente = pacienteClient.obtenerPorId(request.getIdPaciente());

        Long idEstatus = request.getIdEstatus() != null ? request.getIdEstatus() : ESTATUS_PROGRAMADA;
        EstatusCita estatus = estatusCitaRepository.findById(idEstatus)
                .orElseThrow(() -> new ResourceNotFoundException("Estatus no encontrado con ID: " + idEstatus));

        SignosVitales signos = null;
        if (request.getSignosVitales() != null) {
            signos = construirSignosVitales(request.getSignosVitales());
        }

        Cita cita = Cita.builder()
                .motivo(request.getMotivo())
                .fecha(request.getFecha())
                .hora(request.getHora())
                .idPaciente(request.getIdPaciente())
                .idMedico(request.getIdMedico())
                .estatus(estatus)
                .signosVitales(signos)
                .build();

        Cita saved = citaRepository.save(cita);
        return mapToResponse(saved, paciente, medico);
    }

    @Override
    @Transactional(readOnly = true)
    public CitaResponseDTO obtenerPorId(Long id) {
        Cita cita = citaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cita no encontrada con ID: " + id));

        MedicoDTO medico = medicoClient.obtenerPorId(cita.getIdMedico());
        PacienteDTO paciente = pacienteClient.obtenerPorId(cita.getIdPaciente());

        return mapToResponse(cita, paciente, medico);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CitaResponseDTO> listarTodas() {
        return citaRepository.findAll().stream().map(cita -> {
            MedicoDTO medico = medicoClient.obtenerPorId(cita.getIdMedico());
            PacienteDTO paciente = pacienteClient.obtenerPorId(cita.getIdPaciente());
            return mapToResponse(cita, paciente, medico);
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CitaResponseDTO> listarPorFecha(LocalDate fecha) {
        return citaRepository.findByFechaOrderByHora(fecha).stream().map(cita -> mapToResponse(cita,
                pacienteClient.obtenerPorId(cita.getIdPaciente()),
                medicoClient.obtenerPorId(cita.getIdMedico()))).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EstatusCita> catalogoEstatus() {
        return estatusCitaRepository.findAll(Sort.by("idEstatus"));
    }

    @Override
    @Transactional
    public CitaResponseDTO registrarSignosVitales(Long idCita, SignosVitalesDTO signosDTO) {
        Cita cita = citaRepository.findById(idCita)
                .orElseThrow(() -> new ResourceNotFoundException("Cita no encontrada con ID: " + idCita));

        validarSignos(signosDTO);
        Long estatusActual = cita.getEstatus().getIdEstatus();
        if (!ESTATUS_PROGRAMADA.equals(estatusActual) && !ESTATUS_EN_ESPERA.equals(estatusActual)) {
            throw new IllegalArgumentException("Solo se registran signos vitales en citas programadas o en espera");
        }

        cita.setSignosVitales(construirSignosVitales(signosDTO));
        // Al tomar los signos la cita pasa a "En espera" (misma transacción)
        if (ESTATUS_PROGRAMADA.equals(estatusActual)) {
            cita.setEstatus(estatusCitaRepository.findById(ESTATUS_EN_ESPERA)
                    .orElseThrow(() -> new ResourceNotFoundException("Estatus no encontrado con ID: " + ESTATUS_EN_ESPERA)));
        }
        Cita saved = citaRepository.save(cita);

        MedicoDTO medico = medicoClient.obtenerPorId(saved.getIdMedico());
        PacienteDTO paciente = pacienteClient.obtenerPorId(saved.getIdPaciente());
        return mapToResponse(saved, paciente, medico);
    }

    @Override
    @Transactional
    public CitaResponseDTO cambiarEstatus(Long idCita, Long nuevoEstatusId) {
        Cita cita = citaRepository.findById(idCita)
                .orElseThrow(() -> new ResourceNotFoundException("Cita no encontrada con ID: " + idCita));

        EstatusCita nuevoEstatus = estatusCitaRepository.findById(nuevoEstatusId)
                .orElseThrow(() -> new ResourceNotFoundException("Estatus no encontrado con ID: " + nuevoEstatusId));

        cita.setEstatus(nuevoEstatus);
        Cita saved = citaRepository.save(cita);

        MedicoDTO medico = medicoClient.obtenerPorId(saved.getIdMedico());
        PacienteDTO paciente = pacienteClient.obtenerPorId(saved.getIdPaciente());
        return mapToResponse(saved, paciente, medico);
    }

    // Reglas de agenda: no al pasado y sin choques de horario (médico ni paciente)
    private void validarAgenda(CitaRequestDTO r) {
        LocalDateTime cuando = LocalDateTime.of(r.getFecha(), r.getHora());
        if (cuando.isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("La cita no puede quedar en una fecha u hora que ya pasó");
        }
        if (citaRepository.existsByIdMedicoAndFechaAndHoraAndEstatusIdEstatusNot(
                r.getIdMedico(), r.getFecha(), r.getHora(), ESTATUS_CANCELADA)) {
            throw new IllegalArgumentException("Ese médico ya tiene una cita agendada a esa misma hora");
        }
        if (citaRepository.existsByIdPacienteAndFechaAndHoraAndEstatusIdEstatusNot(
                r.getIdPaciente(), r.getFecha(), r.getHora(), ESTATUS_CANCELADA)) {
            throw new IllegalArgumentException("El paciente ya tiene una cita agendada a esa misma hora");
        }
    }

    // La tensión debe ser coherente: sistólica 60–260, diastólica 30–160 y menor que la sistólica
    private void validarSignos(SignosVitalesDTO dto) {
        String[] t = dto.getTa().split("/");
        int sis = Integer.parseInt(t[0]);
        int dia = Integer.parseInt(t[1]);
        if (sis < 60 || sis > 260 || dia < 30 || dia > 160 || dia >= sis) {
            throw new IllegalArgumentException("Tensión arterial fuera de límites fisiológicos válidos");
        }
    }

    private SignosVitales construirSignosVitales(SignosVitalesDTO dto) {
        BigDecimal imc = null;
        if (dto.getPeso() != null && dto.getTalla() != null && dto.getTalla().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal tallaM = dto.getTalla().compareTo(BigDecimal.valueOf(3)) > 0
                    ? dto.getTalla().divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP)
                    : dto.getTalla();
            imc = dto.getPeso().divide(tallaM.multiply(tallaM), 2, RoundingMode.HALF_UP);
        }

        return SignosVitales.builder()
                .peso(dto.getPeso())
                .talla(dto.getTalla())
                .temperatura(dto.getTemperatura())
                .spo2(dto.getSpo2())
                .fc(dto.getFc())
                .fr(dto.getFr())
                .ta(dto.getTa())
                .imc(imc)
                .glucosa(dto.getGlucosa())
                .fechaRegistro(LocalDateTime.now())
                .build();
    }

    private CitaResponseDTO mapToResponse(Cita cita, PacienteDTO paciente, MedicoDTO medico) {
        SignosVitalesDTO signosDTO = null;
        if (cita.getSignosVitales() != null) {
            SignosVitales s = cita.getSignosVitales();
            signosDTO = SignosVitalesDTO.builder()
                    .peso(s.getPeso())
                    .talla(s.getTalla())
                    .temperatura(s.getTemperatura())
                    .spo2(s.getSpo2())
                    .fc(s.getFc())
                    .fr(s.getFr())
                    .ta(s.getTa())
                    .imc(s.getImc())
                    .glucosa(s.getGlucosa())
                    .fechaRegistro(s.getFechaRegistro())
                    .build();
        }

        return CitaResponseDTO.builder()
                .idCita(cita.getIdCita())
                .motivo(cita.getMotivo())
                .fecha(cita.getFecha())
                .hora(cita.getHora())
                .idEstatus(cita.getEstatus().getIdEstatus())
                .nombreEstatus(cita.getEstatus().getNombreEstatus())
                .paciente(paciente)
                .medico(medico)
                .signosVitales(signosDTO)
                .build();
    }
}