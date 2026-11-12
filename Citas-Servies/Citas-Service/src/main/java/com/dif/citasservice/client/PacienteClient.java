package com.dif.citasservice.client;

import com.dif.citasservice.client.dto.PacienteDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "paciente-service", url = "${app.pacientes-service.url}")
public interface PacienteClient {
    @GetMapping("/api/pacientes/{id}")
    PacienteDTO obtenerPorId(@PathVariable("id") Long id);
}