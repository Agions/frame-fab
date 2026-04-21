/**
 * AnimateIn - Simple fade-in animation wrapper
 */
import React from 'react';

interface AnimateInProps {
  type?: 'fadeIn' | 'slideUp' | 'slideLeft' | 'scale';
  delay?: number;
  children: React.ReactNode;
  className?: string;
}

const AnimateIn: React.FC<AnimateInProps> = ({ 
  children, 
  delay = 0, 
  className = '', 
  type = 'fadeIn' 
}) => {
  const style: React.CSSProperties = {
    animationDelay: `${delay}ms`,
  };

  const animationClass = {
    fadeIn: 'animate-fadeIn',
    slideUp: 'animate-slideUp',
    slideLeft: 'animate-slideLeft',
    scale: 'animate-scale',
  }[type];

  return (
    <div className={`animate-in ${animationClass} ${className}`} style={style}>
      {children}
    </div>
  );
};

export default AnimateIn;
