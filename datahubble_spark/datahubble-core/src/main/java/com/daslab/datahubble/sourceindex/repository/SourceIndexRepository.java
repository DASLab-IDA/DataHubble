package com.daslab.datahubble.sourceindex.repository;

import com.daslab.datahubble.sourceindex.model.SourceIndex;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SourceIndexRepository extends JpaRepository<SourceIndex, Integer> {
    List<SourceIndex> findAllByOrderByIscommonDescUpdatedAtDesc();
    List<SourceIndex> findAllByLabel(String label);
    SourceIndex findByTablename(String tablename);
    SourceIndex findByName(String name);
}
