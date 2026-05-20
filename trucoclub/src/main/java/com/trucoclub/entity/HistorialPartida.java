package com.trucoclub.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "historial_partidas")
public class HistorialPartida {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime fechaJugada = LocalDateTime.now();

    // Relación con la tabla de usuarios: un usuario puede tener muchas partidas
    @ManyToOne
    @JoinColumn(name = "ganador_id", nullable = false)
    private Usuario ganador;

    @ManyToOne
    @JoinColumn(name = "perdedor_id", nullable = false)
    private Usuario perdedor;

    private Integer puntosGanador;
    private Integer puntosPerdedor;

    public HistorialPartida() {}

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDateTime getFechaJugada() { return fechaJugada; }
    public void setFechaJugada(LocalDateTime fechaJugada) { this.fechaJugada = fechaJugada; }

    public Usuario getGanador() { return ganador; }
    public void setGanador(Usuario ganador) { this.ganador = ganador; }

    public Usuario getPerdedor() { return perdedor; }
    public void setPerdedor(Usuario perdedor) { this.perdedor = perdedor; }

    public Integer getPuntosGanador() { return puntosGanador; }
    public void setPuntosGanador(Integer puntosGanador) { this.puntosGanador = puntosGanador; }

    public Integer getPuntosPerdedor() { return puntosPerdedor; }
    public void setPuntosPerdedor(Integer puntosPerdedor) { this.puntosPerdedor = puntosPerdedor; }
}
