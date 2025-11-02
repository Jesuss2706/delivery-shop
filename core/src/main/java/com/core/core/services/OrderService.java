package com.core.core.services;

import com.core.core.modules.Order;

import java.util.List;

public interface OrderService {

    List<Order> getAllOrders();
    List<Order> getOrdersByUserId(Long userId);
    List<Order> getOrdersByUsername(String username);
    Order getOrder(Long orderId);
    Order createOrder(Order order);
    Order updateOrder(Long orderId, Order order);
    boolean deleteOrder(Long orderId);

}
