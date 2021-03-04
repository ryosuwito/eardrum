import React from 'react';

const Container = ({ children }) => {
  return (
    <div
      style={{
        padding: '32px 10px',
        border: '1px solid rgba(156, 163, 175, 50%)',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      }}>
      {children}
    </div>
  );
};

export default Container;
