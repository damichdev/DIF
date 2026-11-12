package com.dif.citasservice.controller;

import com.dif.citasservice.dto.CitaRequestDTO;
import com.dif.citasservice.dto.CitaResponseDTO;
import com.dif.citasservice.dto.SignosVitalesDTO;
import com.dif.citasservice.service.ICitaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/citas")
@RequiredArgsConstructor
public class CitaController {

    private final ICitaService citaService;

    @PostMapping
    public ResponseEntity<CitaResponseDTO> programar(@Valid @RequestBody CitaRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(citaService.programarCita(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CitaResponseDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(citaService.obtenerPorId(id));
    }

    @GetMapping
    public ResponseEntity<List<CitaResponseDTO>> listarTodas() {
        return ResponseEntity.ok(citaService.listarTodas());
    }

    @PutMapping("/{id}/signos")
    public ResponseEntity<CitaResponseDTO> registrarSignos(@PathVariable Long id, @RequestBody SignosVitalesDTO signos) {
        return ResponseEntity.ok(citaService.registrarSignosVitales(id, signos));
    }

    @PatchMapping("/{id}/estatus/{idEstatus}")
    public ResponseEntity<CitaResponseDTO> cambiarEstatus(@PathVariable Long id, @PathVariable Long idEstatus) {
        return ResponseEntity.ok(citaService.cambiarEstatus(id, idEstatus));
    }
}