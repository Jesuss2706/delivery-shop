package com.core.core.services;

import com.core.core.dto.InvMovementDTO;
import com.core.core.modules.InvMovement;
import com.core.core.modules.InventoryClass;
import com.core.core.modules.Product;
import com.core.core.modules.Provider;
import com.core.core.repository.InvMovementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class InvMovementServiceImpl implements InvMovementService {
    
    private final InvMovementRepository invMovementRepository;

    @Autowired
    public InvMovementServiceImpl(InvMovementRepository invMovementRepository) {
        this.invMovementRepository = invMovementRepository;
    }

    // ============ MÉTODOS CON DTO ============
    
    @Override
    @Transactional(readOnly = true)
    public List<InvMovementDTO> findAllDTO() {
        return invMovementRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<InvMovementDTO> findByIdDTO(Long id) {
        return invMovementRepository.findById(id)
                .map(this::convertToDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InvMovementDTO> findByInventoryCodeDTO(Long invCode) {
        return invMovementRepository.findByInventoryCode(invCode).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<InvMovementDTO> findByMovTypeDTO(String movType) {
        return invMovementRepository.findByMovType(movType).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<InvMovementDTO> findByOrderIdDTO(Long ordID) {
        return invMovementRepository.findByOrderId(ordID).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<InvMovementDTO> findByDateRangeDTO(Date startDate, Date endDate) {
        return invMovementRepository.findByDateRange(startDate, endDate).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<InvMovementDTO> findByInventoryCodeAndMovTypeDTO(Long invCode, String movType) {
        return invMovementRepository.findByInventoryCode(invCode).stream()
                .filter(movement -> movType.equals(movement.getMovType()))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<InvMovementDTO> findByInventoryCodeAndDateRangeDTO(Long invCode, Date startDate, Date endDate) {
        return invMovementRepository.findByInventoryCode(invCode).stream()
                .filter(movement -> 
                    movement.getMovDate() != null &&
                    !movement.getMovDate().before(startDate) &&
                    !movement.getMovDate().after(endDate))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // ============ MÉTODO DE CONVERSIÓN ============
    
    private InvMovementDTO convertToDTO(InvMovement movement) {
        InvMovementDTO dto = new InvMovementDTO();
        
        // Datos de InvMovement
        dto.setInvMovID(movement.getInvMovID());
        dto.setMovType(movement.getMovType());
        dto.setMovDate(movement.getMovDate());
        dto.setQuantity(movement.getQuantity());
        dto.setPrevStock(movement.getPrevStock());
        dto.setNewStock(movement.getNewStock());
        dto.setReason(movement.getReason());
        
        // Datos de Inventory
        if (movement.getInventory() != null) {
            InventoryClass inv = movement.getInventory();
            dto.setInvCode(inv.getInvCode());
            dto.setInvStock(inv.getInvStock());
            dto.setSellingPrice(inv.getSellingPrice());
            dto.setInvDate(inv.getInvDate());
            dto.setStatus(inv.getStatus());
            
            // Datos de Product
            if (inv.getProduct() != null) {
                Product prod = inv.getProduct();
                dto.setProCode(prod.getProCode());
                dto.setProName(prod.getProName());
                dto.setProImg(prod.getProImg());
            }
            
            // Datos de Provider
            if (inv.getProvider() != null) {
                Provider prov = inv.getProvider();
                dto.setProvId(prov.getProvId());
                dto.setProvName(prov.getProvName());
            }
        }
        
        // Datos de Order (si existe)
        if (movement.getOrder() != null) {
            // Opciones comunes: getOrdID(), getOrderId(), getId()
            dto.setOrdId(movement.getOrder().getOrdID());
        }
        
        // Datos de User (si existe)
        if (movement.getUser() != null) {
            dto.setUserId(movement.getUser().getId());
            dto.setUserName(movement.getUser().getUsername()); 
        }
        
        return dto;
    }

    // ============ MÉTODOS ORIGINALES ============
    
    @Override
    @Transactional(readOnly = true)
    public List<InvMovement> findAll() {
        return invMovementRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<InvMovement> findById(Long id) {
        return invMovementRepository.findById(id);
    }

    @Override
    public InvMovement save(InvMovement invMovement) {
        return invMovementRepository.save(invMovement);
    }

    @Override
    public void deleteById(Long id) {
        invMovementRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InvMovement> findByInventoryCode(Long invCode) {
        return invMovementRepository.findByInventoryCode(invCode);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InvMovement> findByMovType(String movType) {
        return invMovementRepository.findByMovType(movType);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InvMovement> findByOrderId(Long ordID) {
        return invMovementRepository.findByOrderId(ordID);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InvMovement> findByDateRange(Date startDate, Date endDate) {
        return invMovementRepository.findByDateRange(startDate, endDate);
    }

    @Override
    public boolean existsById(Long id) {
        return invMovementRepository.existsById(id);
    }

    @Override
    public long count() {
        return invMovementRepository.count();
    }

    @Override
    @Transactional(readOnly = true)
    public List<InvMovement> findByInventoryCodeAndMovType(Long invCode, String movType) {
        return invMovementRepository.findByInventoryCode(invCode).stream()
                .filter(movement -> movType.equals(movement.getMovType()))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<InvMovement> findByInventoryCodeAndDateRange(Long invCode, Date startDate, Date endDate) {
        return invMovementRepository.findByInventoryCode(invCode).stream()
                .filter(movement -> 
                    movement.getMovDate() != null &&
                    !movement.getMovDate().before(startDate) &&
                    !movement.getMovDate().after(endDate))
                .toList();
    }
}