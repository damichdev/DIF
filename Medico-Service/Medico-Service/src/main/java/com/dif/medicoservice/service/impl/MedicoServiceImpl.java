package com.dif.medicoservice.service.impl;

import com.dif.medicoservice.dto.MedicoRequestDTO;
import com.dif.medicoservice.dto.MedicoResponseDTO;
import com.dif.medicoservice.entity.Medico;
import com.dif.medicoservice.exception.ResourceNotFoundException;
import com.dif.medicoservice.entity.Usuario;
import com.dif.medicoservice.repository.MedicoRepository;
import com.dif.medicoservice.repository.UsuarioRepository;
import com.dif.medicoservice.service.IMedicoService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicoServiceImpl implements IMedicoService {

    private final MedicoRepository medicoRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder encoder;

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
                .contrasena(encoder.encode(request.getContrasena()))
                .build();

        Medico guardado = medicoRepository.save(medico);
        // Cada médico tiene su cuenta de acceso (rol M); comparte el hash, nunca texto plano
        usuarioRepository.save(Usuario.builder()
                .nombre(guardado.getNombre() + " " + guardado.getApPaterno())
                .correo(guardado.getCorreo().trim().toLowerCase())
                .contrasena(guardado.getContrasena())
                .rol("M")
                .idMedico(guardado.getIdMedico())
                .build());
        return mapToResponse(guardado);
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
        medico.setContrasena(encoder.encode(request.getContrasena()));

        Medico guardado = medicoRepository.save(medico);
        usuarioRepository.findByIdMedico(id).ifPresent(u -> {
            u.setNombre(guardado.getNombre() + " " + guardado.getApPaterno());
            u.setCorreo(guardado.getCorreo().trim().toLowerCase());
            u.setContrasena(guardado.getContrasena());
            usuarioRepository.save(u);
        });
        return mapToResponse(guardado);
    }

    @Override
    @Transactional
    public void eliminarMedico(Long id) {
        if (!medicoRepository.existsById(id)) {
            throw new ResourceNotFoundException("Médico no encontrado con ID: " + id);
        }
        usuarioRepository.findByIdMedico(id).ifPresent(usuarioRepository::delete);
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