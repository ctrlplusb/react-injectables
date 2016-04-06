import React from 'react';
import { expect } from 'chai';

describe(`Given the Injectables Provider`, () => {
  let instance;
  let element1;
  let element2;
  let consumer1;
  let consumer2;
  let consumed1;
  let consumed2;
  let producer1;
  let producer2;
  let producer3;
  let inject1;
  let inject2;

  before(() => {
    const Provider = require(`../src/Provider`).default;
    instance = new Provider();
    element1 = (<div>foo</div>);
    element2 = (<div>foo</div>);
    consumed1 = [];
    consumed2 = [];
    consumer1 = { consume: (elements) => { consumed1 = elements; } };
    consumer2 = { consume: (elements) => { consumed2 = elements; } };
    producer1 = {};
    producer2 = {};
    inject1 = () => element1;
    inject2 = () => element2;
  });

  it(`Then a newly added consumer should initially receive now elements`, () => {
    instance.registerInjectable({
      injectionId: `foo`,
      injectable: consumer1
    });

    const expected = [];
    const actual = consumed1;
    expect(actual).to.eql(expected);
  });

  it(`Then a produced element should be consumed`, () => {
    instance.registerInjector({
      injectionId: `foo`,
      injectorId: `injector1`,
      injector: producer1,
      inject: inject1
    });

    const expected = [element1];
    const actual = consumed1;
    expect(actual).to.eql(expected);
  });

  it(`Then a removed producer should update the consumer`, () => {
    instance.removeInjector({
      injectionId: `foo`,
      injector: producer1
    });

    const expected = [];
    const actual = consumed1;
    expect(actual).to.eql(expected);
  });

  it(`Then a removed consumer should not recieve any more produced elements`, () => {
    instance.removeInjectable({
      injectionId: `foo`,
      injectable: consumer1
    });
    instance.registerInjector({
      injectionId: `foo`,
      injectorId: `injector1`,
      injector: producer1,
      inject: inject1
    });

    const expected = [];
    const actual = consumed1;
    expect(actual).to.eql(expected);
  });

  it(`Then new consumers should both recieve elements that were already produced`, () => {
    instance.registerInjectable({
      injectionId: `foo`,
      injectable: consumer1
    });
    instance.registerInjectable({
      injectionId: `foo`,
      injectable: consumer2
    });

    const expected = [element1];
    const actual = consumed1;
    expect(actual).to.eql(expected);

    const actual2 = consumed2;
    expect(actual2).to.eql(expected);
  });

  it(`Then a duplicate producer should result in no change to element consumption`, () => {
    instance.registerInjector({
      injectionId: `foo`,
      injectorId: `injector1`,
      injector: producer1,
      inject: inject1
    });

    const expected = [element1];
    const actual = consumed1;
    expect(actual).to.eql(expected);

    const actual2 = consumed2;
    expect(actual2).to.eql(expected);
  });

  it(`Then a duplicate producer registration should result in no consumption change`, () => {
    instance.registerInjector({
      injectionId: `foo`,
      injectorId: `injector1`,
      injector: producer1,
      inject: inject1
    });

    const expected = [element1];
    const actual = consumed1;
    expect(actual).to.eql(expected);

    const actual2 = consumed2;
    expect(actual2).to.eql(expected);
  });

  it(`Then a new producer with an new element should result in 2 element consumption`, () => {
    instance.registerInjector({
      injectionId: `foo`,
      injectorId: `injector2`,
      injector: producer2,
      inject: inject2
    });

    const expected = [element1, element2];
    const actual = consumed1;
    expect(actual).to.eql(expected);

    const actual2 = consumed2;
    expect(actual2).to.eql(expected);
  });

  it(`Then removing producer 2 should result in a consumption change`, () => {
    instance.removeInjector({
      injectionId: `foo`,
      injector: producer2
    });

    const expected = [element1];
    const actual = consumed1;
    expect(actual).to.eql(expected);

    const actual2 = consumed2;
    expect(actual2).to.eql(expected);
  });

  it(`Then removing the all producers should result in all consumptions being zeroed`, () => {
    instance.removeInjector({
      injectionId: `foo`,
      injector: producer1
    });

    const expected = [];
    const actual = consumed1;
    expect(actual).to.eql(expected);

    const actual2 = consumed2;
    expect(actual2).to.eql(expected);
  });
});
