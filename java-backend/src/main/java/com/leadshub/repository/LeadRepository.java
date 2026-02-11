package com.leadshub.repository;

import com.leadshub.model.Lead;
import com.leadshub.model.LeadStatus;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.OffsetDateTime;
import java.util.UUID;

@Repository
public interface LeadRepository extends ReactiveCrudRepository<Lead, UUID> {

    /* =====================
       BASIC OWNERSHIP
       ===================== */

    Flux<Lead> findByUserId(UUID userId);

    Mono<Lead> findByIdAndUserId(UUID id, UUID userId);

    Mono<Void> deleteByIdAndUserId(UUID id, UUID userId);

    /* =====================
       FILTERED SEARCH
       ===================== */

    @Query("""
        SELECT *
        FROM public.leads
        WHERE user_id = :userId
          AND (:status IS NULL OR status = :status)
          AND (
                :search IS NULL
                OR name ILIKE '%' || :search || '%'
                OR email ILIKE '%' || :search || '%'
              )
          AND (:dateFrom IS NULL OR created_at >= :dateFrom)
          AND (:dateTo IS NULL OR created_at <= :dateTo)
        ORDER BY created_at DESC
        LIMIT :limit OFFSET :offset
    """)
    Flux<Lead> findAllFiltered(
            UUID userId,
            LeadStatus status,
            String search,
            OffsetDateTime dateFrom,
            OffsetDateTime dateTo,
            int limit,
            long offset
    );

    /* =====================
       COUNT (PAGINATION)
       ===================== */

    @Query("""
        SELECT COUNT(*)
        FROM public.leads
        WHERE user_id = :userId
          AND (:status IS NULL OR status = :status)
          AND (
                :search IS NULL
                OR name ILIKE '%' || :search || '%'
                OR email ILIKE '%' || :search || '%'
              )
          AND (:dateFrom IS NULL OR created_at >= :dateFrom)
          AND (:dateTo IS NULL OR created_at <= :dateTo)
    """)
    Mono<Long> countFiltered(
            UUID userId,
            LeadStatus status,
            String search,
            OffsetDateTime dateFrom,
            OffsetDateTime dateTo
    );
}
