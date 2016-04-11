import React, { PropTypes } from 'react';
import { Injectable, Injector } from '../../../src/index.js';

// Prep a header component which we intend to make injectable.
// Note the prop named 'injections'.  This will contain any injected elements.
const Header = ({ injections }) => (
  <div style={{ backgroundColor: `red`, color: `white` }}>
    <h1>INJECTABLE HEADER</h1>
    <div>
      {injections.length > 0 ? injections : <div>Nothing has been injected</div>}
    </div>
  </div>
);
Header.propTypes = {
  injections: PropTypes.arrayOf(PropTypes.element)
};

// Convert our header into an injectable!
const InjectableHeader = Injectable(Header);

// Create an Injector helper function for our InjectableHeader.
export const HeaderInjector = Injector({ into: InjectableHeader });

export default InjectableHeader;
