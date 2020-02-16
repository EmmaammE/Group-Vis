import React from 'react';
import './header.css';
import path from '../../assets/path.svg';

function Header({title}) {
  return (
    <div className="header">
        <h1>{title}</h1>
        <img src={path} alt="" />
    </div>
  );
}

export default Header;