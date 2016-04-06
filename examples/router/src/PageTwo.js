import React from 'react';
import { Injector } from '../../../src/index.js';
import InjectableHeader from './InjectableHeader';

const PageTwo = () => (
  <div>
    I am page two.
  </div>
);

const Inject = (props) => (
  <div>
    Injection from Page Two.<br />
    I also recieved these props:<br />
  {Object.keys(props).join(`, `)}
  </div>
);

export default Injector({
  to: InjectableHeader,
  inject: Inject
})(PageTwo);
