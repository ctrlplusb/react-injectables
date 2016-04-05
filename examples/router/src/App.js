import React, { PropTypes } from 'react';
import InjectableHeader from './InjectableHeader';
import { Link } from 'react-router';

// Our base application component.  Which shall contain our injectable header.
const App = ({ children }) => (
  <div>
    <InjectableHeader />
    <h2>Injectables Router Example</h2>
    <div>
      {children}
    </div>
    <p>
      Click on the links below to load different pages:
    </p>
    <ul>
      <li><Link to="/">Home</Link></li>
      <li><Link to="/pageOne">Page One</Link></li>
      <li><Link to="/pageTwo">Page Two</Link></li>
    </ul>
  </div>
);
App.propTypes = {
  children: PropTypes.any
};

export default App;
