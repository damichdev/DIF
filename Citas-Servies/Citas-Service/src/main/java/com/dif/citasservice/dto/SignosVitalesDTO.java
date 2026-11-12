package com.dif.citasservice.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SignosVitalesDTO {
    @NotNull(message = "El peso es obligatorio")
    @DecimalMin(value = "0.5", message = "Peso fuera de rango (0.5–300 kg)")
    @DecimalMax(value = "300", message = "Peso fuera de rango (0.5–300 kg)")
    private BigDecimal peso;

    @NotNull(message = "La talla es obligatoria")
    @DecimalMin(value = "30", message = "Talla fuera de rango (30–250 cm)")
    @DecimalMax(value = "250", message = "Talla fuera de rango (30–250 cm)")
    private BigDecimal talla;

    @NotNull(message = "La temperatura es obligatoria")
    @DecimalMin(value = "30", message = "Temperatura fuera de rango (30–45 °C)")
    @DecimalMax(value = "45", message = "Temperatura fuera de rango (30–45 °C)")
    private BigDecimal temperatura;

    @NotNull(message = "La saturación de oxígeno es obligatoria")
    @Min(value = 50, message = "Saturación de oxígeno fuera de rango (50–100 %)")
    @Max(value = 100, message = "Saturación de oxígeno fuera de rango (50–100 %)")
    private Integer spo2;

    @NotNull(message = "La frecuencia cardiaca es obligatoria")
    @Min(value = 30, message = "Frecuencia cardiaca fuera de rango (30–220 lpm)")
    @Max(value = 220, message = "Frecuencia cardiaca fuera de rango (30–220 lpm)")
    private Integer fc;

    @NotNull(message = "La frecuencia respiratoria es obligatoria")
    @Min(value = 5, message = "Frecuencia respiratoria fuera de rango (5–60 rpm)")
    @Max(value = 60, message = "Frecuencia respiratoria fuera de rango (5–60 rpm)")
    private Integer fr;

    @NotNull(message = "La tensión arterial es obligatoria")
    @Pattern(regexp = "^\\d{2,3}/\\d{2,3}$", message = "La tensión arterial debe registrarse en formato 120/80")
    private String ta;

    // Se ignora lo que mande el cliente: el servidor lo calcula con peso y talla
    private BigDecimal imc;

    @DecimalMin(value = "20", message = "Glucosa fuera de rango (20–600 mg/dL)")
    @DecimalMax(value = "600", message = "Glucosa fuera de rango (20–600 mg/dL)")
    private BigDecimal glucosa;

    private LocalDateTime fechaRegistro;
}
