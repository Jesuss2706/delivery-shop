package com.core.core.services;

import com.core.core.modules.Order;
import com.core.core.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;

    public OrderServiceImpl(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Override
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @Override
    public List<Order> getOrdersByUserId(Long userId) {
        return orderRepository.findByUserId(userId);
    }

    @Override
    public List<Order> getOrdersByUsername(String username) {
        return orderRepository.findByUser_Username(username);
    }

    @Override
    public Order getOrder(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Orden no encontrada por el codigo: " + orderId));
    }

    @Override
    public Order createOrder(Order order) {
        return orderRepository.save(order);
    }

    @Override
    public Order updateOrder(Long orderId, Order order) {
        Order updatedOrder = orderRepository.findById(orderId).orElse(null);

        if (updatedOrder != null) {
            updatedOrder.setOrdState(order.getOrdState());
            updatedOrder.setOrdDate(order.getOrdDate());

            return orderRepository.save(updatedOrder);
        }
        return null;
    }

    @Override
    public boolean deleteOrder(Long orderId) {
        Optional<Order> order = orderRepository.findById(orderId);
        if (order.isPresent()) {
            orderRepository.deleteById(orderId);
            return true;
        }
        return false;
    }
}
