package com.dif.pacienteservice.controller;

import com.dif.pacienteservice.dto.CatalogoItemDTO;
import com.dif.pacienteservice.dto.PacienteRequestDTO;
import com.dif.pacienteservice.dto.PacienteResponseDTO;
import com.dif.pacienteservice.service.IPacienteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pacientes")
@RequiredArgsConstructor
public class PacienteController {

    private final IPacienteService pacienteService;

    @PostMapping
    public ResponseEntity<PacienteResponseDTO> crear(@Valid @RequestBody PacienteRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(pacienteService.crearPaciente(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PacienteResponseDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(pacienteService.obtenerPorId(id));
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<PacienteResponseDTO>> buscar(@RequestParam String q) {
        return ResponseEntity.ok(pacienteService.buscar(q));
    }

    @GetMapping("/catalogos")
    public ResponseEntity<Map<String, List<CatalogoItemDTO>>> catalogos() {
        return ResponseEntity.ok(pacienteService.catalogos());
    }

    @GetMapping("/curp/{curp}")
    public ResponseEntity<PacienteResponseDTO> obtenerPorCurp(@PathVariable String curp) {
        return ResponseEntity.ok(pacienteService.obtenerPorCurp(curp));
    }

    @GetMapping
    public ResponseEntity<List<PacienteResponseDTO>> listarTodos() {
        return ResponseEntity.ok(pacienteService.listarTodos());
    }

    @PutMapping("/{id}")
    public ResponseEntity<PacienteResponseDTO> actualizar(@PathVariable Long id, @Valid @RequestBody PacienteRequestDTO request) {
        return ResponseEntity.ok(pacienteService.actualizarPaciente(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        pacienteService.eliminarPaciente(id);
        return ResponseEntity.noContent().build();
    }
}