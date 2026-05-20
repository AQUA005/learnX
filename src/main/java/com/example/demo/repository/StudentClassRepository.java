package com.example.demo.repository;

import com.example.demo.entity.StudentClass;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface StudentClassRepository extends JpaRepository<StudentClass, Long> {
    Optional<StudentClass> findByBatchAndDepartmentAndSection(String batch, String department, String section);
}
