package com.openclassrooms.etudiant.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.openclassrooms.etudiant.dto.StudentRequestDTO;
import com.openclassrooms.etudiant.entities.Student;
import com.openclassrooms.etudiant.repository.StudentRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.utility.DockerImageName;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@Testcontainers(disabledWithoutDocker = true)
public class StudentControllerTest {

    private static final DockerImageName MYSQL_IMAGE = DockerImageName.parse("mysql:8.4");
    private static final String STUDENTS_URL = "/api/students";

    @Container
    static MySQLContainer<?> mySQLContainer = new MySQLContainer<>(MYSQL_IMAGE);

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private MockMvc mockMvc;

    @DynamicPropertySource
    static void configureTestProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", () -> mySQLContainer.getJdbcUrl());
        registry.add("spring.datasource.username", () -> mySQLContainer.getUsername());
        registry.add("spring.datasource.password", () -> mySQLContainer.getPassword());
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "create");
    }

    @AfterEach
    public void afterEach() {
        studentRepository.deleteAll();
    }

    @SuppressWarnings("null")
    @Test
    public void getAllStudentsWithoutAuthenticationShouldReturnUnauthorized() throws Exception {
        // GIVEN: les routes students sont protegees et refusent un appel anonyme.

        // WHEN
        mockMvc.perform(MockMvcRequestBuilders.get(STUDENTS_URL)
                        .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isUnauthorized());
    }

    @SuppressWarnings("null")
    @Test
    @WithMockUser(username = "teacher")
    public void createStudentWithoutRequiredDataShouldReturnBadRequest() throws Exception {
        // GIVEN: un payload incomplet doit etre rejete avant tout acces a la base.
        StudentRequestDTO studentRequestDTO = new StudentRequestDTO();

        // WHEN
        mockMvc.perform(MockMvcRequestBuilders.post(STUDENTS_URL)
                        .content(objectMapper.writeValueAsString(studentRequestDTO))
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isBadRequest());
    }

    @SuppressWarnings("null")
    @Test
    @WithMockUser(username = "teacher")
    public void createStudentSuccessful() throws Exception {
        // GIVEN: une requete valide doit creer un etudiant et retourner ses donnees.
        StudentRequestDTO studentRequestDTO = buildStudentRequestDTO("John", "Doe", 21);

        // WHEN
        mockMvc.perform(MockMvcRequestBuilders.post(STUDENTS_URL)
                        .content(objectMapper.writeValueAsString(studentRequestDTO))
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isCreated())
                .andExpect(MockMvcResultMatchers.jsonPath("$.id").isNumber())
                .andExpect(MockMvcResultMatchers.jsonPath("$.firstName").value("John"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.lastName").value("Doe"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.age").value(21));

        assertThat(studentRepository.findAll()).hasSize(1);
        assertThat(studentRepository.findAll().getFirst().getFirstName()).isEqualTo("John");
    }

    @SuppressWarnings("null")
    @Test
    @WithMockUser(username = "teacher")
    public void getAllStudentsSuccessful() throws Exception {
        // GIVEN: la liste doit refleter les etudiants presents dans la base de test.
        studentRepository.save(buildStudent("John", "Doe", 21));
        studentRepository.save(buildStudent("Jane", "Smith", 24));

        // WHEN
        mockMvc.perform(MockMvcRequestBuilders.get(STUDENTS_URL)
                        .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$", hasSize(2)))
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].firstName").value("John"))
                .andExpect(MockMvcResultMatchers.jsonPath("$[1].firstName").value("Jane"));
    }

    @SuppressWarnings("null")
    @Test
    @WithMockUser(username = "teacher")
    public void getStudentByIdSuccessful() throws Exception {
        // GIVEN: la recherche par identifiant doit renvoyer l'etudiant correspondant.
        Student student = studentRepository.save(buildStudent("John", "Doe", 21));

        // WHEN
        mockMvc.perform(MockMvcRequestBuilders.get(STUDENTS_URL + "/" + student.getId())
                        .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.id").value(student.getId()))
                .andExpect(MockMvcResultMatchers.jsonPath("$.firstName").value("John"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.lastName").value("Doe"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.age").value(21));
    }

    @SuppressWarnings("null")
    @Test
    @WithMockUser(username = "teacher")
    public void getStudentByIdShouldReturnBadRequestWhenStudentDoesNotExist() throws Exception {
        // GIVEN: un identifiant absent doit produire une erreur metier exploitable.

        // WHEN
        mockMvc.perform(MockMvcRequestBuilders.get(STUDENTS_URL + "/999")
                        .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isBadRequest())
                .andExpect(MockMvcResultMatchers.jsonPath("$.message").value("Student not found with id 999"));
    }

    @SuppressWarnings("null")
    @Test
    @WithMockUser(username = "teacher")
    public void updateStudentSuccessful() throws Exception {
        // GIVEN: une mise a jour valide doit modifier la ligne en base et renvoyer les nouvelles donnees.
        Student student = studentRepository.save(buildStudent("Old", "Name", 18));
        StudentRequestDTO studentRequestDTO = buildStudentRequestDTO("New", "Student", 22);

        // WHEN
        mockMvc.perform(MockMvcRequestBuilders.put(STUDENTS_URL + "/" + student.getId())
                        .content(objectMapper.writeValueAsString(studentRequestDTO))
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.id").value(student.getId()))
                .andExpect(MockMvcResultMatchers.jsonPath("$.firstName").value("New"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.lastName").value("Student"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.age").value(22));

        Student updatedStudent = studentRepository.findById(student.getId()).orElseThrow();
        assertThat(updatedStudent.getFirstName()).isEqualTo("New");
        assertThat(updatedStudent.getLastName()).isEqualTo("Student");
        assertThat(updatedStudent.getAge()).isEqualTo(22);
    }

    @SuppressWarnings("null")
    @Test
    @WithMockUser(username = "teacher")
    public void deleteStudentSuccessful() throws Exception {
        // GIVEN: la suppression doit retirer l'etudiant de la base.
        Student student = studentRepository.save(buildStudent("John", "Doe", 21));

        // WHEN
        mockMvc.perform(MockMvcRequestBuilders.delete(STUDENTS_URL + "/" + student.getId())
                        .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isNoContent());

        assertThat(studentRepository.findById(student.getId())).isEmpty();
    }

    private StudentRequestDTO buildStudentRequestDTO(String firstName, String lastName, Integer age) {
        StudentRequestDTO studentRequestDTO = new StudentRequestDTO();
        studentRequestDTO.setFirstName(firstName);
        studentRequestDTO.setLastName(lastName);
        studentRequestDTO.setAge(age);
        return studentRequestDTO;
    }

    private Student buildStudent(String firstName, String lastName, Integer age) {
        Student student = new Student();
        student.setFirstName(firstName);
        student.setLastName(lastName);
        student.setAge(age);
        return student;
    }
}
