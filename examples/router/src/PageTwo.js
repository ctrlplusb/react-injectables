import React from 'react';
import { Injector } from '../../../src/index.js';
import InjectableHeader from './InjectableHeader';

const PageTwo = () => (
  <div>
    I am page two.
  </div>
);

export default Injector({
  to: InjectableHeader,
  elements: [<div>Injection from Page Two</div>]
})(PageTwo);
