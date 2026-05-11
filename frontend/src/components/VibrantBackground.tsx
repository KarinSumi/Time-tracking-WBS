import React from 'react';

interface VibrantBackgroundProps {
  children: React.ReactNode;
}

const VibrantBackground: React.FC<VibrantBackgroundProps> = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full">
      <div 
        className="fixed inset-0 z-[-1]"
        style={{
          background: 'linear-gradient(135deg, #4f46e5 0%, #9333ea 50%, #db2777 100%)',
        }}
      />
      {children}
    </div>
  );
};

export default VibrantBackground;
