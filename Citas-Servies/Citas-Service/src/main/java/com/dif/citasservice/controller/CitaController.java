package com.dif.citasservice.controller;

import com.dif.citasservice.dto.CitaRequestDTO;
import com.dif.citasservice.dto.CitaResponseDTO;
import com.dif.citasservice.dto.SignosVitalesDTO;
import com.dif.citasservice.service.ICitaService;
import com.dif.citasservice.entity.EstatusCita;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
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

    // Con ?fecha=AAAA-MM-DD devuelve la agenda de ese día
    @GetMapping
    public ResponseEntity<List<CitaResponseDTO>> listar(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        return ResponseEntity.ok(fecha != null ? citaService.listarPorFecha(fecha) : citaService.listarTodas());
    }

    @GetMapping("/estatus")
    public ResponseEntity<List<EstatusCita>> catalogoEstatus() {
        return ResponseEntity.ok(citaService.catalogoEstatus());
    }

    @PutMapping("/{id}/signos")
    public ResponseEntity<CitaResponseDTO> registrarSignos(@PathVariable Long id, @Valid @RequestBody SignosVitalesDTO signos) {
        return ResponseEntity.ok(citaService.registrarSignosVitales(id, signos));
    }

    @PatchMapping("/{id}/estatus/{idEstatus}")
    public ResponseEntity<CitaResponseDTO> cambiarEstatus(@PathVariable Long id, @PathVariable Long idEstatus) {
        return ResponseEntity.ok(citaService.cambiarEstatus(id, idEstatus));
    }
}