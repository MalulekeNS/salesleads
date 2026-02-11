package com.leadshub.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("leads")
public class Lead {

    @Id
    private UUID id;

    @Column("user_id")
    private UUID userId;

    @Column("lead_number")
    private Integer leadNumber;

    @Column("display_id")
    private String displayId;

    private String name;
    private String email;

    /**
     * Maps to PostgreSQL enum: lead_status
     */
    private LeadStatus status;

    private String company;
    private String phone;
    private String notes;

    @Column("created_at")
    private OffsetDateTime createdAt;

    @Column("updated_at")
    private OffsetDateTime updatedAt;
}
