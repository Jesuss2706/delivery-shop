package com.core.core.services;

import com.core.core.dto.InvMovementDTO;
import com.core.core.modules.InvMovement;
import java.util.Date;
import java.util.List;
import java.util.Optional;

public interface InvMovementService {
    
    // Métodos con DTO
    List<InvMovementDTO> findAllDTO();
    Optional<InvMovementDTO> findByIdDTO(Long id);
    List<InvMovementDTO> findByInventoryCodeDTO(Long invCode);
    List<InvMovementDTO> findByMovTypeDTO(String movType);
    List<InvMovementDTO> findByOrderIdDTO(Long ordID);
    List<InvMovementDTO> findByDateRangeDTO(Date startDate, Date endDate);
    List<InvMovementDTO> findByInventoryCodeAndMovTypeDTO(Long invCode, String movType);
    List<InvMovementDTO> findByInventoryCodeAndDateRangeDTO(Long invCode, Date startDate, Date endDate);
   
    List<InvMovement> findAll();
    Optional<InvMovement> findById(Long id);
    InvMovement save(InvMovement invMovement);
    void deleteById(Long id);
    List<InvMovement> findByInventoryCode(Long invCode);
    List<InvMovement> findByMovType(String movType);
    List<InvMovement> findByOrderId(Long ordID);
    List<InvMovement> findByDateRange(Date startDate, Date endDate);
    boolean existsById(Long id);
    long count();
    List<InvMovement> findByInventoryCodeAndMovType(Long invCode, String movType);
    List<InvMovement> findByInventoryCodeAndDateRange(Long invCode, Date startDate, Date endDate);
}