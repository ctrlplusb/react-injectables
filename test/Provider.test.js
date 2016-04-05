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

  before(() => {
    const Provider = require(`../src/Provider`).default;
    instance = new Provider();
    element1 = (<div>foo</div>);
    element2 = (<div>foo</div>);
    consumed1 = [];
    consumed2 = [];
    consumer1 = (elements) => { consumed1 = elements; };
    consumer2 = (elements) => { consumed2 = elements; };
    producer1 = {};
    producer2 = {};
    producer3 = {};
  });

  it(`Then a newly added consumer should initially receive now elements`, () => {
    instance.consumeElements({
      namespace: `foo`,
      consumer: consumer1
    });

    const expected = [];
    const actual = consumed1;
    expect(actual).to.eql(expected);
  });

  it(`Then a produced element should be consumed`, () => {
    instance.produceElements({
      namespace: `foo`,
      producer: producer1,
      elements: [element1]
    });

    const expected = [element1];
    const actual = consumed1;
    expect(actual).to.eql(expected);
  });

  it(`Then a removed producer should update the consumer`, () => {
    instance.removeProducer({
      namespace: `foo`,
      producer: producer1
    });

    const expected = [];
    const actual = consumed1;
    expect(actual).to.eql(expected);
  });

  it(`Then a removed consumer should not recieve any more produced elements`, () => {
    instance.stopConsumingElements({
      namespace: `foo`,
      consumer: consumer1
    });
    instance.produceElements({
      namespace: `foo`,
      producer: producer1,
      elements: [element1]
    });

    const expected = [];
    const actual = consumed1;
    expect(actual).to.eql(expected);
  });

  it(`Then new consumers should both recieve elements that were already produced`, () => {
    instance.consumeElements({
      namespace: `foo`,
      consumer: consumer1
    });
    instance.consumeElements({
      namespace: `foo`,
      consumer: consumer2
    });

    const expected = [element1];
    const actual = consumed1;
    expect(actual).to.eql(expected);

    const actual2 = consumed2;
    expect(actual2).to.eql(expected);
  });

  it(`Then a duplicate producer should result in no change to element consumption`, () => {
    instance.produceElements({
      namespace: `foo`,
      producer: producer1,
      elements: [element2]
    });

    const expected = [element1];
    const actual = consumed1;
    expect(actual).to.eql(expected);

    const actual2 = consumed2;
    expect(actual2).to.eql(expected);
  });

  it(`Then a new producer with an existing element should result in no consumption change`, () => {
    instance.produceElements({
      namespace: `foo`,
      producer: producer2,
      elements: [element1]
    });

    const expected = [element1];
    const actual = consumed1;
    expect(actual).to.eql(expected);

    const actual2 = consumed2;
    expect(actual2).to.eql(expected);
  });

  it(`Then a new producer with an new element should result in 2 element consumption`, () => {
    instance.produceElements({
      namespace: `foo`,
      producer: producer3,
      elements: [element2]
    });

    const expected = [element1, element2];
    const actual = consumed1;
    expect(actual).to.eql(expected);

    const actual2 = consumed2;
    expect(actual2).to.eql(expected);
  });

  it(`Then removing producer 2 should result in no consumption changes`, () => {
    instance.removeProducer({
      namespace: `foo`,
      producer: producer2
    });

    const expected = [element1, element2];
    const actual = consumed1;
    expect(actual).to.eql(expected);

    const actual2 = consumed2;
    expect(actual2).to.eql(expected);
  });

  it(`Then removing the all producers should result in all consumptions being zeroed`, () => {
    instance.removeProducer({
      namespace: `foo`,
      producer: producer1
    });
    instance.removeProducer({
      namespace: `foo`,
      producer: producer3
    });

    const expected = [];
    const actual = consumed1;
    expect(actual).to.eql(expected);

    const actual2 = consumed2;
    expect(actual2).to.eql(expected);
  });
});
