package com.dif.clinicaservice.client;

import com.dif.clinicaservice.client.dto.CitaDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "cita-service", url = "${app.citas-service.url}")
public interface CitaClient {
    @GetMapping("/api/citas/{id}")
    CitaDTO obtenerPorId(@PathVariable("id") Long id);

    @PatchMapping("/api/citas/{id}/estatus/{idEstatus}")
    void cambiarEstatus(@PathVariable("id") Long id, @PathVariable("idEstatus") Long idEstatus);
}