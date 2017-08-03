import React, { Component } from 'react';
import PropTypes from 'prop-types';
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
        const sortedElements = elements.sort((a, b) => {
          if (typeof a.props.position !== `number`) {
            if (typeof b.props.position !== `number`) {
              return 0;
            }
            return 1;
          }
          if (typeof b.props.position !== `number`) {
            return -1;
          }
          return a.props.position - b.props.position;
        });
        this.setState({ injections: sortedElements });
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
