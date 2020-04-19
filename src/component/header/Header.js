import React from 'react';
import './header.css';

function Header({title, cstyle={}}) {
  return (
    <div className="header">
        <h1 className="g-view-title" style={cstyle}>{title}</h1>
    </div>
  );
}

export default Header;