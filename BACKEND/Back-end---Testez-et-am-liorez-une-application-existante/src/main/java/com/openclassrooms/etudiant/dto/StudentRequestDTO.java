package com.openclassrooms.etudiant.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

//StudentRequestDTO : ce que l’API reçoit quand on veut créer ou mettre à jour un étudiant

@Data
public class StudentRequestDTO {

    @NotBlank
    private String firstName;

    @NotBlank
    private String lastName;

    private Integer age;
}
