package com.example.demo.config;

import com.example.demo.entity.*;
import com.example.demo.entity.User.Role;
import com.example.demo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ScheduleItemRepository scheduleItemRepository;
    private final ClassTestRepository classTestRepository;
    private final GradeBookRepository gradeBookRepository;
    private final ResourceRepository resourceRepository;
    private final ExamRepository examRepository;
    private final ExamQuestionRepository examQuestionRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.example.demo.repository.SystemMetadataRepository systemMetadataRepository;
    private final StudentClassRepository studentClassRepository;

    @Override
    public void run(String... args) throws Exception {
        if (systemMetadataRepository.count() == 0) {
            systemMetadataRepository.saveAll(List.of(
                SystemMetadata.builder().type("DEPARTMENT").value("CSE - Computer Science & Engineering").build(),
                SystemMetadata.builder().type("DEPARTMENT").value("SWE - Software Engineering").build(),
                SystemMetadata.builder().type("DEPARTMENT").value("EEE - Electrical & Electronic Engineering").build(),
                SystemMetadata.builder().type("DEPARTMENT").value("ME - Mechanical Engineering").build(),

                SystemMetadata.builder().type("SEMESTER").value("1st Year 1st Semester").build(),
                SystemMetadata.builder().type("SEMESTER").value("1st Year 2nd Semester").build(),
                SystemMetadata.builder().type("SEMESTER").value("2nd Year 1st Semester").build(),
                SystemMetadata.builder().type("SEMESTER").value("2nd Year 2nd Semester").build(),
                SystemMetadata.builder().type("SEMESTER").value("3rd Year 1st Semester").build(),
                SystemMetadata.builder().type("SEMESTER").value("3rd Year 2nd Semester").build(),
                SystemMetadata.builder().type("SEMESTER").value("4th Year 1st Semester").build(),
                SystemMetadata.builder().type("SEMESTER").value("4th Year 2nd Semester").build(),

                SystemMetadata.builder().type("DESIGNATION").value("Lecturer").build(),
                SystemMetadata.builder().type("DESIGNATION").value("Assistant Professor").build(),
                SystemMetadata.builder().type("DESIGNATION").value("Associate Professor").build(),
                SystemMetadata.builder().type("DESIGNATION").value("Professor").build()
            ));
            for (int i = 1; i <= 99; i++) {
                systemMetadataRepository.save(SystemMetadata.builder().type("BATCH").value(String.valueOf(i)).build());
            }
        }

        if (userRepository.count() > 0) {
            return; // Already seeded
        }

        System.out.println("Seeding database with USTC LearnX demo data...");

        // Seed Class Grouping
        StudentClass classA = StudentClass.builder()
                .batch("20")
                .department("CSE - Computer Science & Engineering")
                .section("A")
                .build();
        studentClassRepository.save(classA);

        // 1. Seed Users
        User admin = User.builder()
                .username("admin")
                .password(passwordEncoder.encode("password"))
                .fullName("System Admin")
                .email("admin@ustc.edu")
                .role(Role.ADMIN)
                .approved(true)
                .build();

        User teacher = User.builder()
                .username("teacher1")
                .password(passwordEncoder.encode("password"))
                .fullName("Dr. Mahfuzur Rahman")
                .email("mahfuz@ustc.edu")
                .role(Role.TEACHER)
                .approved(true)
                .designation("Assistant Professor")
                .build();

        User cr = User.builder()
                .username("cr1")
                .password(passwordEncoder.encode("password"))
                .fullName("Tanvir Ahmed (CR)")
                .email("tanvir.cr@ustc.edu")
                .role(Role.CR)
                .approved(true)
                .batch("20")
                .department("CSE - Computer Science & Engineering")
                .section("A")
                .semester("3rd Year 1st Semester")
                .studentClass(classA)
                .build();

        User student1 = User.builder()
                .username("student1")
                .password(passwordEncoder.encode("password"))
                .fullName("Nafis Sadik")
                .email("nafis@ustc.edu")
                .role(Role.STUDENT)
                .approved(true)
                .batch("20")
                .department("CSE - Computer Science & Engineering")
                .section("A")
                .semester("3rd Year 1st Semester")
                .studentClass(classA)
                .build();

        User student2 = User.builder()
                .username("student2")
                .password(passwordEncoder.encode("password"))
                .fullName("Sultana Razia")
                .email("razia@ustc.edu")
                .role(Role.STUDENT)
                .approved(true)
                .batch("20")
                .department("CSE - Computer Science & Engineering")
                .section("A")
                .semester("3rd Year 1st Semester")
                .studentClass(classA)
                .build();

        User student3 = User.builder()
                .username("student3")
                .password(passwordEncoder.encode("password"))
                .fullName("Abid Hasan")
                .email("abid@ustc.edu")
                .role(Role.STUDENT)
                .approved(true)
                .batch("20")
                .department("CSE - Computer Science & Engineering")
                .section("A")
                .semester("3rd Year 1st Semester")
                .studentClass(classA)
                .build();

        User student4 = User.builder()
                .username("student4")
                .password(passwordEncoder.encode("password"))
                .fullName("Mehnaz Chowdhury")
                .email("mehnaz@ustc.edu")
                .role(Role.STUDENT)
                .approved(true)
                .batch("20")
                .department("CSE - Computer Science & Engineering")
                .section("A")
                .semester("3rd Year 1st Semester")
                .studentClass(classA)
                .build();

        userRepository.saveAll(List.of(admin, teacher, cr, student1, student2, student3, student4));

        // 2. Seed Weekly Schedule Items (Routines)
        scheduleItemRepository.saveAll(List.of(
                // Monday
                ScheduleItem.builder().dayOfWeek("MONDAY").startTime(LocalTime.of(8, 30)).endTime(LocalTime.of(9, 45))
                        .courseName("CSE 3101 - Database Systems").teacherName("Dr. Mahfuzur Rahman").roomNo("302").studentClass(classA).build(),
                ScheduleItem.builder().dayOfWeek("MONDAY").startTime(LocalTime.of(10, 0)).endTime(LocalTime.of(11, 15))
                        .courseName("CSE 3103 - Software Engineering").teacherName("Prof. Alice Smith").roomNo("303").studentClass(classA).build(),
                ScheduleItem.builder().dayOfWeek("MONDAY").startTime(LocalTime.of(11, 30)).endTime(LocalTime.of(12, 45))
                        .courseName("CSE 3105 - Compiler Design").teacherName("Dr. Bob Johnson").roomNo("304").studentClass(classA).build(),
                // Tuesday
                ScheduleItem.builder().dayOfWeek("TUESDAY").startTime(LocalTime.of(8, 30)).endTime(LocalTime.of(9, 45))
                        .courseName("CSE 3107 - Computer Networks").teacherName("Dr. Charles Lee").roomNo("305").studentClass(classA).build(),
                ScheduleItem.builder().dayOfWeek("TUESDAY").startTime(LocalTime.of(10, 0)).endTime(LocalTime.of(11, 15))
                        .courseName("CSE 3101 - Database Systems").teacherName("Dr. Mahfuzur Rahman").roomNo("302").studentClass(classA).build(),
                // Wednesday
                ScheduleItem.builder().dayOfWeek("WEDNESDAY").startTime(LocalTime.of(10, 0)).endTime(LocalTime.of(11, 15))
                        .courseName("CSE 3103 - Software Engineering").teacherName("Prof. Alice Smith").roomNo("303").studentClass(classA).build(),
                ScheduleItem.builder().dayOfWeek("WEDNESDAY").startTime(LocalTime.of(13, 0)).endTime(LocalTime.of(14, 15))
                        .courseName("CSE 3105 - Compiler Design").teacherName("Dr. Bob Johnson").roomNo("304").studentClass(classA).build(),
                // Thursday
                ScheduleItem.builder().dayOfWeek("THURSDAY").startTime(LocalTime.of(8, 30)).endTime(LocalTime.of(9, 45))
                        .courseName("CSE 3107 - Computer Networks").teacherName("Dr. Charles Lee").roomNo("305").studentClass(classA).build(),
                ScheduleItem.builder().dayOfWeek("THURSDAY").startTime(LocalTime.of(11, 30)).endTime(LocalTime.of(12, 45))
                        .courseName("HUM 3109 - Technical Writing").teacherName("Ms. Grace Hopper").roomNo("101").studentClass(classA).build()
        ));

        // 3. Seed Class Tests (CTs) / Exam Countdown
        classTestRepository.saveAll(List.of(
                ClassTest.builder().courseName("CSE 3101 - Database Systems")
                        .dateTime(LocalDateTime.now().plusDays(2).withHour(10).withMinute(0).withSecond(0))
                        .durationMinutes(45).roomNo("302").topic("SQL Queries, Normalization").createdBy("cr1").studentClass(classA).build(),
                ClassTest.builder().courseName("CSE 3105 - Compiler Design")
                        .dateTime(LocalDateTime.now().plusDays(6).withHour(14).withMinute(0).withSecond(0))
                        .durationMinutes(50).roomNo("304").topic("Lexical & Syntax Analysis").createdBy("teacher1").studentClass(classA).build(),
                ClassTest.builder().courseName("CSE 3103 - Software Engineering")
                        .dateTime(LocalDateTime.now().plusDays(9).withHour(9).withMinute(0).withSecond(0))
                        .durationMinutes(60).roomNo("303").topic("Design Patterns, Solid Principles").createdBy("cr1").studentClass(classA).build()
        ));

        // 4. Seed Performance Dashboard (Grades)
        // CSE 3101 - CT 1
        gradeBookRepository.save(GradeBook.builder().student(student1).courseName("CSE 3101 - Database Systems").assessmentName("CT 1").marksObtained(16.0).maxMarks(20.0).build());
        gradeBookRepository.save(GradeBook.builder().student(student2).courseName("CSE 3101 - Database Systems").assessmentName("CT 1").marksObtained(14.0).maxMarks(20.0).build());
        gradeBookRepository.save(GradeBook.builder().student(student3).courseName("CSE 3101 - Database Systems").assessmentName("CT 1").marksObtained(18.5).maxMarks(20.0).build());
        gradeBookRepository.save(GradeBook.builder().student(student4).courseName("CSE 3101 - Database Systems").assessmentName("CT 1").marksObtained(11.0).maxMarks(20.0).build());

        // CSE 3101 - Midterm
        gradeBookRepository.save(GradeBook.builder().student(student1).courseName("CSE 3101 - Database Systems").assessmentName("Midterm").marksObtained(24.0).maxMarks(30.0).build());
        gradeBookRepository.save(GradeBook.builder().student(student2).courseName("CSE 3101 - Database Systems").assessmentName("Midterm").marksObtained(27.5).maxMarks(30.0).build());
        gradeBookRepository.save(GradeBook.builder().student(student3).courseName("CSE 3101 - Database Systems").assessmentName("Midterm").marksObtained(20.0).maxMarks(30.0).build());
        gradeBookRepository.save(GradeBook.builder().student(student4).courseName("CSE 3101 - Database Systems").assessmentName("Midterm").marksObtained(29.0).maxMarks(30.0).build());

        // CSE 3105 - CT 1
        gradeBookRepository.save(GradeBook.builder().student(student1).courseName("CSE 3105 - Compiler Design").assessmentName("CT 1").marksObtained(15.0).maxMarks(20.0).build());
        gradeBookRepository.save(GradeBook.builder().student(student2).courseName("CSE 3105 - Compiler Design").assessmentName("CT 1").marksObtained(19.0).maxMarks(20.0).build());
        gradeBookRepository.save(GradeBook.builder().student(student3).courseName("CSE 3105 - Compiler Design").assessmentName("CT 1").marksObtained(12.0).maxMarks(20.0).build());
        gradeBookRepository.save(GradeBook.builder().student(student4).courseName("CSE 3105 - Compiler Design").assessmentName("CT 1").marksObtained(16.5).maxMarks(20.0).build());

        // 5. Seed Resources (Course notes)
        resourceRepository.saveAll(List.of(
                Resource.builder()
                        .title("Lecture Note on B-Trees & Indexing")
                        .courseName("CSE 3101 - Database Systems")
                        .fileName("B_Trees_Lecture_Notes.pdf")
                        .contentType("application/pdf")
                        .fileData("Dummy PDF content".getBytes())
                        .uploadedBy(teacher)
                        .approved(true)
                        .examTags("CT1,Midterm")
                        .studentClass(classA)
                        .build(),
                Resource.builder()
                        .title("DFAs & NFAs Simplified Slides")
                        .courseName("CSE 3105 - Compiler Design")
                        .fileName("Compiler_Lexical_Analysis.pdf")
                        .contentType("application/pdf")
                        .fileData("Dummy Compiler notes".getBytes())
                        .uploadedBy(cr)
                        .approved(true)
                        .examTags("CT1")
                        .studentClass(classA)
                        .build(),
                Resource.builder()
                        .title("Design Patterns Cheatsheet")
                        .courseName("CSE 3103 - Software Engineering")
                        .fileName("Gang_of_Four_Cheatsheet.pdf")
                        .contentType("application/pdf")
                        .fileData("Dummy Design Pattern Cheatsheet".getBytes())
                        .uploadedBy(student1)
                        .approved(false) // UNAPPROVED, needs CR or Teacher approval
                        .examTags("Final")
                        .studentClass(classA)
                        .build()
        ));

        // 6. Seed Google-Form style Quiz
        Exam quiz = Exam.builder()
                .title("SQL Basics Assessment")
                .description("Please complete this quiz to test your SQL DDL & DML query knowledge.")
                .teacher(teacher)
                .durationMinutes(15)
                .startTime(LocalDateTime.now().minusHours(1)) // Already open
                .endTime(LocalDateTime.now().plusDays(3))
                .published(true)
                .studentClass(classA)
                .build();
        examRepository.save(quiz);

        examQuestionRepository.saveAll(List.of(
                ExamQuestion.builder()
                        .exam(quiz)
                        .questionText("Which of the following is a DDL command in SQL?")
                        .questionType(ExamQuestion.QuestionType.MCQ)
                        .options("SELECT;UPDATE;CREATE;INSERT")
                        .correctAnswer("CREATE")
                        .points(5)
                        .build(),
                ExamQuestion.builder()
                        .exam(quiz)
                        .questionText("Which clause is used to filter records aggregated by a GROUP BY clause?")
                        .questionType(ExamQuestion.QuestionType.MCQ)
                        .options("WHERE;HAVING;ORDER BY;DISTINCT")
                        .correctAnswer("HAVING")
                        .points(5)
                        .build(),
                ExamQuestion.builder()
                        .exam(quiz)
                        .questionText("Write the SQL command used to remove all records from a table without deleting the table structure (write in capital letters, e.g. TRUNCATE).")
                        .questionType(ExamQuestion.QuestionType.SHORT_ANSWER)
                        .correctAnswer("TRUNCATE")
                        .points(5)
                        .build()
        ));

        System.out.println("Data seeding completed successfully!");
    }
}
