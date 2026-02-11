package com.leadshub.controller;

import com.leadshub.dto.LeadRequest;
import com.leadshub.dto.LeadsResponse;
import com.leadshub.model.Lead;
import com.leadshub.service.LeadService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

import java.time.OffsetDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/leads")
public class LeadController {

    private final LeadService leadService;

    public LeadController(LeadService leadService) {
        this.leadService = leadService;
    }

    private UUID getUserId(Authentication auth) {
        try {
            return UUID.fromString(auth.getPrincipal().toString());
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid authentication principal");
        }
    }

    @GetMapping
    public Mono<LeadsResponse> getLeads(
            Authentication auth,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String date_from,
            @RequestParam(required = false) String date_to,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int page_size
    ) {
        OffsetDateTime dateFrom = null;
        OffsetDateTime dateTo = null;

        try {
            if (date_from != null) dateFrom = OffsetDateTime.parse(date_from);
            if (date_to != null) dateTo = OffsetDateTime.parse(date_to);
        } catch (Exception e) {
            return Mono.error(
                    new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid date format")
            );
        }

        return leadService.getLeads(
                getUserId(auth),
                status,
                search,
                dateFrom,
                dateTo,
                page,
                page_size
        );
    }

    @GetMapping("/{id}")
    public Mono<Lead> getLead(Authentication auth, @PathVariable UUID id) {
        return leadService.getLeadById(id, getUserId(auth));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<Lead> createLead(
            Authentication auth,
            @Valid @RequestBody LeadRequest request
    ) {
        return leadService.createLead(getUserId(auth), request);
    }

    @PutMapping("/{id}")
    public Mono<Lead> updateLead(
            Authentication auth,
            @PathVariable UUID id,
            @Valid @RequestBody LeadRequest request
    ) {
        return leadService.updateLead(id, getUserId(auth), request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public Mono<Void> deleteLead(Authentication auth, @PathVariable UUID id) {
        return leadService.deleteLead(id, getUserId(auth));
    }
}
