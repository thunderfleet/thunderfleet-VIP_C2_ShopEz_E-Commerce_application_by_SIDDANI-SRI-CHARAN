import { backend_url } from "./App";

export const orderStatusSteps = [
  "Order Placed",
  "Processing",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

const getAuthHeaders = () => ({
  Accept: "application/json",
  "Content-Type": "application/json",
  "auth-token": localStorage.getItem("auth-token") || "",
});

export const formatOrderAddress = (address = {}) =>
  [
    address.house,
    address.street,
    address.area,
    address.city,
    address.state,
    address.pincode,
  ]
    .filter(Boolean)
    .join(", ");

export const formatOrderDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export const getOrderProgress = (order) => {
  const index = orderStatusSteps.indexOf(order?.status?.current);
  return index >= 0 ? index : 0;
};

export const addOrder = async (payload) => {
  const response = await fetch(`${backend_url}/addorder`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.errors || "Failed to create order");
  }

  return data.order;
};

export const getOrders = async () => {
  const response = await fetch(`${backend_url}/getorders`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.errors || "Failed to fetch orders");
  }

  return data.orders || [];
};
