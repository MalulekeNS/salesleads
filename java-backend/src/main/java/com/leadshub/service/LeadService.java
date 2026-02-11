package com.leadshub.service;

import com.leadshub.dto.LeadRequest;
import com.leadshub.dto.LeadsResponse;
import com.leadshub.model.Lead;
import com.leadshub.repository.LeadRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

@Service
public class LeadService {

    private final LeadRepository leadRepository;

    public LeadService(LeadRepository leadRepository) {
        this.leadRepository = leadRepository;
    }

    public Mono<LeadsResponse> getLeads(
            UUID userId,
            String status,
            String search,
            OffsetDateTime dateFrom,
            OffsetDateTime dateTo,
            int page,
            int pageSize
    ) {
        int safePage = Math.max(page, 1);
        long offset = (long) (safePage - 1) * pageSize;

        return leadRepository.countFiltered(userId, status, search, dateFrom, dateTo)
                .flatMap(totalCount ->
                        leadRepository
                                .findAllFiltered(
                                        userId,
                                        status,
                                        search,
                                        dateFrom,
                                        dateTo,
                                        pageSize,
                                        offset
                                )
                                .collectList()
                                .map(leads ->
                                        LeadsResponse.builder()
                                                .data(leads)
                                                .pagination(Map.of(
                                                        "page", safePage,
                                                        "page_size", pageSize,
                                                        "total_count", totalCount,
                                                        "total_pages",
                                                        (int) Math.ceil((double) totalCount / pageSize)
                                                ))
                                                .build()
                                )
                );
    }

    public Mono<Lead> getLeadById(UUID id, UUID userId) {
        return leadRepository
                .findByIdAndUserId(id, userId)
                .switchIfEmpty(Mono.error(
                        new ResponseStatusException(HttpStatus.NOT_FOUND, "Lead not found")
                ));
    }

    public Mono<Lead> createLead(UUID userId, LeadRequest request) {
        OffsetDateTime now = OffsetDateTime.now();

        Lead lead = Lead.builder()
                .userId(userId)
                .name(request.getName())
                .email(request.getEmail())
                .status(request.getStatus() != null ? request.getStatus() : "New")
                .company(request.getCompany())
                .phone(request.getPhone())
                .notes(request.getNotes())
                .createdAt(now)
                .updatedAt(now)
                .build();

        return leadRepository.save(lead);
    }

    public Mono<Lead> updateLead(UUID id, UUID userId, LeadRequest request) {
        return leadRepository
                .findByIdAndUserId(id, userId)
                .switchIfEmpty(Mono.error(
                        new ResponseStatusException(HttpStatus.NOT_FOUND, "Lead not found")
                ))
                .flatMap(existing -> {
                    if (request.getName() != null) existing.setName(request.getName());
                    if (request.getEmail() != null) existing.setEmail(request.getEmail());
                    if (request.getStatus() != null) existing.setStatus(request.getStatus());
                    if (request.getCompany() != null) existing.setCompany(request.getCompany());
                    if (request.getPhone() != null) existing.setPhone(request.getPhone());
                    if (request.getNotes() != null) existing.setNotes(request.getNotes());
                    existing.setUpdatedAt(OffsetDateTime.now());
                    return leadRepository.save(existing);
                });
    }

    public Mono<Void> deleteLead(UUID id, UUID userId) {
        return leadRepository
                .deleteByIdAndUserId(id, userId)
                .switchIfEmpty(Mono.error(
                        new ResponseStatusException(HttpStatus.NOT_FOUND, "Lead not found")
                ));
    }
}
