package com.dif.citasservice.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SignosVitalesDTO {
    private BigDecimal peso;
    private BigDecimal talla;
    private BigDecimal temperatura;
    private Integer spo2;
    private Integer fc;
    private Integer fr;
    private String ta;
    private BigDecimal imc;
}