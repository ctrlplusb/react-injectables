import React, { PropTypes } from 'react';
import { prepInjection } from '../../../src/index.js';

// Create a new injectable configuration.
const { Injectable, Injector } = prepInjection();

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

// We export the injectable header as well as a Higher Order Component function
// which can be used to decorate components with the ability to inject into
// the header.
export const HeaderInjector = Injector;
export default InjectableHeader;
