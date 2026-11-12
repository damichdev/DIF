package com.dif.clinicaservice.controller;

import com.dif.clinicaservice.dto.ConsultaRequestDTO;
import com.dif.clinicaservice.dto.ConsultaResponseDTO;
import com.dif.clinicaservice.dto.RecetaDTO;
import com.dif.clinicaservice.service.IConsultaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/consultas")
@RequiredArgsConstructor
public class ConsultaController {

    private final IConsultaService consultaService;

    @PostMapping
    public ResponseEntity<ConsultaResponseDTO> registrar(@Valid @RequestBody ConsultaRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(consultaService.registrarConsulta(request));
    }

    @GetMapping
    public ResponseEntity<List<ConsultaResponseDTO>> listarTodas() {
        return ResponseEntity.ok(consultaService.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ConsultaResponseDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(consultaService.obtenerPorId(id));
    }

    @GetMapping("/expediente/{idExpediente}")
    public ResponseEntity<List<ConsultaResponseDTO>> listarPorExpediente(@PathVariable Long idExpediente) {
        return ResponseEntity.ok(consultaService.listarPorExpediente(idExpediente));
    }

    @PostMapping("/{id}/receta")
    public ResponseEntity<ConsultaResponseDTO> guardarReceta(@PathVariable Long id, @Valid @RequestBody RecetaDTO request) {
        return ResponseEntity.ok(consultaService.guardarReceta(id, request));
    }
}