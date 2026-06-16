import React, { useContext, useEffect, useRef, useState } from 'react'
import './Navbar.css'
import { Link, NavLink, useLocation } from 'react-router-dom'
import logo from '../Assets/logo.png'
import cart_icon from '../Assets/cart_icon.png'
import nav_dropdown from '../Assets/nav_dropdown.png'
import { ShopContext } from '../../Context/ShopContext'

const Navbar = () => {
  const [menu, setMenu] = useState("shop");
  const { getTotalCartItems } = useContext(ShopContext);
  const location = useLocation();
  const menuRef = useRef();
  const dropdownRef = useRef();

  const closeMenu = () => {
    menuRef.current?.classList.remove('nav-menu-visible');
    dropdownRef.current?.classList.remove('open');
  };

  const dropdown_toggle = () => {
    const isVisible = menuRef.current.classList.toggle('nav-menu-visible');
    dropdownRef.current.classList.toggle('open', isVisible);
  }

  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const path = location.pathname;

    if (path.startsWith('/mens')) setMenu("mens");
    else if (path.startsWith('/womens')) setMenu("womens");
    else if (path.startsWith('/kids')) setMenu("kids");
    else if (path.startsWith('/orders')) setMenu("orders");
    else if (path.startsWith('/cart')) setMenu("cart");
    else if (path.startsWith('/checkout')) setMenu("checkout");
    else setMenu("shop");

    closeMenu();
  }, [location.pathname]);

  return (
    <div className={`nav ${isSticky ? 'sticky' : ''}`}>
      <Link to='/' onClick={() => { setMenu("shop"); closeMenu(); }} className="nav-logo">
        <img src={logo} alt="logo" />
        <p>ShopEz</p>
      </Link>

      <div className="nav-search">
        <input type="text" placeholder="Search products..." />
        <button className="search-btn" aria-label="Search">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
          </svg>
        </button>
      </div>

      <img ref={dropdownRef} onClick={dropdown_toggle} className='nav-dropdown' src={nav_dropdown} alt="menu" />
      <ul ref={menuRef} className="nav-menu">
        <li className={menu === "shop" ? "active" : ""}><NavLink to='/' onClick={() => { setMenu("shop"); closeMenu(); }}>Shop</NavLink></li>
        <li className={menu === "mens" ? "active" : ""}><NavLink to='/mens' onClick={() => { setMenu("mens"); closeMenu(); }}>Men</NavLink></li>
        <li className={menu === "womens" ? "active" : ""}><NavLink to='/womens' onClick={() => { setMenu("womens"); closeMenu(); }}>Women</NavLink></li>
        <li className={menu === "kids" ? "active" : ""}><NavLink to='/kids' onClick={() => { setMenu("kids"); closeMenu(); }}>Kids</NavLink></li>
        <li className={menu === "orders" ? "active" : ""}><NavLink to='/orders' onClick={() => { setMenu("orders"); closeMenu(); }}>Orders</NavLink></li>
      </ul>

      <div className="nav-login-cart">
        {localStorage.getItem('auth-token')
          ? <button className="btn-outline" onClick={() => { localStorage.removeItem('auth-token'); window.location.replace("/"); }}>Logout</button>
          : <Link to='/login' onClick={closeMenu}><button className="btn-primary">Login</button></Link>}
        <Link to="/cart" onClick={closeMenu}>
          <div className="cart-icon-container">
            <img src={cart_icon} alt="cart" />
            <div className="nav-cart-count">{getTotalCartItems()}</div>
          </div>
        </Link>
      </div>
    </div>
  )
}

export default Navbar
