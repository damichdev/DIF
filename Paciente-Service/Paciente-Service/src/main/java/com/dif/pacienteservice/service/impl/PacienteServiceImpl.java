package com.dif.pacienteservice.service.impl;

import com.dif.pacienteservice.dto.CatalogoItemDTO;
import com.dif.pacienteservice.dto.PacienteRequestDTO;
import com.dif.pacienteservice.dto.PacienteResponseDTO;
import com.dif.pacienteservice.entity.DerechoHabiente;
import com.dif.pacienteservice.entity.Paciente;
import com.dif.pacienteservice.entity.Sexo;
import com.dif.pacienteservice.exception.ResourceNotFoundException;
import com.dif.pacienteservice.repository.DerechoHabienteRepository;
import com.dif.pacienteservice.repository.PacienteRepository;
import com.dif.pacienteservice.repository.SexoRepository;
import com.dif.pacienteservice.service.IPacienteService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;
import java.util.Map;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PacienteServiceImpl implements IPacienteService {

    private final PacienteRepository pacienteRepository;
    private final SexoRepository sexoRepository;
    private final DerechoHabienteRepository derechoAmbienteRepository;

    @Override
    @Transactional
    public PacienteResponseDTO crearPaciente(PacienteRequestDTO request) {
        normalizar(request);
        if (pacienteRepository.existsByCurp(request.getCurp())) {
            throw new IllegalArgumentException("La CURP ya está registrada");
        }

        Sexo sexo = sexoRepository.findById(request.getIdSexo())
                .orElseThrow(() -> new ResourceNotFoundException("Sexo no encontrado con ID: " + request.getIdSexo()));

        DerechoHabiente da = derechoAmbienteRepository.findById(request.getIdDerechoAmbiente())
                .orElseThrow(() -> new ResourceNotFoundException("Derecho Ambiente no encontrado con ID: " + request.getIdDerechoAmbiente()));

        Paciente paciente = Paciente.builder()
                .nombrePaciente(request.getNombrePaciente())
                .apPaterno(request.getApPaterno())
                .apMaterno(request.getApMaterno())
                .curp(request.getCurp())
                .fechaNacimiento(request.getFechaNacimiento())
                .telefono(request.getTelefono())
                .tutor(request.getTutor())
                .telTutor(request.getTelTutor())
                .sexo(sexo)
                .derechoAmbiente(da)
                .build();

        return mapToResponse(pacienteRepository.save(paciente));
    }

    @Override
    @Transactional(readOnly = true)
    public PacienteResponseDTO obtenerPorId(Long id) {
        Paciente paciente = pacienteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Paciente no encontrado con ID: " + id));
        return mapToResponse(paciente);
    }

    @Override
    @Transactional(readOnly = true)
    public PacienteResponseDTO obtenerPorCurp(String curp) {
        Paciente paciente = pacienteRepository.findByCurp(curp)
                .orElseThrow(() -> new ResourceNotFoundException("Paciente no encontrado con CURP: " + curp));
        return mapToResponse(paciente);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PacienteResponseDTO> listarTodos() {
        return pacienteRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PacienteResponseDTO actualizarPaciente(Long id, PacienteRequestDTO request) {
        normalizar(request);
        Paciente paciente = pacienteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Paciente no encontrado con ID: " + id));

        if (!paciente.getCurp().equals(request.getCurp()) && pacienteRepository.existsByCurp(request.getCurp())) {
            throw new IllegalArgumentException("La nueva CURP ya está asignada a otro paciente");
        }

        Sexo sexo = sexoRepository.findById(request.getIdSexo())
                .orElseThrow(() -> new ResourceNotFoundException("Sexo no encontrado con ID: " + request.getIdSexo()));

        DerechoHabiente da = derechoAmbienteRepository.findById(request.getIdDerechoAmbiente())
                .orElseThrow(() -> new ResourceNotFoundException("Derecho Ambiente no encontrado con ID: " + request.getIdDerechoAmbiente()));

        paciente.setNombrePaciente(request.getNombrePaciente());
        paciente.setApPaterno(request.getApPaterno());
        paciente.setApMaterno(request.getApMaterno());
        paciente.setCurp(request.getCurp());
        paciente.setFechaNacimiento(request.getFechaNacimiento());
        paciente.setTelefono(request.getTelefono());
        paciente.setTutor(request.getTutor());
        paciente.setTelTutor(request.getTelTutor());
        paciente.setSexo(sexo);
        paciente.setDerechoAmbiente(da);

        return mapToResponse(pacienteRepository.save(paciente));
    }

    @Override
    @Transactional
    public void eliminarPaciente(Long id) {
        if (!pacienteRepository.existsById(id)) {
            throw new ResourceNotFoundException("Paciente no encontrado con ID: " + id);
        }
        pacienteRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PacienteResponseDTO> buscar(String texto) {
        String q = texto == null ? "" : texto.trim().toLowerCase();
        if (q.length() < 2) {
            throw new IllegalArgumentException("Escribe al menos 2 caracteres para buscar");
        }
        return pacienteRepository.buscar(q).stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, List<CatalogoItemDTO>> catalogos() {
        return Map.of(
                "sexos", sexoRepository.findAll().stream()
                        .map(x -> new CatalogoItemDTO(x.getIdSexo(), x.getNombreSexo())).toList(),
                "derechos", derechoAmbienteRepository.findAll().stream()
                        .map(x -> new CatalogoItemDTO(x.getIdDerechoAmbiente(), x.getNombreDerechoAmbiente())).toList());
    }

    // Limpia el texto y aplica la regla de negocio: un menor de edad necesita tutor
    private void normalizar(PacienteRequestDTO r) {
        r.setCurp(r.getCurp().trim().toUpperCase());
        r.setApMaterno(vacioANulo(r.getApMaterno()));
        r.setTelefono(vacioANulo(r.getTelefono()));
        r.setTutor(vacioANulo(r.getTutor()));
        r.setTelTutor(vacioANulo(r.getTelTutor()));
        boolean menor = Period.between(r.getFechaNacimiento(), LocalDate.now()).getYears() < 18;
        if (menor && r.getTutor() == null) {
            throw new IllegalArgumentException("Paciente menor de edad: registra el nombre del tutor responsable");
        }
        if (!menor) { // los datos del tutor solo aplican a menores
            r.setTutor(null);
            r.setTelTutor(null);
        }
    }

    private String vacioANulo(String t) {
        return t == null || t.isBlank() ? null : t.trim();
    }

    private PacienteResponseDTO mapToResponse(Paciente p) {
        return PacienteResponseDTO.builder()
                .idPaciente(p.getIdPaciente())
                .nombrePaciente(p.getNombrePaciente())
                .apPaterno(p.getApPaterno())
                .apMaterno(p.getApMaterno())
                .curp(p.getCurp())
                .fechaNacimiento(p.getFechaNacimiento())
                .telefono(p.getTelefono())
                .tutor(p.getTutor())
                .telTutor(p.getTelTutor())
                .idSexo(p.getSexo().getIdSexo())
                .nombreSexo(p.getSexo().getNombreSexo())
                .idDerechoAmbiente(p.getDerechoAmbiente().getIdDerechoAmbiente())
                .nombreDerechoAmbiente(p.getDerechoAmbiente().getNombreDerechoAmbiente())
                .build();
    }
}