import React from 'react';
import { Injector } from '../../../src/index.js';
import InjectableHeader from './InjectableHeader';

// Our component that we will inject.
const Inject = (props) => (
  <div>
    Injection from Page Two.<br />
    I also recieved these props:<br />
  {Object.keys(props).join(`, `)}
  </div>
);

// Our Injector instance configured to inject into the InjectableHeader.
const HeaderInjection = Injector({
  into: InjectableHeader
})(Inject);

/**
 * This is the component that when rendered will cause the injection to occur.
 */
const PageTwo = () => (
  <div>
    {/* The injection! Nothing actually gets rendered here, it gets sent to
        our target Injectable. */}
    <HeaderInjection />

    I am page two.
  </div>
);

export default PageTwo;
