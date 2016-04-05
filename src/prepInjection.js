/* eslint-disable react/no-multi-comp */

// Libraries and Utils.
import React, { PropTypes, Component } from 'react';
import { containsUniq } from './utils';

let injectablesIndex = 0;

function createInjectable(config) {
  const { namespace } = config;

  return function WrapComponent(WrappedComponent) {
    class InjectableComponent extends Component {
      state = {
        injected: []
      }

      componentWillMount() {
        this.context.consumeElements({
          namespace,
          consumer: this.consumeElements
        });
      }

      componentWillUnmount() {
        this.context.stopConsumingElements({ listener: this });
      }

      consumeElements = (elements) => {
        if (elements.length !== this.state.injected.length ||
            containsUniq(this.state.injected, elements)) {
          this.setState({ injected: elements });
        }
      }

      render() {
        return (
          <WrappedComponent
            injected={this.state.injected}
            {...this.props}
          />
        );
      }
    }

    InjectableComponent.contextTypes = {
      consumeElements: PropTypes.func.isRequired,
      stopConsumingElements: PropTypes.func.isRequired
    };

    return InjectableComponent;
  };
}

function createInjector({ namespace }) {
  return function Injector(elements : Array<Object>) {
    return function WrapComponent(WrappedComponent) {
      class InjectorComponent extends Component {
        componentWillMount() {
          this.context.produceElements({
            namespace,
            producer: this,
            elements
          });
        }

        componentWillUnmount() {
          this.context.removeProducer({ namespace, producer: this });
        }

        render() {
          return (<WrappedComponent {...this.props} />);
        }
      }

      InjectorComponent.contextTypes = {
        produceElements: PropTypes.func.isRequired,
        removeProducer: PropTypes.func.isRequired
      };

      return InjectorComponent;
    };
  };
}

function prepInjection() {
  injectablesIndex++;

  const namespace = `injectables_${injectablesIndex}`;

  const Injectable = createInjectable({ namespace });
  const Injector = createInjector({ namespace });

  return {
    Injectable,
    Injector
  };
}

export default prepInjection;
