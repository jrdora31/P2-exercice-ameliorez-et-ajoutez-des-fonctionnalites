package com.openclassrooms.etudiant.dto;

import lombok.Data;

//StudentResponseDTO : ce que l’API renvoie quand on demande les infos d’un étudiant

@Data
public class StudentResponseDTO {

    private Long id;
    private String firstName;
    private String lastName;
    private Integer age;
}
