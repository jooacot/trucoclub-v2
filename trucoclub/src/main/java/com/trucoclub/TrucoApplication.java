package com.trucoclub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class TrucoApplication {
    public static void main(String[] args) {
        SpringApplication.run(TrucoApplication.class, args);
        System.out.println("🚀 ¡Truco Club Backend Online en el puerto 8080!");
    }
}