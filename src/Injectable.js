import React, { PropTypes, Component } from 'react';
import { containsUniq, keyedElements } from './utils';

let injectionIndex = 0;

const Injectable = (WrappedComponent) => {
  injectionIndex++;
  const injectionId = `injection_${injectionIndex}`;

  class InjectableComponent extends Component {
    static injectionId = injectionId;

    static contextTypes = {
      consumeElements: PropTypes.func.isRequired,
      stopConsumingElements: PropTypes.func.isRequired
    };

    state = {
      injected: []
    }

    componentWillMount() {
      this.context.consumeElements({
        injectionId: InjectableComponent.injectionId,
        injectable: this
      });
    }

    componentWillUnmount() {
      this.context.stopConsumingElements({ listener: this });
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
