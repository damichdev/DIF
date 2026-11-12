package com.dif.clinicaservice.client;

import com.dif.clinicaservice.client.dto.MedicoDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "medico-service", url = "${app.medicos-service.url}")
public interface MedicoClient {
    @GetMapping("/api/medicos/{id}")
    MedicoDTO obtenerPorId(@PathVariable("id") Long id);
}