import React, { Component, PropTypes } from 'react';
import { Injector } from '../../../src/index.js';
import InjectableHeader from './InjectableHeader';

// Our component that we will inject.
const Injection = ({ active }) => (
  <div>
    <p>Injection from Page One</p>
    <p>The active prop value is: {active ? `active` : `inactive`}</p>
  </div>
);
Injection.propTypes = {
  active: PropTypes.bool.isRequired
};

// Our Injector instance configured to inject into the InjectableHeader.
const HeaderInjection = Injector({
  into: InjectableHeader
})(Injection);

/**
 * This is the component that when rendered will cause the injection to occur.
 */
class PageOne extends Component {
  state = {
    active: false
  }

  onClick = () => {
    this.setState({ active: !this.state.active });
  }

  render() {
    const { active } = this.state;

    return (
      <div>
        {/* The injection! Nothing gets rendered here. */}
        <HeaderInjection active={active} />

        <div>
          <p>I am page one.</p>
          <p>My State is {active ? `active` : `inactive`}</p>
        </div>

        <button onClick={this.onClick}>Change my state</button>
      </div>
    );
  }
}

export default PageOne;
