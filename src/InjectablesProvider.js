import { Children, Component, PropTypes } from 'react';
import { compose, find, filter, map, uniqBy, without, withoutAll } from './utils';
import invariant from 'invariant';

class InjectablesProvider extends Component {
  static childContextTypes = {
    registerInjector: PropTypes.func.isRequired,
    removeInjector: PropTypes.func.isRequired,
    updateInjector: PropTypes.func.isRequired,
    registerInjectable: PropTypes.func.isRequired,
    removeInjectable: PropTypes.func.isRequired,
  };

  static propTypes = {
    children: PropTypes.element
  };

  constructor(props, context) {
    super(props, context);
    this.registrations = [];
  }

  getChildContext() {
    return {
      registerInjector: (args) => this.registerInjector(args),

      removeInjector: (args) => this.removeInjector(args),

      updateInjector: (args) => this.updateInjector(args),

      registerInjectable: (args) => this.registerInjectable(args),

      removeInjectable: (args) => this.removeInjectable(args)
    };
  }

  getRegistration(args) {
    const { injectionId } = args;

    let registration = find(
        x => x.injectionId === injectionId
      )(this.registrations);

    if (!registration) {
      registration = {
        injectionId,
        injectables: [],
        injections: []
      };

      this.registrations.push(registration);
    }

    return registration;
  }

  runInjections(args) {
    const { registration } = args;
    const { injectables, injections } = registration;

    const elements = compose(
      filter(x => x !== null && x !== undefined),
      map(x => x.inject()),
      uniqBy(`injectorId`)
    )(injections);

    injectables.forEach(injectable => {
      injectable.receive(elements);
    });
  }

  removeRegistration(args) {
    const { registration } = args;
    this.registrations = without(registration)(this.registrations);
  }

  findInjectable({ registration, injectableInstance }) {
    const isInjectableInstance = x => Object.is(x.instance, injectableInstance);
    return find(isInjectableInstance)(registration.injectables);
  }

  clearRegistrationIfEmpty({ registration }) {
    if (registration.injectables.length === 0 && registration.injections.length === 0) {
      this.removeRegistration({ registration });
    }
  }

  registerInjectable(args) {
    const { injectionId, injectableInstance, receive } = args;
    const registration = this.getRegistration({ injectionId });
    const injectable = this.findInjectable(
      { registration, injectableInstance });

    if (withoutAll(registration.injectables)([injectable]).length > 0) {
      const newInjectable = {
        instance: injectableInstance,
        receive
      };
      registration.injectables = [...registration.injectables, newInjectable];
      this.runInjections({ registration });  // First time consumption.
    }
  }

  removeInjectable(args) {
    const { injectionId, injectableInstance } = args;
    const registration = this.getRegistration({ injectionId });
    const injectable = this.findInjectable(
      { registration, injectableInstance });

    registration.injectables = without(injectable)(registration.injectables);

    this.clearRegistrationIfEmpty({ registration });
  }

  findInjection({ registration, injectorInstance }) {
    const isInjectorInstance = x => Object.is(x.instance, injectorInstance);
    return find(isInjectorInstance)(registration.injections);
  }

  findInjector({ registration, injectorId }) {
    const isInjectorId = x => x.injectorId === injectorId;
    return find(isInjectorId)(registration.injections);
  }

  registerInjector(args) {
    const { injectionId, injectorId, injectorInstance, inject } = args;
    const registration = this.getRegistration({ injectionId });
    const existingInjection = this.findInjection({ registration, injectorInstance });

    invariant(
      !existingInjection,
      `An Injector instance is being registered multiple times.`);

    if (process.env.NODE_ENV !== `production`) {
      const existingInjector = this.findInjector({ registration, injectorId });

      if (existingInjector && console && console.warn) { // eslint-disable-line no-console
        console.warn( // eslint-disable-line no-console
          `Multiple instances of an Injector has been found.  This may not be ` +
          `your intended behaviour`);
      }
    }

    const newInjection = {
      injectorId,
      instance: injectorInstance,
      inject
    };

    registration.injections = [
      ...registration.injections,
      newInjection
    ];

    this.runInjections({ registration });
  }

  updateInjector(args) {
    const { injectionId, injectorInstance, inject } = args;
    const registration = this.getRegistration({ injectionId });
    const existingInjection = this.findInjection({ registration, injectorInstance });

    invariant(
      existingInjection,
      `Trying to update an Injector that is not registered`);

    existingInjection.inject = inject;

    this.runInjections({ registration });
  }

  removeInjector(args) {
    const { injectionId, injectorInstance } = args;
    const registration = this.getRegistration({ injectionId });
    const injection = this.findInjection({ registration, injectorInstance });

    invariant(
      !!injection,
      `Trying to remove an injector which has not been registered`);

    registration.injections = without(injection)(registration.injections);
    this.runInjections({ registration });

    this.clearRegistrationIfEmpty({ registration });
  }

  render() {
    return (
      Children.only(this.props.children)
    );
  }
}

export default InjectablesProvider;
