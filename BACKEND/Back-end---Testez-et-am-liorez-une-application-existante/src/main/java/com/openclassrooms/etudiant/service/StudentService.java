package com.openclassrooms.etudiant.service;

import com.openclassrooms.etudiant.dto.StudentRequestDTO;
import com.openclassrooms.etudiant.dto.StudentResponseDTO;
import com.openclassrooms.etudiant.entities.Student;
import com.openclassrooms.etudiant.mapper.StudentDtoMapper;
import com.openclassrooms.etudiant.repository.StudentRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final StudentDtoMapper studentDtoMapper;

    public StudentResponseDTO createStudent(StudentRequestDTO studentRequestDTO) {
        Student student = studentDtoMapper.toEntity(studentRequestDTO);
        Student savedStudent = studentRepository.save(student);
        return studentDtoMapper.toDto(savedStudent);
    }

    public List<StudentResponseDTO> getAllStudents() {
        return studentRepository.findAll()
                .stream()
                .map(studentDtoMapper::toDto)
                .toList();
    }

    public StudentResponseDTO getStudentById(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Student not found with id " + id));

        return studentDtoMapper.toDto(student);
    }

    public StudentResponseDTO updateStudent(Long id, StudentRequestDTO studentRequestDTO) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Student not found with id " + id));

        student.setFirstName(studentRequestDTO.getFirstName());
        student.setLastName(studentRequestDTO.getLastName());
        student.setAge(studentRequestDTO.getAge());

        Student updatedStudent = studentRepository.save(student);
        return studentDtoMapper.toDto(updatedStudent);
    }

    public void deleteStudent(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Student not found with id " + id));

        studentRepository.delete(student);
    }
}
