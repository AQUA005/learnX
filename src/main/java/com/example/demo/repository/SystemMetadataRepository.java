package com.example.demo.repository;

import com.example.demo.entity.SystemMetadata;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SystemMetadataRepository extends JpaRepository<SystemMetadata, Long> {
    List<SystemMetadata> findByType(String type);
}
