package com.dif.pacienteservice.repository;

import com.dif.pacienteservice.entity.Paciente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PacienteRepository extends JpaRepository<Paciente, Long> {
    Optional<Paciente> findByCurp(String curp);
    boolean existsByCurp(String curp);

    // q ya viene en minúsculas; busca por nombre completo o CURP
    @Query("""
            select p from Paciente p
            where lower(concat(p.nombrePaciente, ' ', p.apPaterno, ' ', coalesce(p.apMaterno, ''))) like concat('%', :q, '%')
               or lower(p.curp) like concat('%', :q, '%')
            order by p.apPaterno, p.nombrePaciente
            """)
    List<Paciente> buscar(@Param("q") String q);
}