import React from 'react'
import './Footer.css'

import footer_logo from '../Assets/logo_big.png'
import instagram_icon from '../Assets/instagram_icon.png'
import pintrest_icon from '../Assets/pintester_icon.png'
import whatsapp_icon from '../Assets/whatsapp_icon.png'

const Footer = () => {
  return (
    <div className='footer'>
      <div className="container footer-container">
        <div className="footer-col brand-col">
          <div className="footer-logo">
            <img src={footer_logo} alt="" />
            <p>ShopEz</p>
          </div>
          <p className="footer-desc">Your ultimate destination for premium clothing and accessories. We bring you the latest fashion trends with unbeatable quality and prices.</p>
          <div className="footer-social-icons">
            <div className="footer-icons-container">
                <img src={instagram_icon} alt="Instagram" />
            </div>
            <div className="footer-icons-container">
                <img src={pintrest_icon} alt="Pinterest" />
            </div>
            <div className="footer-icons-container">
                <img src={whatsapp_icon} alt="WhatsApp" />
            </div>
          </div>
        </div>

        <div className="footer-col">
          <h3>Quick Links</h3>
          <ul className="footer-links">
            <li>Home</li>
            <li>Shop Men</li>
            <li>Shop Women</li>
            <li>Shop Kids</li>
            <li>Cart</li>
          </ul>
        </div>

        <div className="footer-col">
          <h3>Customer Service</h3>
          <ul className="footer-links">
            <li>FAQ</li>
            <li>Returns Policy</li>
            <li>Shipping Info</li>
            <li>Track Order</li>
            <li>Contact Us</li>
          </ul>
        </div>

        <div className="footer-col">
          <h3>Contact Info</h3>
          <ul className="footer-links">
            <li>Email: support@shopez.com</li>
            <li>Phone: +1 234 567 890</li>
            <li>Address: 123 Fashion St, NY 10001</li>
          </ul>
        </div>
      </div>
      
      <div className="footer-copyright">
        <p>Copyright © {new Date().getFullYear()} ShopEz - All Rights Reserved.</p>
      </div>
    </div>
  )
}

export default Footer
