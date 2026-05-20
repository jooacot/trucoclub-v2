package com.trucoclub.model;

public class MensajeJugada {
    private String mesaId;
    private String jugador;
    private int cartaIndice;

    // Getters y Setters
    public String getMesaId() {
        return mesaId;
    }

    public void setMesaId(String mesaId) {
        this.mesaId = mesaId;
    }

    public String getJugador() {
        return jugador;
    }

    public void setJugador(String jugador) {
        this.jugador = jugador;
    }

    public int getCartaIndice() {
        return cartaIndice;
    }

    public void setCartaIndice(int cartaIndice) {
        this.cartaIndice = cartaIndice;
    }
}