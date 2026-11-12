package com.dif.medicoservice.controller;

import com.dif.medicoservice.dto.MedicoRequestDTO;
import com.dif.medicoservice.dto.MedicoResponseDTO;
import com.dif.medicoservice.service.IMedicoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medicos")
@RequiredArgsConstructor
public class MedicoController {

    private final IMedicoService medicoService;

    @PostMapping
    public ResponseEntity<MedicoResponseDTO> crear(@Valid @RequestBody MedicoRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(medicoService.crearMedico(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MedicoResponseDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(medicoService.obtenerPorId(id));
    }

    @GetMapping
    public ResponseEntity<List<MedicoResponseDTO>> listarTodos() {
        return ResponseEntity.ok(medicoService.listarTodos());
    }

    @PutMapping("/{id}")
    public ResponseEntity<MedicoResponseDTO> actualizar(@PathVariable Long id, @Valid @RequestBody MedicoRequestDTO request) {
        return ResponseEntity.ok(medicoService.actualizarMedico(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        medicoService.eliminarMedico(id);
        return ResponseEntity.noContent().build();
    }
}