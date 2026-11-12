package com.dif.medicoservice.service.impl;

import com.dif.medicoservice.dto.MedicoRequestDTO;
import com.dif.medicoservice.dto.MedicoResponseDTO;
import com.dif.medicoservice.entity.Medico;
import com.dif.medicoservice.exception.ResourceNotFoundException;
import com.dif.medicoservice.repository.MedicoRepository;
import com.dif.medicoservice.service.IMedicoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicoServiceImpl implements IMedicoService {

    private final MedicoRepository medicoRepository;

    @Override
    @Transactional
    public MedicoResponseDTO crearMedico(MedicoRequestDTO request) {
        if (medicoRepository.existsByCorreo(request.getCorreo())) {
            throw new IllegalArgumentException("El correo ya está registrado");
        }
        if (medicoRepository.existsByCedulaProfesional(request.getCedulaProfesional())) {
            throw new IllegalArgumentException("La cédula ya está registrada");
        }

        Medico medico = Medico.builder()
                .nombre(request.getNombre())
                .apPaterno(request.getApPaterno())
                .apMaterno(request.getApMaterno())
                .cedulaProfesional(request.getCedulaProfesional())
                .areaEspecialidad(request.getAreaEspecialidad())
                .correo(request.getCorreo())
                .contrasena(request.getContrasena())
                .build();

        return mapToResponse(medicoRepository.save(medico));
    }

    @Override
    @Transactional(readOnly = true)
    public MedicoResponseDTO obtenerPorId(Long id) {
        Medico medico = medicoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Médico no encontrado con ID: " + id));
        return mapToResponse(medico);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MedicoResponseDTO> listarTodos() {
        return medicoRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public MedicoResponseDTO actualizarMedico(Long id, MedicoRequestDTO request) {
        Medico medico = medicoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Médico no encontrado con ID: " + id));

        medico.setNombre(request.getNombre());
        medico.setApPaterno(request.getApPaterno());
        medico.setApMaterno(request.getApMaterno());
        medico.setCedulaProfesional(request.getCedulaProfesional());
        medico.setAreaEspecialidad(request.getAreaEspecialidad());
        medico.setCorreo(request.getCorreo());
        medico.setContrasena(request.getContrasena());

        return mapToResponse(medicoRepository.save(medico));
    }

    @Override
    @Transactional
    public void eliminarMedico(Long id) {
        if (!medicoRepository.existsById(id)) {
            throw new ResourceNotFoundException("Médico no encontrado con ID: " + id);
        }
        medicoRepository.deleteById(id);
    }

    private MedicoResponseDTO mapToResponse(Medico medico) {
        return MedicoResponseDTO.builder()
                .idMedico(medico.getIdMedico())
                .nombre(medico.getNombre())
                .apPaterno(medico.getApPaterno())
                .apMaterno(medico.getApMaterno())
                .cedulaProfesional(medico.getCedulaProfesional())
                .areaEspecialidad(medico.getAreaEspecialidad())
                .correo(medico.getCorreo())
                .build();
    }
}