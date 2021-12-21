package com.daslab.datahubble.history.repository;

import com.daslab.datahubble.history.model.History;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HistoryRepository extends JpaRepository<History, Integer> {
    History findByLogId(int logId);
    List<History> findAllByStep(int step);
}