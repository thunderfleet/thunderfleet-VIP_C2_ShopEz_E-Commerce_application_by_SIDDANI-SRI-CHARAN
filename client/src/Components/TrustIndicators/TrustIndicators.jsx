import React from 'react';
import './TrustIndicators.css';

const TrustIndicators = () => {
  const indicators = [
    {
      title: "Fast Delivery",
      desc: "Free shipping on orders over $50",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 18H3a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-2"/>
          <path d="M16 8h4l3 3v5h-3"/>
          <circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>
        </svg>
      )
    },
    {
      title: "Secure Payments",
      desc: "100% secure payment methods",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      )
    },
    {
      title: "Easy Returns",
      desc: "30-day return policy",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      )
    },
    {
      title: "Quality Products",
      desc: "Top grade items",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      )
    }
  ];

  return (
    <div className="trust-indicators">
      <div className="container">
        <div className="trust-grid">
          {indicators.map((item, index) => (
            <div className="trust-card animate-fade-in" key={index} style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="trust-icon">{item.icon}</div>
              <div className="trust-info">
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrustIndicators;
