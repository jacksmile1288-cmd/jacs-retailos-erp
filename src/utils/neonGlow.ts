import React from 'react';

export const getReactiveNeonGlowStyle = (
  hexColor: string,
  isActive: boolean = false,
  isHovered: boolean = false
): React.CSSProperties => {
  if (isActive) {
    return {
      boxShadow: `0 0 16px ${hexColor}66, inset 0 0 8px ${hexColor}33`,
      borderColor: `${hexColor}aa`,
    };
  }

  if (isHovered) {
    return {
      boxShadow: `0 0 10px ${hexColor}44`,
      borderColor: `${hexColor}66`,
    };
  }

  return {
    borderColor: 'transparent',
  };
};
