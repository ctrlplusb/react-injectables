import React from 'react';
import { HeaderInjector } from './InjectableHeader';

const PageOne = () => (
  <div>
    I am page one.
  </div>
);
export default HeaderInjector([
  <div>Injection from Page One</div>
])(PageOne);
