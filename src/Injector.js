import React, { PropTypes, Component } from 'react';
import invariant from 'invariant';

const invalidTargetMsg =
  `Invalid Injectable target. Please provide a Component that has been wrapped ` +
  `Injectable wrapped Component.`;
const invalidInjectMsg =
  `Invalid injection value provided into Injector. You must supply a Component ` +
  `or stateless Component.`;

let injectorIndex = 0;

const Injector = ({ into } = {}) => {
  invariant(
    into &&
    typeof into === `function` &&
    into.injectionId &&
    into.contextTypes &&
    into.contextTypes.registerInjectable &&
    into.contextTypes.removeInjectable,
    // Error message
    invalidTargetMsg);

  injectorIndex++;
  const injectorId = `injector_${injectorIndex}`;

  return function WrapComponent(InjectionComponent) {
    invariant(
      InjectionComponent &&
      typeof InjectionComponent === `function`,
      invalidInjectMsg
    );

    class InjectorComponent extends Component {
      static contextTypes = {
        registerInjector: PropTypes.func.isRequired,
        updateInjector: PropTypes.func.isRequired,
        removeInjector: PropTypes.func.isRequired
      };

      componentWillMount() {
        this.context.registerInjector({
          injectionId: into.injectionId,
          injectorId,
          injectorInstance: this,
          inject: () => <InjectionComponent {...this.props} />
        });
      }

      componentWillUpdate(nextProps) {
        this.context.updateInjector({
          injectionId: into.injectionId,
          injectorId,
          injectorInstance: this,
          inject: () => <InjectionComponent {...nextProps} />
        });
      }

      componentWillUnmount() {
        this.context.removeInjector({
          injectionId: into.injectionId,
          injectorId,
          injectorInstance: this
        });
      }

      render() {
        return null;
      }
    }

    return InjectorComponent;
  };
};

export default Injector;
