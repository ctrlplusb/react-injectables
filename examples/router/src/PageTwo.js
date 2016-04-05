import React from 'react';
import { HeaderInjector } from './InjectableHeader';

const PageTwo = () => (
  <div>
    I am page two.
  </div>
);
export default HeaderInjector([
  <div>Injection from Page Two</div>
])(PageTwo);
