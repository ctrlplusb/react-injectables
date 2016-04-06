import React, { PropTypes, Component } from 'react';

const Injector = (args: { to: Object, elements : Array<Object> }) => {
  const { to, elements } = args;

  return function WrapComponent(WrappedComponent) {
    class InjectorComponent extends Component {
      static contextTypes = {
        produceElements: PropTypes.func.isRequired,
        removeProducer: PropTypes.func.isRequired
      };

      componentWillMount() {
        this.context.produceElements({
          injectionId: to.injectionId,
          injector: this,
          elements
        });
      }

      componentWillUnmount() {
        this.context.removeProducer({
          injectionId: to.injectionId, injector: this
        });
      }

      render() {
        return (<WrappedComponent {...this.props} />);
      }
    }

    return InjectorComponent;
  };
};

export default Injector;
