import React, { PropTypes, Component } from 'react';

type Inject = Object | (props: Object) => Object;

let injectorIndex = 0;

const Injector = (args: { to: Object, inject: Inject }) => {
  const { to, inject } = args;

  injectorIndex++;
  const injectorId = `injector_${injectorIndex}`;

  return function WrapComponent(WrappedComponent) {
    class InjectorComponent extends Component {
      static contextTypes = {
        registerInjector: PropTypes.func.isRequired,
        updateInjector: PropTypes.func.isRequired,
        removeInjector: PropTypes.func.isRequired
      };

      componentWillMount() {
        this.context.registerInjector({
          injectionId: to.injectionId,
          injectorId,
          injector: this,
          inject: () => {
            if (typeof inject === `function`) {
              return inject(this.props);
            }
            return inject;
          }
        });
      }

      componentWillUpdate(nextProps) {
        this.context.updateInjector({
          injectionId: to.injectionId,
          injector: this,
          inject: () => {
            if (typeof inject === `function`) {
              return inject(nextProps);
            }
            return inject;
          }
        });
      }

      componentWillUnmount() {
        this.context.removeInjector({
          injectionId: to.injectionId,
          injector: this
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
