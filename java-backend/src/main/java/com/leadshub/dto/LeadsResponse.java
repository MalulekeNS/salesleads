package com.leadshub.dto;

import com.leadshub.model.Lead;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeadsResponse {
    private List<Lead> data;
    private Map<String, Object> pagination;
}
