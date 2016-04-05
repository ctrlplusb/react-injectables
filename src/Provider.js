// Libraries and Utils.
import { Children, Component, PropTypes } from 'react';
import { compose, concatAll, find, map, uniq, without, withoutAll } from './utils';

class InjectablesProvider extends Component {
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

  getRegistration(args: { namespace: string }) {
    const { namespace } = args;

    let registration = find(x => x.namespace === namespace)(this.registrations);

    if (!registration) {
      // Need to create the registration.
      registration = {
        namespace,
        consumers: [],
        producers: []
      };

      this.registrations.push(registration);
    }

    return registration;
  }

  notifyConsumers(args: { registration: Object }) {
    const { registration } = args;
    const { consumers, producers } = registration;

    const elements = compose(
      uniq,
      concatAll,
      map(x => x.elements)
    )(producers);

    consumers.forEach(consumer => {
      consumer(elements);
    });
  }

  removeRegistration(args: { registration: Object }) {
    const { registration } = args;
    this.registrations = without(registration)(this.registrations);
  }

  consumeElements(args: { namespace: string, consumer: Function}) {
    const { namespace, consumer } = args;
    const registration = this.getRegistration({ namespace });

    if (withoutAll(registration.consumers)([consumer]).length > 0) {
      registration.consumers = [...registration.consumers, consumer];
      this.notifyConsumers({ registration });  // First time consumption.
    }
  }

  stopConsumingElements(args: { namespace: string, consumer: Function }) {
    const { consumer, namespace } = args;
    const registration = this.getRegistration({ namespace });

    const consumers = without(consumer)(registration.consumers);

    if (consumers.length === 0 && registration.producers.length === 0) {
      this.removeRegistration({ registration });
    } else {
      registration.consumers = consumers;
    }
  }

  findProducer({ registration, producer }) {
    return find(x => Object.is(x.producer, producer))(registration.producers);
  }

  produceElements(args: { namespace: string, producer: Object, elements: Array<Object> }) {
    const { namespace, producer, elements } = args;
    const registration = this.getRegistration({ namespace });
    const existingProducer = this.findProducer({ registration, producer });

    if (existingProducer) {
      return;
    }

    const newProducer = { producer, elements };
    registration.producers = [
      ...registration.producers,
      newProducer
    ];
    this.notifyConsumers({ registration });
  }

  removeProducer(args: { namespace: string, producer: Object }) {
    const { namespace, producer } = args;
    const registration = this.getRegistration({ namespace });
    const existingProducer = this.findProducer({ registration, producer });
    registration.producers = without(existingProducer)(registration.producers);
    this.notifyConsumers({ registration });
  }

  render() {
    return (
      Children.only(this.props.children)
    );
  }
}

InjectablesProvider.childContextTypes = {
  produceElements: PropTypes.func.isRequired,
  removeProducer: PropTypes.func.isRequired,
  consumeElements: PropTypes.func.isRequired,
  stopConsumingElements: PropTypes.func.isRequired,
};

InjectablesProvider.propTypes = {
  children: PropTypes.element
};

export default InjectablesProvider;
