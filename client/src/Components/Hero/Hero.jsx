import React from "react";
import "./Hero.css";
import hero_image from "../Assets/hero_image.png";
import hand_icon from "../Assets/hand_icon.png";
import arrow_icon from "../Assets/arrow.png";
import HeroParticleCanvas from "../HeroParticleCanvas/HeroParticleCanvas";

const Hero = () => {
  return (
    <div className="hero">
      <HeroParticleCanvas />
      {/* Background Shapes */}
      <div className="hero-shape shape-1"></div>
      <div className="hero-shape shape-2"></div>
      <div className="hero-shape shape-3"></div>

      <div className="hero-left">
        <h2 className="animate-slide-up" style={{ animationDelay: '0.1s' }}>ELEVATE YOUR WARDROBE</h2>
        <div>
          <p className="hero-main-text animate-slide-up" style={{ animationDelay: '0.2s' }}>Redefine</p>
          <div className="hero-hand-icon animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <p className="hero-main-text">Your Style</p>
            <img src={hand_icon} alt="" />
          </div>
          <p className="hero-main-text animate-slide-up" style={{ animationDelay: '0.4s' }}>With ShopEz</p>
        </div>
        <p className="hero-subtext animate-slide-up" style={{ animationDelay: '0.5s' }}>Experience a curated collection of premium fashion, meticulously designed for the modern lifestyle.</p>
        <div className="hero-latest-btn btn-primary animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <div>Shop Collection</div>
          <img src={arrow_icon} alt="" />
        </div>
      </div>
      <div className="hero-right animate-fade-in-right">
        <img src={hero_image} alt="hero" className="hero-img floating-img" />
      </div>
    </div>
  );
};

export default Hero;
