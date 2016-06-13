import React from 'react';
import { expect } from 'chai';

// Under test.
import Provider from '../src/InjectablesProvider';

describe(`Given the Injectables Provider`, () => {
  let instance;

  beforeEach(() => {
    instance = new Provider();
  });

  it(`Then a newly added injectable should not receive any elements`, () => {
    let receivedInjections = [];

    instance.registerInjectable({
      injectionId: `foo`,
      injectableInstance: () => <div>foo</div>,
      receive: (elements) => { receivedInjections = elements; }
    });

    expect(receivedInjections).to.eql([]);
  });

  it(`Then injector registration, update, and removal should affect injectables`, () => {
    // Register injectable
    let receivedInjections = [];
    instance.registerInjectable({
      injectionId: `foo`,
      injectableInstance: () => <div>foo</div>,
      receive: (elements) => { receivedInjections = elements; }
    });

    // Register injector.
    const injection = <div>injection</div>;
    const injectorInstance = () => null;
    instance.registerInjector({
      injectionId: `foo`,
      injectorId: `injector1`,
      injectorInstance,
      inject: () => injection
    });
    expect(receivedInjections).to.eql([injection]);

    // Update injector
    const newInjection = <div>new injection</div>;
    instance.updateInjector({
      injectionId: `foo`,
      injectorId: `injector1`,
      injectorInstance,
      inject: () => newInjection
    });
    expect(receivedInjections).to.eql([newInjection]);

    // Remove injector
    instance.removeInjector({
      injectionId: `foo`,
      injectorId: `injector1`,
      injectorInstance
    });
    expect(receivedInjections).to.eql([]);
  });

  it(`Then a removed injectable should not receive any injections`, () => {
    // Register injectable
    const injectableInstance = () => null;
    let receivedInjections = [];
    instance.registerInjectable({
      injectionId: `foo`,
      injectableInstance,
      receive: (elements) => { receivedInjections = elements; }
    });
    expect(receivedInjections).to.eql([]);

    // Remove injectable
    instance.removeInjectable({
      injectionId: `foo`,
      injectableInstance
    });

    // Register injector.
    const injection = <div>injection</div>;
    const injectorInstance = () => null;
    instance.registerInjector({
      injectionId: `foo`,
      injectorId: `injector1`,
      injectorInstance,
      inject: () => injection
    });

    expect(receivedInjections).to.eql([]);
  });

  it(`Then multiple injectables should recieve existing injections`, () => {
    // Register injector.
    const injection = <div>injection</div>;
    const injectorInstance = () => null;
    instance.registerInjector({
      injectionId: `foo`,
      injectorId: `injector1`,
      injectorInstance,
      inject: () => injection
    });

    // Register injectable
    const injectableInstance = () => null;
    let receivedInjections = [];
    instance.registerInjectable({
      injectionId: `foo`,
      injectableInstance,
      receive: (elements) => { receivedInjections = elements; }
    });
    expect(receivedInjections).to.eql([injection]);

    // Register injectable
    const injectableInstanceTwo = () => null;
    let receivedInjectionsTwo = [];
    instance.registerInjectable({
      injectionId: `foo`,
      injectableInstance: injectableInstanceTwo,
      receive: (elements) => { receivedInjectionsTwo = elements; }
    });
    expect(receivedInjectionsTwo).to.eql([injection]);
  });

  it(`Then a duplicate injector instance registration should result in an error`, () => {
    // Register injector.
    const injection = <div>injection</div>;
    const injectorInstance = () => null;
    instance.registerInjector({
      injectionId: `foo`,
      injectorId: `injector1`,
      injectorInstance,
      inject: () => injection
    });

    // Re-Register injector.
    const duplicateRegister = () =>
      instance.registerInjector({
        injectionId: `foo`,
        injectorId: `injector1`,
        injectorInstance,
        inject: () => injection
      });

    expect(duplicateRegister).to.throw(/An Injector instance is being registered multiple times/);
  });

  it(`Then multiple unique injectors should result in multiple injection changes`, () => {
    // Register injectable
    const injectableInstance = () => null;
    let receivedInjections = [];
    instance.registerInjectable({
      injectionId: `foo`,
      injectableInstance,
      receive: (elements) => { receivedInjections = elements; }
    });

    // Register injector one.
    const injection = <div>injection</div>;
    const injectorInstance = () => null;
    instance.registerInjector({
      injectionId: `foo`,
      injectorId: `injector1`,
      injectorInstance,
      inject: () => injection
    });
    expect(receivedInjections).to.eql([injection]);

    // Register injector two.
    const injectionTwo = <div>injection 2</div>;
    const injectorInstanceTwo = () => null;
    instance.registerInjector({
      injectionId: `foo`,
      injectorId: `injector2`,
      injectorInstanceTwo,
      inject: () => injectionTwo
    });
    expect(receivedInjections).to.eql([injection, injectionTwo]);

    // Remove injector one.
    instance.removeInjector({
      injectionId: `foo`,
      injectorId: `injector1`,
      injectorInstance
    });
    expect(receivedInjections).to.eql([injectionTwo]);

    // Remove injector two.
    instance.removeInjector({
      injectionId: `foo`,
      injectorId: `injector2`,
      injectorInstanceTwo
    });
    expect(receivedInjections).to.eql([]);
  });

  it(`Then removing all Injectors and Injectables should clear registrations`, () => {
    // Register two injectables.
    const injectableInstance = () => null;
    instance.registerInjectable({
      injectionId: `foo`,
      injectableInstance,
      receive: () => undefined
    });
    const injectableInstanceTwo = () => null;
    instance.registerInjectable({
      injectionId: `foo`,
      injectableInstanceTwo,
      receive: () => undefined
    });
    // Register two injector.
    const injectorInstance = () => null;
    instance.registerInjector({
      injectionId: `foo`,
      injectorId: `injector1`,
      injectorInstance,
      inject: () => <div>injection</div>
    });
    const injectorInstanceTwo = () => null;
    instance.registerInjector({
      injectionId: `foo`,
      injectorId: `injector2`,
      injectorInstanceTwo,
      inject: () => <div>injection</div>
    });

    expect(instance.registrations.length).to.equal(1);

    // Remove injectables.
    instance.removeInjectable({
      injectionId: `foo`,
      injectableInstance
    });
    instance.removeInjectable({
      injectionId: `foo`,
      injectableInstanceTwo
    });
    // Remove injectors.
    instance.removeInjector({
      injectionId: `foo`,
      injectorId: `injector2`,
      injectorInstance
    });
    instance.removeInjector({
      injectionId: `foo`,
      injectorId: `injector2`,
      injectorInstanceTwo
    });

    expect(instance.registrations.length).to.equal(0);
  });
});
