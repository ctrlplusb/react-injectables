import React from 'react';
import { HeaderInjector } from './InjectableHeader';

// Our component that we will inject.
const InjectMe = (props) => (
  <div>
    <p>Injection from Page Two.</p>
    <p>
      I also recieved these props:<br />
      {Object.keys(props).join(`, `)}
    </p>
  </div>
);

// Use the HeaderInjector helper to create an Injection.
const HeaderInjection = HeaderInjector(InjectMe);

/**
 * This is the component that when rendered will cause the injection to occur.
 */
const PageTwo = () => (
  <div>
    {/* The injection! Nothing actually gets rendered here, it gets sent to
        our target Injectable. */}
    <HeaderInjection foo="foo" bar="bar" baz="baz" />

    I am page two.
  </div>
);

export default PageTwo;
