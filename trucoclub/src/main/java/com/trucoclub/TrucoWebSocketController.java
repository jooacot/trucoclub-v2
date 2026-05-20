package com.trucoclub;

import com.trucoclub.model.MensajeJugada;
import com.trucoclub.model.Partida;
import com.trucoclub.service.TrucoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class TrucoWebSocketController {

    @Autowired
    private TrucoService trucoService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/jugar") // Escucha los mensajes que vienen desde /app/jugar
    public void recibirJugada(MensajeJugada mensaje) {
        // 1. Ejecutamos la lógica de la jugada
        Partida partidaActualizada = trucoService.jugarCarta(
                mensaje.getMesaId(),
                mensaje.getJugador(),
                mensaje.getCartaIndice()
        );

        // 2. Enviamos el resultado a todos los jugadores de esa mesa a través del túnel
        String destination = "/topic/partida/" + mensaje.getMesaId();
        messagingTemplate.convertAndSend(destination, partidaActualizada);
    }
}