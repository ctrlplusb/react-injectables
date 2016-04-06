import React, { PropTypes } from 'react';
import { describeWithDOM } from './jsdom';
import { expect } from 'chai';
import $ from 'teaspoon';

describeWithDOM(`Given an Injectables configuration`, () => {
  let InjectableHeader;
  let Layout;
  let HeaderInjectingSectionOne;
  let HeaderInjectingSectionTwo;
  let render;

  before(() => {
    const { Provider, Injectable, Injector } = require(`../src/index.js`);

    render = elements => $(
      <Provider>
        {elements}
      </Provider>
    ).render();

    const Header = ({ injected }) => (
      <div id="Header">
        <span>These are the injections:</span>
        {injected}
      </div>
    );
    Header.propTypes = {
      injected: PropTypes.arrayOf(PropTypes.element).isRequired
    };

    InjectableHeader = Injectable(Header);

    Layout = ({ children }) => (
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

    const SectionOne = () => (
      <div>
        <h1>Section One</h1>
      </div>
    );

    HeaderInjectingSectionOne = Injector({
      to: InjectableHeader,
      elements: [<div id="Injection">Section One Header Injection.</div>]
    })(SectionOne);

    const SectionTwo = () => (
      <div>
        <h1>Section Two</h1>
      </div>
    );

    HeaderInjectingSectionTwo = Injector({
      to: InjectableHeader,
      elements: [<div id="Injection">Section Two Header Injection.</div>]
    })(SectionTwo);
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
        .find($.s`${InjectableHeader}`)
        .find(`div[id=Injection]`)
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
        .find($.s`${InjectableHeader}`)
        .find(`div[id=Injection]`)
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
        .find($.s`${InjectableHeader}`)
        .find(`div[id=Injection]`)
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
        .find($.s`${InjectableHeader}`)
        .find(`div[id=Injection]`)
        .length;

      expect(actual).to.equal(expected, `The injected content was not found.`);
    });
  });
});
