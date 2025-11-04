package com.core.core.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserInfoDTO {
    
    private Long id;
    private String username;
    private String email;
    private String phone;
    private String fullName;
    private String address;
    private String city;
    private String department;
}
