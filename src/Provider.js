import { Children, Component, PropTypes } from 'react';
import { compose, find, filter, map, uniqBy, without, withoutAll } from './utils';

class InjectablesProvider extends Component {
  static childContextTypes = {
    registerInjector: PropTypes.func.isRequired,
    removeInjector: PropTypes.func.isRequired,
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

      registerInjectable: (args) => this.registerInjectable(args),

      removeInjectable: (args) => this.removeInjectable(args)
    };
  }

  getRegistration(args: { injectionId: string }) {
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

  runInjections(args: { registration: Object }) {
    const { registration } = args;
    const { injectables, injections } = registration;

    const elements = compose(
      filter(x => x !== null && x !== undefined),
      map(x => x.injector.getInjectElement()),
      uniqBy(`injectorId`)
    )(injections);

    injectables.forEach(injectable => {
      injectable.consume(elements);
    });
  }

  removeRegistration(args: { registration: Object }) {
    const { registration } = args;
    this.registrations = without(registration)(this.registrations);
  }

  registerInjectable(args: { injectionId: string, injectable: Object}) {
    const { injectionId, injectable } = args;
    const registration = this.getRegistration({ injectionId });

    if (withoutAll(registration.injectables)([injectable]).length > 0) {
      registration.injectables = [...registration.injectables, injectable];
      this.runInjections({ registration });  // First time consumption.
    }
  }

  removeInjectable(args: { injectionId: string, injectable: Object }) {
    const { injectionId, injectable } = args;
    const registration = this.getRegistration({ injectionId });

    const injectables = without(injectable)(registration.injectables);

    if (injectables.length === 0 && registration.injections.length === 0) {
      this.removeRegistration({ registration });
    } else {
      registration.injectables = injectables;
    }
  }

  findInjection({ registration, injector }) {
    return find(x => Object.is(x.injector, injector))(registration.injections);
  }

  registerInjector(args: { injectionId: string, injectorId: string, injector: Object }) {
    const { injectionId, injectorId, injector } = args;
    const registration = this.getRegistration({ injectionId });
    const existingInjection = this.findInjection({ registration, injector });

    if (existingInjection) {
      return;
    }

    const newInjection = { injector, injectorId };
    registration.injections = [
      ...registration.injections,
      newInjection
    ];

    this.runInjections({ registration });
  }

  removeInjector(args: { injectionId: string, injector: Object }) {
    const { injectionId, injector } = args;
    const registration = this.getRegistration({ injectionId });
    const injection = this.findInjection({ registration, injector });

    if (injection) {
      registration.injections = without(injection)(registration.injections);
      this.runInjections({ registration });
    } else {
      /* istanbul ignore next */
      if (process.env.NODE_ENV === `development`) {
        throw new Error(
          `Trying to remove an injector which has not been registered`);
      }
    }
  }

  render() {
    return (
      Children.only(this.props.children)
    );
  }
}

export default InjectablesProvider;
