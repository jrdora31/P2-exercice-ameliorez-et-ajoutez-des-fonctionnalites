package com.openclassrooms.etudiant.service;

import com.openclassrooms.etudiant.dto.StudentRequestDTO;
import com.openclassrooms.etudiant.dto.StudentResponseDTO;
import com.openclassrooms.etudiant.entities.Student;
import com.openclassrooms.etudiant.mapper.StudentDtoMapper;
import com.openclassrooms.etudiant.repository.StudentRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StudentServiceTest {

    private static final Long STUDENT_ID = 1L;
    private static final String FIRST_NAME = "John";
    private static final String LAST_NAME = "Doe";
    private static final Integer AGE = 21;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private StudentDtoMapper studentDtoMapper;

    @InjectMocks
    private StudentService studentService;

    @Test
    void createStudent_shouldMapSaveAndReturnResponseDto() {
        // GIVEN: le DTO entrant doit etre converti, persiste puis reconverti en DTO de sortie.
        StudentRequestDTO requestDTO = buildStudentRequestDto(FIRST_NAME, LAST_NAME, AGE);
        Student studentToSave = buildStudent(null, FIRST_NAME, LAST_NAME, AGE);
        Student savedStudent = buildStudent(STUDENT_ID, FIRST_NAME, LAST_NAME, AGE);
        StudentResponseDTO expectedResponse = buildStudentResponseDto(STUDENT_ID, FIRST_NAME, LAST_NAME, AGE);

        when(studentDtoMapper.toEntity(requestDTO)).thenReturn(studentToSave);
        when(studentRepository.save(studentToSave)).thenReturn(savedStudent);
        when(studentDtoMapper.toDto(savedStudent)).thenReturn(expectedResponse);

        // WHEN
        StudentResponseDTO result = studentService.createStudent(requestDTO);

        // THEN
        assertThat(result).isEqualTo(expectedResponse);
        verify(studentDtoMapper).toEntity(requestDTO);
        verify(studentRepository).save(studentToSave);
        verify(studentDtoMapper).toDto(savedStudent);
    }

    @Test
    void getAllStudents_shouldReturnMappedStudents() {
        // GIVEN: la liste des entites trouvees doit etre transformee en DTO de reponse.
        Student firstStudent = buildStudent(1L, "John", "Doe", 21);
        Student secondStudent = buildStudent(2L, "Jane", "Smith", 24);
        StudentResponseDTO firstResponse = buildStudentResponseDto(1L, "John", "Doe", 21);
        StudentResponseDTO secondResponse = buildStudentResponseDto(2L, "Jane", "Smith", 24);

        when(studentRepository.findAll()).thenReturn(List.of(firstStudent, secondStudent));
        when(studentDtoMapper.toDto(firstStudent)).thenReturn(firstResponse);
        when(studentDtoMapper.toDto(secondStudent)).thenReturn(secondResponse);

        // WHEN
        List<StudentResponseDTO> result = studentService.getAllStudents();

        // THEN
        assertThat(result).containsExactly(firstResponse, secondResponse);
    }

    @Test
    void getStudentById_shouldReturnMappedStudentWhenStudentExists() {
        // GIVEN: un etudiant existant doit etre retrouve puis mappe.
        Student student = buildStudent(STUDENT_ID, FIRST_NAME, LAST_NAME, AGE);
        StudentResponseDTO expectedResponse = buildStudentResponseDto(STUDENT_ID, FIRST_NAME, LAST_NAME, AGE);

        when(studentRepository.findById(STUDENT_ID)).thenReturn(Optional.of(student));
        when(studentDtoMapper.toDto(student)).thenReturn(expectedResponse);

        // WHEN
        StudentResponseDTO result = studentService.getStudentById(STUDENT_ID);

        // THEN
        assertThat(result).isEqualTo(expectedResponse);
    }

    @Test
    void getStudentById_shouldThrowExceptionWhenStudentDoesNotExist() {
        // GIVEN: un identifiant inconnu doit remonter une erreur metier claire.
        when(studentRepository.findById(STUDENT_ID)).thenReturn(Optional.empty());

        // WHEN / THEN
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> studentService.getStudentById(STUDENT_ID)
        );
        assertThat(exception.getMessage()).isEqualTo("Student not found with id 1");
    }

    @Test
    void updateStudent_shouldModifyExistingStudentAndReturnResponseDto() {
        // GIVEN: les nouvelles donnees doivent etre appliquees a l'etudiant existant avant sauvegarde.
        Student existingStudent = buildStudent(STUDENT_ID, "Old", "Name", 18);
        StudentRequestDTO requestDTO = buildStudentRequestDto("New", "Student", 22);
        StudentResponseDTO expectedResponse = buildStudentResponseDto(STUDENT_ID, "New", "Student", 22);

        when(studentRepository.findById(STUDENT_ID)).thenReturn(Optional.of(existingStudent));
        when(studentRepository.save(existingStudent)).thenReturn(existingStudent);
        when(studentDtoMapper.toDto(existingStudent)).thenReturn(expectedResponse);

        // WHEN
        StudentResponseDTO result = studentService.updateStudent(STUDENT_ID, requestDTO);

        // THEN
        ArgumentCaptor<Student> studentCaptor = ArgumentCaptor.forClass(Student.class);
        verify(studentRepository).save(studentCaptor.capture());
        assertThat(studentCaptor.getValue().getFirstName()).isEqualTo("New");
        assertThat(studentCaptor.getValue().getLastName()).isEqualTo("Student");
        assertThat(studentCaptor.getValue().getAge()).isEqualTo(22);
        assertThat(result).isEqualTo(expectedResponse);
    }

    @Test
    void updateStudent_shouldThrowExceptionWhenStudentDoesNotExist() {
        // GIVEN: la mise a jour d'un etudiant absent doit echouer.
        StudentRequestDTO requestDTO = buildStudentRequestDto(FIRST_NAME, LAST_NAME, AGE);
        when(studentRepository.findById(STUDENT_ID)).thenReturn(Optional.empty());

        // WHEN / THEN
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> studentService.updateStudent(STUDENT_ID, requestDTO)
        );
        assertThat(exception.getMessage()).isEqualTo("Student not found with id 1");
    }

    @Test
    void deleteStudent_shouldDeleteExistingStudent() {
        // GIVEN: la suppression doit deleguer au repository quand l'etudiant existe.
        Student student = buildStudent(STUDENT_ID, FIRST_NAME, LAST_NAME, AGE);
        when(studentRepository.findById(STUDENT_ID)).thenReturn(Optional.of(student));

        // WHEN
        studentService.deleteStudent(STUDENT_ID);

        // THEN
        verify(studentRepository).delete(student);
    }

    @Test
    void deleteStudent_shouldThrowExceptionWhenStudentDoesNotExist() {
        // GIVEN: la suppression d'un etudiant absent doit remonter une erreur.
        when(studentRepository.findById(STUDENT_ID)).thenReturn(Optional.empty());

        // WHEN / THEN
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> studentService.deleteStudent(STUDENT_ID)
        );
        assertThat(exception.getMessage()).isEqualTo("Student not found with id 1");
    }

    private StudentRequestDTO buildStudentRequestDto(String firstName, String lastName, Integer age) {
        StudentRequestDTO requestDTO = new StudentRequestDTO();
        requestDTO.setFirstName(firstName);
        requestDTO.setLastName(lastName);
        requestDTO.setAge(age);
        return requestDTO;
    }

    private StudentResponseDTO buildStudentResponseDto(Long id, String firstName, String lastName, Integer age) {
        StudentResponseDTO responseDTO = new StudentResponseDTO();
        responseDTO.setId(id);
        responseDTO.setFirstName(firstName);
        responseDTO.setLastName(lastName);
        responseDTO.setAge(age);
        return responseDTO;
    }

    private Student buildStudent(Long id, String firstName, String lastName, Integer age) {
        Student student = new Student();
        student.setId(id);
        student.setFirstName(firstName);
        student.setLastName(lastName);
        student.setAge(age);
        return student;
    }
}
