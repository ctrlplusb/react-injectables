import React, { Component, PropTypes } from 'react';
import { Injector } from '../../../src/index.js';
import InjectableHeader from './InjectableHeader';

const Content = ({ active }) => (
  <div>
    <p>I am page one.</p>
    <p>My State is {active ? `active` : `inactive`}</p>
  </div>
);
Content.propTypes = {
  active: PropTypes.bool.isRequired
};

const Inject = ({ active }) => (
  <div>
    <p>Injection from Page One</p>
    <p>The active prop value is: {active ? `active` : `inactive`}</p>
  </div>
);
Inject.propTypes = {
  active: PropTypes.bool.isRequired
};

const InjectingContent = Injector({
  to: InjectableHeader,
  inject: Inject
})(Content);

/**
 * We wrap our injecting content with a class based component so we can track
 * state and pass down props, thereby adding behaviour.
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
        <InjectingContent active={active} />

        <button onClick={this.onClick}>Change my state</button>
      </div>
    );
  }
}

export default PageOne;
