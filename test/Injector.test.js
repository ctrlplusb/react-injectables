/* eslint-disable react/no-multi-comp */

import React, { Component } from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { mount } from 'enzyme';
import Injectable from '../src/Injectable';

// Under test.
import Injector from '../src/Injector';

describe(`Given the Injector interface`, () => {
  describe(`When creating an Injector`, () => {
    let ValidInjectable;

    function assertIsValidInjector(injectorInstance) {
      const actual = typeof injectorInstance === `function` &&
        !!injectorInstance.contextTypes &&
        !!injectorInstance.contextTypes.registerInjector &&
        !!injectorInstance.contextTypes.updateInjector &&
        !!injectorInstance.contextTypes.removeInjector;

      const expected = true;

      expect(actual).to.equal(expected, `Invalid Injector created.`);
    }

    beforeEach(() => {
      ValidInjectable = Injectable(() => <div>foo</div>);
    });

    it(`It should allow a stateless component for the injection`, () => {
      const StatelessComponentInjection = () => <div>bar</div>;
      const InjectorBob = Injector({
        into: ValidInjectable
      })(StatelessComponentInjection);
      assertIsValidInjector(InjectorBob);
    });

    it(`It should allow an ES6 class based component for the injection`, () => {
      class ClassComponentInjection extends Component {
        state = { bob: `baz` }
        render() {
          return <div>foo</div>;
        }
      }
      const InjectorBob = Injector({
        into: ValidInjectable
      })(ClassComponentInjection);
      assertIsValidInjector(InjectorBob);
    });

    it(`It should allow an React.createClass based component for the injection`, () => {
      class ComponentInjectionClass extends React.Component {
        constructor() {
          super();
          this.state = { foo: `bar` };
        }
        render() {
          return <div>foo</div>;
        }
      }
      const InjectorBob = Injector({
        into: ValidInjectable
      })(ComponentInjectionClass);
      assertIsValidInjector(InjectorBob);
    });
  });

  describe(`When using an Injector Component`, () => {
    let InjectorComponentBob;
    let InjectionComponent;
    let context;
    let injectionId;

    beforeEach(() => {
      const InjectableComponent = Injectable(() => <div>foo</div>);
      injectionId = InjectableComponent.injectionId;

      InjectionComponent = () =>
        <div>injection</div>;

      InjectorComponentBob = Injector({
        into: InjectableComponent
      })(InjectionComponent);

      context = {
        registerInjector: sinon.spy(),
        removeInjector: sinon.spy(),
        updateInjector: sinon.spy()
      };
    });

    it(`It should not render anything when mounted`, () => {
      const mounted = mount(<InjectorComponentBob />, { context });

      expect(mounted.html()).to.equal(null);
    });

    it(`It should call the correct context items on mount`, () => {
      const mounted = mount(<InjectorComponentBob />, { context });

      expect(context.registerInjector.callCount).to.equal(1);
      expect(context.updateInjector.callCount).to.equal(0);
      expect(context.removeInjector.callCount).to.equal(0);

      const {
        injectionId: actualInjectionId,
        injectorId: actualInjectorId,
        injectorInstance: actualInjectorInstance,
        inject: actualInject
      } = context.registerInjector.args[0][0];

      expect(actualInjectionId).to.equal(injectionId);
      expect(actualInjectorId).to.match(/^injector_[\d]+$/);
      expect(actualInjectorInstance).to.equal(mounted.instance());
      expect(typeof actualInject).to.equal(`function`);
      expect(
        mount(<div>{actualInject()}</div>)
          .find(InjectionComponent)
          .length
      ).to.equal(1);
    });

    it(`It should call the correct context items on updates`, () => {
      const mounted = mount(<InjectorComponentBob />, { context });
      mounted.update();

      expect(context.registerInjector.callCount).to.equal(1);
      expect(context.updateInjector.callCount).to.equal(1);
      expect(context.removeInjector.callCount).to.equal(0);

      const {
        injectionId: actualInjectionId,
        injectorId: actualInjectorId,
        injectorInstance: actualInjectorInstance,
        inject: actualInject
      } = context.updateInjector.args[0][0];

      expect(actualInjectionId).to.equal(injectionId);
      expect(actualInjectorId).to.match(/^injector_[\d]+$/);
      expect(actualInjectorInstance).to.equal(mounted.instance());
      expect(typeof actualInject).to.equal(`function`);
      expect(
        mount(<div>{actualInject()}</div>)
          .find(InjectionComponent)
          .length
      ).to.equal(1);
    });

    it(`It should call the correct context items on unmount`, () => {
      const mounted = mount(<InjectorComponentBob />, { context });
      const actualInstance = mounted.instance();
      mounted.unmount();

      expect(context.registerInjector.callCount).to.equal(1);
      expect(context.updateInjector.callCount).to.equal(0);
      expect(context.removeInjector.callCount).to.equal(1);

      const {
        injectionId: actualInjectionId,
        injectorId: actualInjectorId,
        injectorInstance: actualInjectorInstance
      } = context.removeInjector.args[0][0];

      expect(actualInjectionId).to.equal(injectionId);
      expect(actualInjectorId).to.match(/^injector_[\d]+$/);
      expect(actualInjectorInstance).to.equal(actualInstance);
    });
  });

  describe(`When trying to create an Injector with an invalid "injection"`, () => {
    it(`Then an error should be thrown`, () => {
      const invalidInjections = [
        1,
        `2`,
        true,
        <div>foo</div>,
        new Date(),
        {},
        []
      ];

      const validToArg = Injectable(() => <div>foo</div>);

      invalidInjections.forEach(invalidInjection => {
        const actual = () => Injector({
          into: validToArg
        })(invalidInjection);

        const expected = /Invalid injection value/;

        expect(actual).to.throw(expected);
      });
    });
  });

  describe(`When trying to create an Injector with an invalid "to" argument`, () => {
    it(`Then an error should be thrown`, () => {
      // Invalid type
      const InvalidInjectable1 = {};

      // Invalid interface
      const InvalidInjectable2 = () => undefined;

      // Invalid interface
      class InvalidInjectable3 extends Component {
        static injectionId = `foo`;

        render() {
          return <div>Foo</div>;
        }
      }

      // Invalid interface
      class InvalidInjectable4 extends Component {
        static injectionId = `foo`;

        static contextTypes = { }

        render() {
          return <div>Foo</div>;
        }
      }

      // Invalid interface
      class InvalidInjectable5 extends Component {
        static injectionId = `foo`;

        static contextTypes = {
          registerInjectable: () => undefined
        }

        render() {
          return <div>Foo</div>;
        }
      }

      // Invalid interface
      class InvalidInjectable6 extends Component {
        static injectionId = `foo`;

        static contextTypes = {
          removeInjectable: () => undefined
        }

        render() {
          return <div>Foo</div>;
        }
      }

      const invalidCases = [];
      invalidCases.push(InvalidInjectable1);
      invalidCases.push(InvalidInjectable2);
      invalidCases.push(InvalidInjectable3);
      invalidCases.push(InvalidInjectable4);
      invalidCases.push(InvalidInjectable5);
      invalidCases.push(InvalidInjectable6);

      invalidCases.forEach(invalidInjectable => {
        const actual = () => Injector({
          into: invalidInjectable
        })(() => <div>bar</div>);

        const expected = /Invalid Injectable target/;

        expect(actual).to.throw(expected);
      });
    });
  });
});
