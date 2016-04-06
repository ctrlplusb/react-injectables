import React from 'react';
import { Injector } from '../../../src/index.js';
import InjectableHeader from './InjectableHeader';

const PageOne = () => (
  <div>
    I am page one.
  </div>
);
export default Injector({
  to: InjectableHeader,
  elements: [<div>Injection from Page One</div>]
})(PageOne);
