import React, { PropTypes, Component } from 'react';
import { containsUniq, keyedElements } from './utils';

let injectionIdIndex = 0;

const Injectable = (WrappedComponent) => {
  injectionIdIndex++;
  const injectionId = `injectionId_${injectionIdIndex}`;

  class InjectableComponent extends Component {
    static injectionId = injectionId;

    static contextTypes = {
      registerInjectable: PropTypes.func.isRequired,
      removeInjectable: PropTypes.func.isRequired
    };

    state = {
      injected: []
    }

    componentWillMount() {
      this.context.registerInjectable({
        injectionId,
        injectable: this
      });
    }

    componentWillUnmount() {
      this.context.removeInjectable({
        injectionId,
        injectable: this
      });
    }

    consume = (elements) => {
      if (elements.length !== this.state.injected.length ||
          containsUniq(this.state.injected, elements)) {
        this.setState({ injected: elements });
      }
    }

    render() {
      return (
        <WrappedComponent
          injected={keyedElements(`injected`, this.state.injected)}
          {...this.props}
        />
      );
    }
  }

  return InjectableComponent;
};

export default Injectable;
