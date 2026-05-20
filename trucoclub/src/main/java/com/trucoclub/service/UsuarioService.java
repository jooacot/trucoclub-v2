package com.trucoclub.service;

import com.trucoclub.entity.Usuario;
import com.trucoclub.repository.UsuarioRepository;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.stereotype.Service;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;

    // Inyección por constructor (la forma limpia de Spring)
    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public String registrar(String username, String email, String passwordRaw) {
        // 1. Validar si ya existe el nombre de usuario o email
        if (usuarioRepository.existsByUsername(username)) {
            return "El nombre de usuario ya está en uso";
        }
        if (usuarioRepository.existsByEmail(email)) {
            return "El email ya está registrado";
        }

        // 2. Encriptar la contraseña (¡nunca guardar en texto plano!)
        String passwordEncriptada = BCrypt.hashpw(passwordRaw, BCrypt.gensalt());

        // 3. Crear y guardar la entidad
        Usuario nuevoUsuario = new Usuario();
        nuevoUsuario.setUsername(username);
        nuevoUsuario.setEmail(email);
        nuevoUsuario.setPassword(passwordEncriptada);

        usuarioRepository.save(nuevoUsuario);
        return "OK";
    }
}
