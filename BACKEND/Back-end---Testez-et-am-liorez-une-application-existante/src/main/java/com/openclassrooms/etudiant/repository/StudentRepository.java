package com.openclassrooms.etudiant.repository;

import com.openclassrooms.etudiant.entities.Student;
import org.springframework.data.jpa.repository.JpaRepository;


// But
//Ce repository servira à :

//enregistrer un étudiant
//récupérer tous les étudiants
//récupérer un étudiant par id
//modifier un étudiant
//supprimer un étudiant

public interface StudentRepository extends JpaRepository<Student, Long> {
}
