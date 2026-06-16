import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { backend_url, currency } from "../App";
import {
  formatOrderAddress,
  formatOrderDate,
  getOrders,
  getOrderProgress,
  orderStatusSteps,
} from "../orderService";
import "./CSS/Orders.css";
import OrdersParticleCanvas from "../Components/OrdersParticleCanvas/OrdersParticleCanvas";

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const isAuthenticated = Boolean(localStorage.getItem("auth-token"));

  const loadOrders = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoading(true);

    try {
      const data = await getOrders();
      setOrders(data);
      setError("");
    } catch (err) {
      setError(err.message || "Unable to load orders.");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadOrders();
    const intervalId = setInterval(loadOrders, 15000);
    return () => clearInterval(intervalId);
  }, [loadOrders]);

  const statusBadgeClass = (status) => `status-badge ${String(status).toLowerCase().replace(/\s+/g, "-")}`;

  if (!isAuthenticated) {
    return (
      <div className="orders-page">
        <OrdersParticleCanvas />
        <div className="orders-empty glass-card animate-fade-in">
          <h1>Login required</h1>
          <p>Please login to view your orders.</p>
          <button className="btn-primary" onClick={() => navigate("/login")}>Go to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <OrdersParticleCanvas />
      <section className="orders-hero animate-fade-in">
        <p className="eyebrow">Order Tracking</p>
        <h1>Your ShopEz Orders</h1>
        <p>Track every order from placement to delivery with live demo status progression.</p>
        <button className="btn-ghost" onClick={loadOrders}>Refresh Orders</button>
      </section>

      {loading && <div className="orders-loading animate-fade-in">Loading your orders...</div>}

      {error && <div className="orders-error animate-fade-in">{error}</div>}

      {!loading && !error && orders.length === 0 && (
        <div className="orders-empty glass-card animate-fade-in">
          <div className="orders-empty-icon">Orders</div>
          <h1>No orders yet</h1>
          <p>Place your first order and track it here.</p>
          <button className="btn-primary" onClick={() => navigate("/")}>Continue Shopping</button>
        </div>
      )}

      <div className="orders-grid">
        {orders.map((order) => {
          const progressIndex = getOrderProgress(order);
          const progressPercent = (progressIndex / (orderStatusSteps.length - 1)) * 100;
          const firstProduct = order.products?.[0];
          const paymentLabel = order.payment?.provider && order.payment.method !== "Cash On Delivery"
            ? `${order.payment.method} via ${order.payment.provider}`
            : order.payment?.method || "Demo Payment";

          return (
            <article className="order-card glass-card animate-fade-in" key={order.orderId || order._id}>
              <div className="order-card-header">
                <div>
                  <p>Order ID</p>
                  <h2>{order.orderId}</h2>
                </div>
                <span className={statusBadgeClass(order.status?.current || "Order Placed")}>
                  {order.status?.current || "Order Placed"}
                </span>
              </div>

              <div className="order-product-row">
                {firstProduct && (
                  <img src={backend_url + firstProduct.image} alt={firstProduct.name} />
                )}
                <div>
                  <h3>{firstProduct?.name || "Order Product"}</h3>
                  <p>Qty {firstProduct?.quantity || 0} · {currency}{firstProduct?.price || 0}</p>
                </div>
                <strong>{currency}{order.amounts?.total || 0}</strong>
              </div>

              {order.products?.length > 1 && (
                <div className="order-extra-products">
                  {order.products.slice(1).map((product) => (
                    <div className="order-extra-product" key={product.productId}>
                      <img src={backend_url + product.image} alt={product.name} />
                      <div>
                        <h4>{product.name}</h4>
                        <span>Qty {product.quantity} · {currency}{product.totalPrice}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="order-meta-grid">
                <div>
                  <span>Order Date</span>
                  <strong>{formatOrderDate(order.date)}</strong>
                </div>
                <div>
                  <span>Payment Method</span>
                  <strong>{paymentLabel}</strong>
                </div>
                <div className="order-address">
                  <span>Delivery Address</span>
                  <strong>{formatOrderAddress(order.address)}</strong>
                </div>
              </div>

              <div className="order-progress">
                <div className="order-progress-bar">
                  <div style={{ width: `${progressPercent}%` }} />
                </div>

                <div className="order-timeline">
                  {orderStatusSteps.map((step, index) => (
                    <div className={`order-timeline-step ${index <= progressIndex ? "completed" : ""}`} key={step}>
                      <div className="order-timeline-dot">
                        {index <= progressIndex ? "✓" : index + 1}
                      </div>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default Orders;
