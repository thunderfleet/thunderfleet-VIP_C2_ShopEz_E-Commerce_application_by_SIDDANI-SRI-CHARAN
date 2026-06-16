import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShopContext } from "../Context/ShopContext";
import { backend_url, currency } from "../App";
import { addOrder, formatOrderDate } from "../orderService";
import "./CSS/Checkout.css";

const savedAddressesKey = "shopez-saved-addresses";

const emptyAddress = {
  house: "",
  street: "",
  area: "",
  city: "",
  state: "",
  pincode: "",
};

const paymentMethods = [
  {
    id: "Cash On Delivery",
    label: "Cash On Delivery",
    short: "COD",
    icon: "₹",
    description: "Pay when your order is delivered.",
  },
  {
    id: "UPI",
    label: "UPI (Demo)",
    short: "UPI",
    icon: "UPI",
    description: "Google Pay, PhonePe, or Paytm demo payment.",
  },
  {
    id: "Credit Card",
    label: "Credit Card (Demo)",
    short: "CC",
    icon: "CC",
    description: "Demo card payment with basic formatting checks.",
  },
  {
    id: "Debit Card",
    label: "Debit Card (Demo)",
    short: "DC",
    icon: "DC",
    description: "Demo debit card payment with basic formatting checks.",
  },
];

const Checkout = () => {
  const { products, cartItems, getTotalCartAmount, clearCart } = useContext(ShopContext);
  const navigate = useNavigate();

  const [customer, setCustomer] = useState({
    fullName: "",
    mobile: "",
    email: "",
  });
  const [address, setAddress] = useState(emptyAddress);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("new");
  const [step, setStep] = useState("details");
  const [paymentMethod, setPaymentMethod] = useState("Cash On Delivery");
  const [upiProvider, setUpiProvider] = useState("Google Pay");
  const [cardDetails, setCardDetails] = useState({
    holder: "",
    number: "",
    expiry: "",
    cvv: "",
  });
  const [errors, setErrors] = useState({});
  const [paymentMessage, setPaymentMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAuthenticated = Boolean(localStorage.getItem("auth-token"));

  useEffect(() => {
    try {
      setSavedAddresses(JSON.parse(localStorage.getItem(savedAddressesKey) || "[]"));
    } catch (error) {
      setSavedAddresses([]);
    }
  }, []);

  const cartLineItems = useMemo(() => {
    return products
      .filter((product) => Number(cartItems[product.id]) > 0)
      .map((product) => {
        const quantity = Number(cartItems[product.id]);
        return {
          id: product.id,
          name: product.name,
          image: product.image,
          quantity,
          price: product.new_price,
          totalPrice: product.new_price * quantity,
        };
      });
  }, [products, cartItems]);

  const subtotal = getTotalCartAmount();
  const shipping = subtotal > 0 ? 0 : 0;
  const tax = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + shipping + tax;

  const updateCustomer = (event) => {
    const { name, value } = event.target;
    setCustomer((prev) => ({ ...prev, [name]: value }));
  };

  const updateAddress = (event) => {
    const { name, value } = event.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const updateCardDetails = (event) => {
    const { name, value } = event.target;
    setCardDetails((prev) => ({ ...prev, [name]: value }));
  };

  const validateDetails = () => {
    const nextErrors = {};

    if (!customer.fullName.trim()) nextErrors.fullName = "Full name is required.";
    if (!customer.mobile.trim()) nextErrors.mobile = "Mobile number is required.";
    else if (!/^[6-9]\d{9}$/.test(customer.mobile.trim())) nextErrors.mobile = "Enter a valid 10-digit mobile number.";

    if (!customer.email.trim()) nextErrors.email = "Email address is required.";
    else if (!/^\S+@\S+\.\S+$/.test(customer.email.trim())) nextErrors.email = "Enter a valid email address.";

    Object.keys(emptyAddress).forEach((field) => {
      if (!address[field].trim()) nextErrors[field] = "This field is required.";
    });

    if (address.pincode.trim() && !/^\d{6}$/.test(address.pincode.trim())) {
      nextErrors.pincode = "Enter a valid 6-digit pincode.";
    }

    return nextErrors;
  };

  const validatePayment = () => {
    const nextErrors = {};
    const cardNumber = cardDetails.number.replace(/\D/g, "");
    const expiry = cardDetails.expiry.trim();

    if (paymentMethod === "Credit Card" || paymentMethod === "Debit Card") {
      if (!cardDetails.holder.trim()) nextErrors.holder = "Card holder name is required.";
      if (cardNumber.length < 12 || cardNumber.length > 19) nextErrors.number = "Enter a valid card number.";
      if (!/^(0[1-9]|1[0-2])\/?([0-9]{2}|[0-9]{4})$/.test(expiry)) nextErrors.expiry = "Use MM/YY or MM/YYYY format.";
      if (!/^\d{3,4}$/.test(cardDetails.cvv.trim())) nextErrors.cvv = "Enter a valid CVV.";
    }

    return nextErrors;
  };

  const handleContinueToPayment = (event) => {
    event.preventDefault();

    if (cartLineItems.length === 0) {
      setErrors({ general: "Your cart is empty." });
      return;
    }

    const nextErrors = validateDetails();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      setStep("payment");
      setPaymentMessage("");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const saveAddress = () => {
    const nextErrors = validateDetails();
    const addressErrors = Object.keys(nextErrors).filter((key) => Object.keys(emptyAddress).includes(key));

    if (addressErrors.length > 0) {
      setErrors(nextErrors);
      return;
    }

    const newAddress = {
      id: Date.now().toString(),
      label: `${address.city} - ${address.pincode}`,
      ...address,
      savedAt: new Date().toISOString(),
    };
    const updatedAddresses = [newAddress, ...savedAddresses.filter((item) => item.id !== newAddress.id)].slice(0, 6);

    localStorage.setItem(savedAddressesKey, JSON.stringify(updatedAddresses));
    setSavedAddresses(updatedAddresses);
    setSelectedAddressId(newAddress.id);
    setErrors({});
    setPaymentMessage("Address saved for future checkout.");
  };

  const selectSavedAddress = (event) => {
    const selectedId = event.target.value;
    setSelectedAddressId(selectedId);

    if (selectedId === "new") {
      setAddress(emptyAddress);
    } else {
      const selectedAddress = savedAddresses.find((item) => item.id === selectedId);
      setAddress(selectedAddress || emptyAddress);
    }
  };

  const buildOrderPayload = () => ({
    products: cartLineItems.map((item) => ({
      productId: item.id,
      name: item.name,
      image: item.image,
      quantity: item.quantity,
      price: item.price,
      totalPrice: item.totalPrice,
    })),
    customer,
    address,
    payment: {
      method: paymentMethod,
      provider: paymentMethod === "UPI" ? upiProvider : paymentMethod.includes("Card") ? cardDetails.holder : "Demo",
      status: "Demo Payment Successful",
      transactionId:
        paymentMethod === "Cash On Delivery"
          ? `COD-DEMO-${Date.now()}`
          : paymentMethod === "UPI"
            ? `UPI-DEMO-${Date.now()}`
            : `CARD-DEMO-${Date.now()}`,
    },
    amounts: {
      subtotal,
      shipping,
      tax,
      total: grandTotal,
    },
  });

  const handlePaymentSubmit = async (event) => {
    event.preventDefault();

    if (!isAuthenticated) {
      setErrors({ general: "Please login to place an order." });
      return;
    }

    const nextErrors = validatePayment();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    setPaymentMessage("Simulating demo payment...");

    await new Promise((resolve) => setTimeout(resolve, 800));

    try {
      const order = await addOrder(buildOrderPayload());

      localStorage.setItem(
        "shopez-latest-order",
        JSON.stringify({
          orderId: order.orderId,
          paymentMethod: order.payment.method,
          totalAmount: order.amounts.total,
          address: order.address,
          orderDate: order.date,
        })
      );

      if (clearCart) clearCart();

      navigate("/order-success", {
        state: {
          orderId: order.orderId,
          paymentMethod: order.payment.method,
          deliveryAddress: order.address,
          totalAmount: order.amounts.total,
          orderDate: order.date,
        },
      });
    } catch (error) {
      setPaymentMessage(error.message || "Demo payment failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayError = () => {
    const firstError = Object.values(errors).find((value) => value);
    return firstError || "";
  };

  if (!isAuthenticated) {
    return (
      <div className="checkout-page">
        <div className="checkout-empty glass-card animate-fade-in">
          <h1>Login required</h1>
          <p>Please login to continue with checkout.</p>
          <button className="btn-primary" onClick={() => navigate("/login")}>Go to Login</button>
        </div>
      </div>
    );
  }

  if (cartLineItems.length === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-empty glass-card animate-fade-in">
          <div className="checkout-empty-icon">Cart</div>
          <h1>Your cart is empty</h1>
          <p>Add products to your cart before starting checkout.</p>
          <button className="btn-primary" onClick={() => navigate("/")}>Continue Shopping</button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <section className="checkout-hero animate-fade-in">
        <p className="eyebrow">Secure Checkout</p>
        <h1>Complete your order with a demo payment</h1>
        <p>No real payment gateway is connected. This flow simulates COD, UPI, and card payments.</p>
      </section>

      <div className="checkout-layout">
        <div className="checkout-main">
          <form className="checkout-form glass-card" onSubmit={handleContinueToPayment}>
            <div className="section-heading">
              <div>
                <p>Step 1</p>
                <h2>Customer Information</h2>
              </div>
              <span className="step-pill">Required</span>
            </div>

            <div className="form-grid two-columns">
              <label className="field">
                <span>Full Name</span>
                <input name="fullName" value={customer.fullName} onChange={updateCustomer} placeholder="Enter full name" />
              </label>
              <label className="field">
                <span>Mobile Number</span>
                <input name="mobile" value={customer.mobile} onChange={updateCustomer} placeholder="9876543210" inputMode="numeric" />
              </label>
              <label className="field full-width">
                <span>Email Address</span>
                <input name="email" type="email" value={customer.email} onChange={updateCustomer} placeholder="you@example.com" />
              </label>
            </div>

            <div className="section-heading">
              <div>
                <p>Step 2</p>
                <h2>Shipping Address</h2>
              </div>
              <span className="step-pill">Delivery</span>
            </div>

            <div className="form-grid">
              <label className="field">
                <span>House/Flat Number</span>
                <input name="house" value={address.house} onChange={updateAddress} placeholder="Flat 302" />
              </label>
              <label className="field">
                <span>Street</span>
                <input name="street" value={address.street} onChange={updateAddress} placeholder="Street name" />
              </label>
              <label className="field">
                <span>Area</span>
                <input name="area" value={address.area} onChange={updateAddress} placeholder="Area or locality" />
              </label>
              <label className="field">
                <span>City</span>
                <input name="city" value={address.city} onChange={updateAddress} placeholder="City" />
              </label>
              <label className="field">
                <span>State</span>
                <input name="state" value={address.state} onChange={updateAddress} placeholder="State" />
              </label>
              <label className="field">
                <span>Pincode</span>
                <input name="pincode" value={address.pincode} onChange={updateAddress} placeholder="600001" inputMode="numeric" />
              </label>
            </div>

            <div className="address-selector glass-card">
              <div className="section-heading compact">
                <div>
                  <p>Step 3</p>
                  <h2>Address Selection</h2>
                </div>
              </div>

              {savedAddresses.length > 0 && (
                <label className="field">
                  <span>Select Existing Address</span>
                  <select value={selectedAddressId} onChange={selectSavedAddress}>
                    <option value="new">Add New Address</option>
                    {savedAddresses.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <div className="address-actions">
                <button type="button" className="btn-outline" onClick={saveAddress}>Save Address</button>
                <button type="button" className="btn-secondary" onClick={() => { setSelectedAddressId("new"); setAddress(emptyAddress); }}>Add New Address</button>
              </div>
            </div>

            {displayError() && <div className="form-error animate-fade-in">{displayError()}</div>}

            <div className="checkout-actions">
              <button type="button" className="btn-ghost" onClick={() => navigate("/cart")}>Back to Cart</button>
              <button type="submit" className="btn-primary">Continue to Payment</button>
            </div>
          </form>

          {step === "payment" && (
            <section className="payment-section glass-card animate-fade-in">
              <div className="section-heading">
                <div>
                  <p>Step 4</p>
                  <h2>Payment Options</h2>
                </div>
                <span className="step-pill demo">Demo Only</span>
              </div>

              <div className="payment-methods">
                {paymentMethods.map((method) => (
                  <button
                    type="button"
                    key={method.id}
                    className={`payment-method ${paymentMethod === method.id ? "active" : ""}`}
                    onClick={() => {
                      setPaymentMethod(method.id);
                      setPaymentMessage("");
                    }}
                  >
                    <span className="payment-method-icon">{method.icon}</span>
                    <span>
                      <strong>{method.label}</strong>
                      <small>{method.description}</small>
                    </span>
                  </button>
                ))}
              </div>

              {paymentMethod === "Cash On Delivery" && (
                <div className="payment-detail animate-fade-in">
                  <div className="payment-notice">
                    <span>₹</span>
                    <div>
                      <h3>Cash On Delivery</h3>
                      <p>Pay when your order is delivered.</p>
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === "UPI" && (
                <div className="payment-detail animate-fade-in">
                  <label className="field">
                    <span>Choose UPI App</span>
                    <select value={upiProvider} onChange={(event) => setUpiProvider(event.target.value)}>
                      <option>Google Pay</option>
                      <option>PhonePe</option>
                      <option>Paytm</option>
                    </select>
                  </label>
                  <div className="payment-notice">
                    <span>UPI</span>
                    <div>
                      <h3>{upiProvider} demo payment</h3>
                      <p>Click Pay Now to simulate a successful UPI transaction.</p>
                    </div>
                  </div>
                </div>
              )}

              {(paymentMethod === "Credit Card" || paymentMethod === "Debit Card") && (
                <div className="payment-detail animate-fade-in">
                  <div className="form-grid two-columns">
                    <label className="field full-width">
                      <span>Card Holder Name</span>
                      <input name="holder" value={cardDetails.holder} onChange={updateCardDetails} placeholder="Name on card" />
                    </label>
                    <label className="field full-width">
                      <span>Card Number</span>
                      <input name="number" value={cardDetails.number} onChange={updateCardDetails} placeholder="1234 5678 9012 3456" inputMode="numeric" />
                    </label>
                    <label className="field">
                      <span>Expiry Date</span>
                      <input name="expiry" value={cardDetails.expiry} onChange={updateCardDetails} placeholder="MM/YY" inputMode="numeric" />
                    </label>
                    <label className="field">
                      <span>CVV</span>
                      <input name="cvv" type="password" value={cardDetails.cvv} onChange={updateCardDetails} placeholder="123" inputMode="numeric" maxLength="4" />
                    </label>
                  </div>
                </div>
              )}

              {paymentMessage && <div className="payment-message animate-fade-in">{paymentMessage}</div>}

              <form onSubmit={handlePaymentSubmit} className="payment-form">
                <button type="submit" className="btn-primary full-width" disabled={isSubmitting}>
                  {isSubmitting ? "Processing..." : paymentMethod === "Cash On Delivery" ? "Place Order" : "Pay Now"}
                </button>
              </form>
            </section>
          )}
        </div>

        <aside className="order-summary glass-card">
          <div className="summary-header">
            <div>
              <p>Order Summary</p>
              <h2>{cartLineItems.reduce((total, item) => total + item.quantity, 0)} Items</h2>
            </div>
            <span>{formatOrderDate(new Date())}</span>
          </div>

          <div className="summary-products">
            {cartLineItems.map((item) => (
              <div className="summary-product" key={item.id}>
                <img src={backend_url + item.image} alt={item.name} />
                <div>
                  <h3>{item.name}</h3>
                  <p>Qty {item.quantity} × {currency}{item.price}</p>
                </div>
                <strong>{currency}{item.totalPrice}</strong>
              </div>
            ))}
          </div>

          <div className="summary-totals">
            <div>
              <span>Subtotal</span>
              <strong>{currency}{subtotal}</strong>
            </div>
            <div>
              <span>Shipping</span>
              <strong>{shipping === 0 ? "Free" : currency + shipping}</strong>
            </div>
            <div>
              <span>Taxes (Demo)</span>
              <strong>{currency}{tax}</strong>
            </div>
            <div className="grand-total">
              <span>Grand Total</span>
              <strong>{currency}{grandTotal}</strong>
            </div>
          </div>

          <div className="summary-trust">
            <span>Secure demo checkout</span>
            <span>Easy returns</span>
            <span>Fast delivery tracking</span>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Checkout;
