import React from 'react';

interface PlatformIconProps {
  icon: string | React.ComponentType<any>;
  size?: number;
  style?: React.CSSProperties;
  className?: string;
  color?: string;
}

export const PlatformIcon: React.FC<PlatformIconProps> = ({ 
  icon, 
  size = 48, 
  style = {}, 
  className = '',
  color 
}) => {
  // If icon is a React component
  if (typeof icon === 'function') {
    const IconComponent = icon;
    return (
      <div 
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: color || 'currentColor',
          ...style
        }}
        className={className}
      >
        <IconComponent size={size * 0.8} />
      </div>
    );
  }
  
  // If icon is a string (emoji or text)
  return (
    <div 
      style={{
        fontSize: size,
        lineHeight: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        ...style
      }}
      className={className}
    >
      {icon}
    </div>
  );
};