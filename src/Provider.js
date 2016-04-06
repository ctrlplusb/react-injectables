import { Children, Component, PropTypes } from 'react';
import { compose, concatAll, find, map, uniq, without, withoutAll } from './utils';

class InjectablesProvider extends Component {
  static childContextTypes = {
    produceElements: PropTypes.func.isRequired,
    removeProducer: PropTypes.func.isRequired,
    consumeElements: PropTypes.func.isRequired,
    stopConsumingElements: PropTypes.func.isRequired,
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
      produceElements: (args) => this.produceElements(args),

      removeProducer: (args) => this.removeProducer(args),

      consumeElements: (args) => this.consumeElements(args),

      stopConsumingElements: (args) => this.stopConsumingElements(args)
    };
  }

  getRegistration(args: { injectionId: string }) {
    const { injectionId } = args;

    let registration = find(
        x => x.injectionId === injectionId
      )(this.registrations);

    if (!registration) {
      // Need to create the registration.
      registration = {
        injectionId,
        injectables: [],
        injectors: []
      };

      this.registrations.push(registration);
    }

    return registration;
  }

  notifyConsumers(args: { registration: Object }) {
    const { registration } = args;
    const { injectables, injectors } = registration;

    const elements = compose(
      uniq,
      concatAll,
      map(x => x.elements)
    )(injectors);

    injectables.forEach(injectable => {
      injectable.consume(elements);
    });
  }

  removeRegistration(args: { registration: Object }) {
    const { registration } = args;
    this.registrations = without(registration)(this.registrations);
  }

  consumeElements(args: { injectionId: string, injectable: Object}) {
    const { injectionId, injectable } = args;
    const registration = this.getRegistration({ injectionId });

    if (withoutAll(registration.injectables)([injectable]).length > 0) {
      registration.injectables = [...registration.injectables, injectable];
      this.notifyConsumers({ registration });  // First time consumption.
    }
  }

  stopConsumingElements(args: { injectionId: string, injectable: Object }) {
    const { injectionId, injectable } = args;
    const registration = this.getRegistration({ injectionId });

    const injectables = without(injectable)(registration.injectables);

    if (injectables.length === 0 && registration.injectors.length === 0) {
      this.removeRegistration({ registration });
    } else {
      registration.injectables = injectables;
    }
  }

  findProducer({ registration, injector }) {
    return find(x => Object.is(x.injector, injector))(registration.injectors);
  }

  produceElements(args: { injectionId: string, injector: Object, elements: Array<Object> }) {
    const { injectionId, injector, elements } = args;
    const registration = this.getRegistration({ injectionId });
    const existingProducer = this.findProducer({ registration, injector });

    if (existingProducer) {
      return;
    }

    const newInjector = { injector, elements };
    registration.injectors = [
      ...registration.injectors,
      newInjector
    ];
    this.notifyConsumers({ registration });
  }

  removeProducer(args: { injectionId: string, injector: Object }) {
    const { injectionId, injector } = args;
    const registration = this.getRegistration({ injectionId });
    const existingInjector = this.findProducer({ registration, injector });
    registration.injectors = without(existingInjector)(registration.injectors);
    this.notifyConsumers({ registration });
  }

  render() {
    return (
      Children.only(this.props.children)
    );
  }
}

export default InjectablesProvider;
