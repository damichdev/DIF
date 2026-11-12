package com.dif.pacienteservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PacienteRequestDTO {

    @NotBlank(message = "El nombre del paciente es obligatorio")
    private String nombrePaciente;

    @NotBlank(message = "El apellido paterno es obligatorio")
    private String apPaterno;

    private String apMaterno;

    @NotBlank(message = "La CURP es obligatoria")
    @Size(min = 18, max = 18, message = "La CURP debe tener exactamente 18 caracteres")
    private String curp;

    @NotNull(message = "La fecha de nacimiento es obligatoria")
    private LocalDate fechaNacimiento;

    @Pattern(regexp = "^[0-9]{10}$", message = "El teléfono debe contener 10 dígitos")
    private String telefono;

    @NotNull(message = "El ID del sexo es obligatorio")
    private Long idSexo;

    @NotNull(message = "El ID de derecho ambiente es obligatorio")
    private Long idDerechoAmbiente;
}