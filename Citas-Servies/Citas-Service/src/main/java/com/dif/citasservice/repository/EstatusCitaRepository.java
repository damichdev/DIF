package com.dif.citasservice.repository;

import com.dif.citasservice.entity.EstatusCita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EstatusCitaRepository extends JpaRepository<EstatusCita, Long> {
}