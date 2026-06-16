import React from 'react'
import './Item.css'
import { Link } from 'react-router-dom'
import { backend_url, currency } from '../../App'

const Item = (props) => {
  return (
    <div className='item glass-card animate-fade-in'>
      <Link to={`/product/${props.id}`}>
        <div className="item-img-container">
          {props.old_price && props.new_price && props.old_price > props.new_price && (
            <span className="item-discount-badge">
              -{Math.round(((props.old_price - props.new_price) / props.old_price) * 100)}%
            </span>
          )}
          <img onClick={() => window.scrollTo(0, 0)} src={backend_url+props.image} alt="products" />
          <div className="item-hover-action">
            <button className="btn-primary">View Product</button>
          </div>
        </div>
      </Link>
      <div className="item-info">
        <p className="item-title">{props.name}</p>
        <div className="item-prices">
          <div className="item-price-new">{currency}{props.new_price}</div>
          {props.old_price && <div className="item-price-old">{currency}{props.old_price}</div>}
        </div>
      </div>
    </div>
  )
}

export default Item
