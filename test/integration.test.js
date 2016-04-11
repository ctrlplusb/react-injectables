import React, { PropTypes } from 'react';
import { describeWithDOM } from './jsdom';
import { expect } from 'chai';
import { mount } from 'enzyme';

describeWithDOM(`Given an Injectables configuration`, () => {
  const { InjectablesProvider, Injectable, Injector } = require(`../src/index.js`);

  let InjectableHeader;
  let Layout;
  let HeaderInjectingSectionOne;
  let HeaderInjectingSectionTwo;
  let HeaderInjection;
  let render;

  before(() => {
    render = elements => mount(
      <InjectablesProvider>
        {elements}
      </InjectablesProvider>
    );

    const Header = ({ injections }) => (
      <div id="Header">
        {injections}
      </div>
    );
    Header.propTypes = {
      injections: PropTypes.arrayOf(PropTypes.element).isRequired
    };

    InjectableHeader = Injectable(Header);

    Layout = ({ children }) => ( // eslint-disable-line react/prop-types
      <div id="Layout">
        <InjectableHeader />
        <div id="Main">
          {children}
        </div>
      </div>
    );
    Layout.propTypes = {
      children: PropTypes.any
    };

    HeaderInjection = props => (
      <div id="Injection">{props.message || `injection`}.</div> // eslint-disable-line
    );

    HeaderInjectingSectionOne = Injector({
      into: InjectableHeader
    })(HeaderInjection);

    HeaderInjectingSectionTwo = Injector({
      into: InjectableHeader
    })(HeaderInjection);
  });

  describe(`When the injector is rendered as a child of the injectable`, () => {
    let rendered;

    before(() => {
      rendered = render(
        <Layout>
          <HeaderInjectingSectionOne />
        </Layout>
      );
    });

    it(`Then the injected content should have been rendered in the header`, () => {
      const expected = 1;

      const actual = rendered
        .find(InjectableHeader)
        .find(HeaderInjection)
        .length;

      expect(actual).to.equal(expected, `The injected content was not found.`);
    });
  });

  describe(`When the injector is rendered before the injectable`, () => {
    let rendered;

    before(() => {
      rendered = render(
        <div>
          <HeaderInjectingSectionOne />
          <Layout />
        </div>
      );
    });

    it(`Then the injected content should have been rendered in the header`, () => {
      const expected = 1;
      const actual = rendered
        .find(InjectableHeader)
        .find(HeaderInjection)
        .length;

      expect(actual).to.equal(expected, `The injected content was not found.`);
    });
  });

  describe(`When rendering multiple of the same injector instance`, () => {
    let rendered;

    before(() => {
      rendered = render(
        <div>
          <HeaderInjectingSectionOne />
          <Layout>
            <HeaderInjectingSectionOne />
          </Layout>
        </div>
      );
    });

    it(`Then the injected content should have been rendered in the header`, () => {
      const expected = 1;
      const actual = rendered
        .find(InjectableHeader)
        .find(HeaderInjection)
        .length;

      expect(actual).to.equal(expected, `The injected content was not found.`);
    });
  });

  describe(`When rendering different injectors targetting the same injectable`, () => {
    let rendered;

    before(() => {
      rendered = render(
        <div>
          <HeaderInjectingSectionTwo />
          <Layout>
            <HeaderInjectingSectionOne />
            <HeaderInjectingSectionTwo />
          </Layout>
          <HeaderInjectingSectionOne />
        </div>
      );
    });

    it(`Then the injected content should have been rendered in the header`, () => {
      const expected = 2;
      const actual = rendered
        .find(InjectableHeader)
        .find(HeaderInjection)
        .length;

      expect(actual).to.equal(expected, `The injected content was not found.`);
    });
  });

  describe(`When rendering a null/undefined from an Injector`, () => {
    it(`Then nothing should be rendered`, () => {
      const NullInjector = Injector({
        into: InjectableHeader
      })(() => null);

      const rendered = render(
        <Layout>
          <NullInjector />
        </Layout>
      );

      const actual = rendered
        .find(InjectableHeader)
        .html();

      expect(actual)
        .to.match(/^<div id="Header"><!-- react-empty: [\d]+ --><\/div>$/);
    });
  });
});
