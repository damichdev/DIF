package com.dif.clinicaservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class ClinicaServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(ClinicaServiceApplication.class, args);
    }
}