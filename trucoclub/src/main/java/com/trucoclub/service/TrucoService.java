package com.trucoclub.service;

import com.trucoclub.model.Partida;
import com.trucoclub.model.Jugador;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;

@Service
public class TrucoService {
    // Diccionario para manejar varias mesas a la vez
    private Map<String, Partida> partidasActivas = new HashMap<>();

    public String crearNuevaPartida(String nombreJ1, String nombreJ2, int puntosMax) {
        String idPartida = "mesa-" + (partidasActivas.size() + 1);

        // 1. Instanciamos los Jugadores (asumo que tu clase Jugador recibe el nombre)
        Jugador j1 = new Jugador(nombreJ1);
        Jugador j2 = new Jugador(nombreJ2);

        // 2. Usamos tu constructor real: Partida(Jugador j1, Jugador j2, int puntos)
        Partida nuevaPartida = new Partida(j1, j2, puntosMax);

        // 3. Tu método para mezclar, repartir y setear el turno de la mano
        nuevaPartida.empezarRonda();

        partidasActivas.put(idPartida, nuevaPartida);
        return idPartida;
    }

    public Partida obtenerPartida(String id) {
        return partidasActivas.get(id);
    }

    // Método para que el controlador le pase las acciones a tu lógica
    public Partida jugarCarta(String id, String nombreJugador, int indice) {
        Partida p = partidasActivas.get(id);
        if (p != null) {
            // Buscamos cuál de los dos jugadores es el que quiere tirar
            Jugador j = p.getJugador1().getNombre().equals(nombreJugador) ? p.getJugador1() : p.getJugador2();
            p.realizarJugada(j, indice);
        }
        return obtenerPartida(id);
    }
}