import React, { PropTypes } from 'react';
import { Injectable } from '../../../src/index.js';

// Prep a header component which we intend to make injectable.
// Note the prop named 'injected'.  This will contain any injected elements.
const Header = ({ injected }) => (
  <div style={{ backgroundColor: `red`, color: `white` }}>
    <h1>INJECTABLE HEADER</h1>
    <div>
      <strong>INJECTED ITEMS:</strong>
      {injected.length > 0 ? injected : <div>Nothing has been injected</div>}
    </div>
  </div>
);
Header.propTypes = {
  injected: PropTypes.arrayOf(PropTypes.element)
};

// Convert our header into an injectable!
const InjectableHeader = Injectable(Header);

export default InjectableHeader;
