import React, { PropTypes, Component } from 'react';
import { containsUniq, keyedElements } from './utils';

let injectionIdIndex = 0;

const Injectable = (VeinComponent) => {
  injectionIdIndex++;
  const injectionId = `injectionId_${injectionIdIndex}`;

  class InjectableComponent extends Component {
    static injectionId = injectionId;

    static contextTypes = {
      registerInjectable: PropTypes.func.isRequired,
      removeInjectable: PropTypes.func.isRequired
    };

    state = {
      injections: []
    }

    componentWillMount() {
      this.context.registerInjectable({
        injectionId,
        injectableInstance: this,
        receive: (elements) => this.consume(elements)
      });
    }

    componentWillUnmount() {
      this.context.removeInjectable({
        injectionId,
        injectableInstance: this
      });
    }

    consume = (elements) => {
      if (elements.length !== this.state.injections.length ||
          containsUniq(this.state.injections, elements)) {
        this.setState({ injections: elements });
      }
    }

    render() {
      const keyed = keyedElements(`injections`, this.state.injections);

      return (
        <VeinComponent
          injections={keyed}
          {...this.props}
        />
      );
    }
  }

  return InjectableComponent;
};

export default Injectable;
