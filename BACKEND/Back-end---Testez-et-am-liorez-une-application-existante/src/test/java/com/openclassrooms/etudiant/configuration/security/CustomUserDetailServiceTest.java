package com.openclassrooms.etudiant.configuration.security;

import com.openclassrooms.etudiant.entities.User;
import com.openclassrooms.etudiant.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CustomUserDetailServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CustomUserDetailService customUserDetailService;

    @Test
    void loadUserByUsername_shouldReturnUserWhenLoginExists() {
        // GIVEN: un utilisateur connu doit etre renvoye tel quel par le service de securite.
        User user = buildUser("ada");
        when(userRepository.findByLogin("ada")).thenReturn(Optional.of(user));

        // WHEN
        User result = (User) customUserDetailService.loadUserByUsername("ada");

        // THEN
        assertThat(result).isEqualTo(user);
        assertThat(result.getUsername()).isEqualTo("ada");
    }

    @Test
    void loadUserByUsername_shouldThrowWhenLoginDoesNotExist() {
        // GIVEN: un login inconnu doit remonter l'exception Spring Security attendue.
        when(userRepository.findByLogin("unknown")).thenReturn(Optional.empty());

        // WHEN / THEN
        UsernameNotFoundException exception = assertThrows(
                UsernameNotFoundException.class,
                () -> customUserDetailService.loadUserByUsername("unknown")
        );
        assertThat(exception.getMessage()).isEqualTo("User Not Found with username: unknown");
    }

    private User buildUser(String login) {
        User user = new User();
        user.setId(1L);
        user.setFirstName("Ada");
        user.setLastName("Lovelace");
        user.setLogin(login);
        user.setPassword("password");
        return user;
    }
}
