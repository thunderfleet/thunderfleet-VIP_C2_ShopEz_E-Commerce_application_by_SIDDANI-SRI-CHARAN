import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { currency } from "../App";
import { formatOrderAddress, formatOrderDate, getOrders } from "../orderService";
import "./CSS/OrderSuccess.css";

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(location.state);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadLatestOrder = async () => {
      const cachedOrder = JSON.parse(localStorage.getItem("shopez-latest-order") || "null");

      if (cachedOrder) {
        setOrderDetails(cachedOrder);
        return;
      }

      if (!localStorage.getItem("auth-token")) return;

      setLoading(true);

      try {
        const orders = await getOrders();
        if (orders.length > 0) setOrderDetails(orders[0]);
      } catch (err) {
        setError(err.message || "Unable to load order details.");
      } finally {
        setLoading(false);
      }
    };

    if (!orderDetails) loadLatestOrder();
  }, [orderDetails]);

  const orderId = orderDetails?.orderId || orderDetails?.orderNumber || "";
  const paymentMethod = orderDetails?.paymentMethod || orderDetails?.payment?.method || "";
  const deliveryAddress = orderDetails?.deliveryAddress || orderDetails?.address || {};
  const totalAmount = orderDetails?.totalAmount || orderDetails?.amounts?.total || 0;
  const orderDate = orderDetails?.orderDate || orderDetails?.date || new Date();

  if (loading) {
    return (
      <div className="order-success-page">
        <div className="order-success-card glass-card animate-fade-in">
          <div className="success-loader" />
          <h1>Loading order...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-success-page">
        <div className="order-success-card glass-card animate-fade-in">
          <h1>Unable to load order</h1>
          <p>{error}</p>
          <button className="btn-primary" onClick={() => navigate("/orders")}>View Orders</button>
        </div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="order-success-page">
        <div className="order-success-card glass-card animate-fade-in">
          <div className="success-animation">
            <span>✓</span>
          </div>
          <h1>No recent order found</h1>
          <p>Place an order to see the success confirmation here.</p>
          <button className="btn-primary" onClick={() => navigate("/")}>Continue Shopping</button>
        </div>
      </div>
    );
  }

  return (
    <div className="order-success-page">
      <div className="order-success-card glass-card animate-fade-in">
        <div className="success-animation">
          <span>✓</span>
        </div>

        <p className="eyebrow">Order Confirmed</p>
        <h1>Thank you for your order</h1>
        <p>Your demo order has been placed successfully.</p>

        <div className="success-details">
          <div>
            <span>Order Number</span>
            <strong>{orderId}</strong>
          </div>
          <div>
            <span>Payment Method</span>
            <strong>{paymentMethod}</strong>
          </div>
          <div>
            <span>Total Amount</span>
            <strong>{currency}{totalAmount}</strong>
          </div>
          <div className="success-address">
            <span>Delivery Address</span>
            <strong>{formatOrderAddress(deliveryAddress)}</strong>
          </div>
          <div>
            <span>Order Date</span>
            <strong>{formatOrderDate(orderDate)}</strong>
          </div>
        </div>

        <div className="success-actions">
          <button className="btn-primary" onClick={() => navigate("/orders")}>View Orders</button>
          <button className="btn-ghost" onClick={() => navigate("/")}>Continue Shopping</button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
