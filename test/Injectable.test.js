/* eslint-disable react/no-multi-comp */

import React, { Component } from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { mount } from 'enzyme';

describe(`Given the Injector interface`, () => {
  const Injectable = require(`../src/Injectable`).default;

  describe(`When creating an Injectable`, () => {
    function assertIsValidInjectable(injectableInstance) {
      const actual = typeof injectableInstance === `function` &&
        !!injectableInstance.contextTypes &&
        !!injectableInstance.contextTypes.registerInjectable &&
        !!injectableInstance.contextTypes.removeInjectable;

      const expected = true;

      expect(actual).to.equal(expected, `Invalid Injectable created.`);
    }

    it(`It should allow use of a stateless component`, () => {
      const StatelessComponent = () => <div>bar</div>;
      const InjectableBob = Injectable(StatelessComponent);
      assertIsValidInjectable(InjectableBob);
    });

    it(`It should allow use of an ES6 class based component`, () => {
      class ClassComponent extends Component {
        state = { bob: `baz` }
        render() {
          return <div>foo</div>;
        }
      }
      const InjectableBob = Injectable(ClassComponent);
      assertIsValidInjectable(InjectableBob);
    });

    it(`It should allow use of a React.createClass based component`, () => {
      const CreateClassComponent =
        React.createClass({ // eslint-disable-line react/prefer-es6-class
          state: { foo: `bar` },
          render() {
            return <div>foo</div>;
          }
        });
      const InjectableBob = Injectable(CreateClassComponent);
      assertIsValidInjectable(InjectableBob);
    });
  });

  describe(`When using an Injectable Component`, () => {
    let InjectableComponentBob;
    let context;

    beforeEach(() => {
      InjectableComponentBob = Injectable(({ injections }) => <div>{injections}</div>);

      context = {
        registerInjectable: sinon.spy(),
        removeInjectable: sinon.spy()
      };
    });

    it(`It should have an "injectionId" static set`, () => {
      expect(InjectableComponentBob.injectionId)
        .to.match(/^injectionId_[\d]+$/);
    });

    it(`It should not render anything when initially mounted`, () => {
      const mounted = mount(<InjectableComponentBob />, { context });

      expect(mounted.html()).to.equal(`<div></div>`);
    });

    it(`It should call the correct context items on mount`, () => {
      const mounted = mount(<InjectableComponentBob />, { context });

      expect(context.registerInjectable.callCount).to.equal(1);
      expect(context.removeInjectable.callCount).to.equal(0);

      const {
        injectionId: actualInjectionId,
        injectableInstance: actualInjectableInstance,
        receive: actualReceive
      } = context.registerInjectable.args[0][0];

      expect(actualInjectionId).to.equal(InjectableComponentBob.injectionId);
      expect(actualInjectableInstance).to.equal(mounted.instance());
      expect(typeof actualReceive).to.equal(`function`);
    });

    it(`It should call the correct context items on unmount`, () => {
      const mounted = mount(<InjectableComponentBob />, { context });
      const actualInstance = mounted.instance();
      mounted.unmount();

      expect(context.registerInjectable.callCount).to.equal(1);
      expect(context.removeInjectable.callCount).to.equal(1);

      const {
        injectionId: actualInjectionId,
        injectableInstance: actualInjectableInstance
      } = context.registerInjectable.args[0][0];

      expect(actualInjectionId).to.equal(InjectableComponentBob.injectionId);
      expect(actualInjectableInstance).to.equal(actualInstance);
    });

    it(`It should render consumed injections`, () => {
      const mounted = mount(<InjectableComponentBob />, { context });

      const injectionOne = <div>injection 1</div>;
      const injectionTwo = <div>injection 2</div>;

      mounted.instance().consume([
        injectionOne,
        injectionTwo
      ]);

      expect(mounted.state(`injections`)).to.eql([injectionOne, injectionTwo]);
      expect(mounted.html())
        .to.equal(`<div><div>injection 1</div><div>injection 2</div></div>`);
    });

    it(`It should sort consumed injections if an position property exists`, () => {
      const mounted = mount(<InjectableComponentBob />, { context });

      const dummy = ({children}) => (<div>{children}</div>);
      const injectionOne = <dummy position={1}>injection 1</dummy>;
      const injectionTwo = <dummy position={2}>injection 2</dummy>;
      const injectionThree = <dummy position={3}>injection 3</dummy>;

      mounted.instance().consume([
        injectionTwo,
        injectionThree,
        injectionOne
      ]);

      expect(mounted.state(`injections`)).to.eql([injectionOne, injectionTwo, injectionThree]);
      expect(mounted.html())
          .to.equal(`<div><dummy>injection 1</dummy><dummy>injection 2</dummy><dummy>injection 3</dummy></div>`);
    });

    it(`It should sort consumed injections without an position property to the end`, () => {
      const mounted = mount(<InjectableComponentBob />, { context });

      const dummy = ({children}) => (<div>{children}</div>);
      const injectionOne = <dummy position={1}>injection 1</dummy>;
      const injectionTwo = <dummy position={2}>injection 2</dummy>;
      const injectionThree = <dummy>injection 3</dummy>;

      mounted.instance().consume([
        injectionTwo,
        injectionThree,
        injectionOne
      ]);

      expect(mounted.state(`injections`)).to.eql([injectionOne, injectionTwo, injectionThree]);
      expect(mounted.html())
          .to.equal(`<div><dummy>injection 1</dummy><dummy>injection 2</dummy><dummy>injection 3</dummy></div>`);
    });

    it(`It should not render duplicate elements`, () => {
      const mounted = mount(<InjectableComponentBob />, { context });

      const injectionOne = <div>injection 1</div>;

      mounted.instance().consume([injectionOne]);
      mounted.instance().consume([injectionOne]);

      expect(mounted.html())
        .to.equal(`<div><div>injection 1</div></div>`);
    });
  });
});
