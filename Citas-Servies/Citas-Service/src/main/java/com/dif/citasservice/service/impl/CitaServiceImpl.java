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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CitaServiceImpl implements ICitaService {

    private final CitaRepository citaRepository;
    private final EstatusCitaRepository estatusCitaRepository;
    private final MedicoClient medicoClient;
    private final PacienteClient pacienteClient;

    @Override
    @Transactional
    public CitaResponseDTO programarCita(CitaRequestDTO request) {
        // Validar existencia de dependencias externas por Feign
        MedicoDTO medico = medicoClient.obtenerPorId(request.getIdMedico());
        PacienteDTO paciente = pacienteClient.obtenerPorId(request.getIdPaciente());

        EstatusCita estatus = estatusCitaRepository.findById(request.getIdEstatus())
                .orElseThrow(() -> new ResourceNotFoundException("Estatus no encontrado con ID: " + request.getIdEstatus()));

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
    @Transactional
    public CitaResponseDTO registrarSignosVitales(Long idCita, SignosVitalesDTO signosDTO) {
        Cita cita = citaRepository.findById(idCita)
                .orElseThrow(() -> new ResourceNotFoundException("Cita no encontrada con ID: " + idCita));

        cita.setSignosVitales(construirSignosVitales(signosDTO));
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

    private SignosVitales construirSignosVitales(SignosVitalesDTO dto) {
        BigDecimal imc = dto.getImc();
        if (imc == null && dto.getPeso() != null && dto.getTalla() != null && dto.getTalla().compareTo(BigDecimal.ZERO) > 0) {
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