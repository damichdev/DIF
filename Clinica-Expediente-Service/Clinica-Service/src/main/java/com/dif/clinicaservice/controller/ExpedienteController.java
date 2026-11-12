package com.dif.clinicaservice.controller;

import com.dif.clinicaservice.dto.ExpedienteRequestDTO;
import com.dif.clinicaservice.dto.ExpedienteResponseDTO;
import com.dif.clinicaservice.service.IExpedienteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/expedientes")
@RequiredArgsConstructor
public class ExpedienteController {

    private final IExpedienteService expedienteService;

    @PostMapping
    public ResponseEntity<ExpedienteResponseDTO> abrirExpediente(@Valid @RequestBody ExpedienteRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(expedienteService.abrirExpediente(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExpedienteResponseDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(expedienteService.obtenerPorId(id));
    }

    @GetMapping("/paciente/{idPaciente}")
    public ResponseEntity<ExpedienteResponseDTO> obtenerPorPaciente(@PathVariable Long idPaciente) {
        return ResponseEntity.ok(expedienteService.obtenerPorPaciente(idPaciente));
    }
}