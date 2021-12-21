package com.daslab.datahubble.sourceindex.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.hibernate.annotations.DynamicUpdate;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import javax.persistence.*;
import java.util.Date;

@Entity
@Table(name = "sourceindex")
@EntityListeners(AuditingEntityListener.class)
@JsonIgnoreProperties(value = {"createdAt", "updatedAt"},
        allowGetters = true)
@DynamicUpdate
public class SourceIndex {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int dataset_id;

    private String name;

    private String tablename;;

    public String getTablename() {
        return tablename;
    }

    public void setTablename(String tablename) {
        this.tablename = tablename;
    }

    private String description;

    private String label;

    @Column(nullable = false, updatable = false)
    @Temporal(TemporalType.DATE)
    @CreatedDate
    private Date createdAt;

    @Column(nullable = false)
    @Temporal(TemporalType.DATE)
    @LastModifiedDate
    private Date updatedAt;

    private boolean iscommon;

    private int row_count;

    public int getDataset_id() {
        return dataset_id;
    }

    public void setDataset_id(int dataset_id) {
        this.dataset_id = dataset_id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public Date getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Date updatedAt) {
        this.updatedAt = updatedAt;
    }

    public boolean isIscommon() {
        return iscommon;
    }

    public void setIscommon(boolean iscommon) {
        this.iscommon = iscommon;
    }

    public int getRow_count(int row_count){
        return row_count;
    }

    public void setRow_count(){
        this.row_count = row_count;
    }
}
