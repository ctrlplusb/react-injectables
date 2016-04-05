/* eslint-disable react/no-multi-comp */

// Libraries and Utils.
import React, { Children, PropTypes, Component } from 'react';
import { containsUniq } from './utils';

let injectablesIndex = 0;

function KeyedComponent({ children }) {
  return Children.only(children);
}

//
/**
 * :: [Element] -> [Element]
 *
 * Ensures the given react elements have 'key' properties on them.
 *
 * @param  prefix
 *   The prefix for the keys.
 * @param  items
 *   The react elements.
 *
 * @return The keyed react elements.
 */
function keyedElements(prefix : string, items : Array<Object>) {
  let index = 0;
  return items.map(x => {
    index++;
    return <KeyedComponent key={`${prefix}_${index}`}>{x}</KeyedComponent>;
  });
}

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
            injected={keyedElements(namespace, this.state.injected)}
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
