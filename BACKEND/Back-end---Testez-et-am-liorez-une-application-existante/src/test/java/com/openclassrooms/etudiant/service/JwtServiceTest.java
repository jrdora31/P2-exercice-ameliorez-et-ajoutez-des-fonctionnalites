package com.openclassrooms.etudiant.service;

import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import static org.assertj.core.api.Assertions.assertThat;

class JwtServiceTest {

    private final JwtService jwtService = new JwtService();

    @Test
    void extractUsername_shouldReturnUsernameFromGeneratedToken() {
        // GIVEN: un token genere doit contenir le login de l'utilisateur.
        UserDetails userDetails = buildUser("john.doe");

        // WHEN
        String token = jwtService.generateToken(userDetails);
        String username = jwtService.extractUsername(token);

        // THEN
        assertThat(token).isNotBlank();
        assertThat(username).isEqualTo("john.doe");
    }

    @Test
    void isTokenValid_shouldReturnTrueForMatchingUser() {
        // GIVEN: un token fraichement genere doit etre valide pour son proprietaire.
        UserDetails userDetails = buildUser("john.doe");
        String token = jwtService.generateToken(userDetails);

        // WHEN
        boolean result = jwtService.isTokenValid(token, userDetails);

        // THEN
        assertThat(result).isTrue();
    }

    @Test
    void isTokenValid_shouldReturnFalseForAnotherUser() {
        // GIVEN: un token ne doit pas etre valide pour un autre utilisateur.
        UserDetails tokenOwner = buildUser("john.doe");
        UserDetails anotherUser = buildUser("jane.doe");
        String token = jwtService.generateToken(tokenOwner);

        // WHEN
        boolean result = jwtService.isTokenValid(token, anotherUser);

        // THEN
        assertThat(result).isFalse();
    }

    private UserDetails buildUser(String username) {
        return User.builder()
                .username(username)
                .password("password")
                .authorities("ROLE_USER")
                .build();
    }
}
