package com.trucoclub.controller;

import com.trucoclub.dto.RegistroRequest;
import com.trucoclub.service.UsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") // Permite que React se conecte sin problemas de CORS
public class AuthController {

    private final UsuarioService usuarioService;

    public AuthController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping("/register")
    public ResponseEntity registrarUsuario(@RequestBody RegistroRequest request) {
        String resultado = usuarioService.registrar(
                request.getUsername(),
                request.getEmail(),
                request.getPassword()
        );

        if (resultado.equals("OK")) {
            return ResponseEntity.ok("Usuario registrado con éxito");
        } else {
            return ResponseEntity.badRequest().body(resultado);
        }
    }
}