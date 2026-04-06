package com.openclassrooms.etudiant.mapper;

import com.openclassrooms.etudiant.dto.StudentRequestDTO;
import com.openclassrooms.etudiant.dto.StudentResponseDTO;
import com.openclassrooms.etudiant.entities.Student;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

//convertir StudentRequestDTO -> Student
//convertir Student -> StudentResponseDTO

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.ERROR
)
public interface StudentDtoMapper {

    @Mapping(target = "id", ignore = true)
    Student toEntity(StudentRequestDTO studentRequestDTO);

    StudentResponseDTO toDto(Student student);
}
