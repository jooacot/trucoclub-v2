package com.trucoclub.repository;

import com.trucoclub.entity.HistorialPartida;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HistorialPartidaRepository extends JpaRepository<HistorialPartida, Long> {
    // Spring hereda automáticamente métodos como save(), findAll(), delete(), etc.
}