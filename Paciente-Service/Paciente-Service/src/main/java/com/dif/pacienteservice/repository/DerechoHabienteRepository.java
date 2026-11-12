package com.dif.pacienteservice.repository;

import com.dif.pacienteservice.entity.DerechoHabiente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DerechoHabienteRepository extends JpaRepository<DerechoHabiente, Long> {
}