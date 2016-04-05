import React, { PropTypes } from 'react';
import { describeWithDOM } from './jsdom';
import { expect } from 'chai';
import $ from 'teaspoon';

describeWithDOM(`Given an Injectables configuration`, () => {
  let Provider;
  let prepInjection;
  let InjectableHeader;
  let Layout;
  let HeaderInjectingSectionOne;
  let HeaderInjectingSectionTwo;

  before(() => {
    Provider = require(`../src/Provider`).default;
    prepInjection = require(`../src/prepInjection`).default;

    const { Injectable, Injector } = prepInjection();

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

    HeaderInjectingSectionOne = Injector([
      <div id="Injection">Section One Header Injection.</div>
    ])(SectionOne);

    const SectionTwo = () => (
      <div>
        <h1>Section Two</h1>
      </div>
    );

    HeaderInjectingSectionTwo = Injector([
      <div id="Injection">Section Two Header Injection.</div>
    ])(SectionTwo);
  });

  describe(`When the injector is rendered as a child of the injectable`, () => {
    let rendered;

    before(() => {
      rendered = $(
        <Provider>
          <Layout>
            <HeaderInjectingSectionOne />
          </Layout>
        </Provider>
      ).render();
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
      rendered = $(
        <Provider>
          <div>
            <HeaderInjectingSectionOne />
            <Layout />
          </div>
        </Provider>
      ).render();
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
      rendered = $(
        <Provider>
          <div>
            <HeaderInjectingSectionOne />
            <Layout>
              <HeaderInjectingSectionOne />
            </Layout>
          </div>
        </Provider>
      ).render();
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
      rendered = $(
        <Provider>
          <div>
            <HeaderInjectingSectionTwo />
            <Layout>
              <HeaderInjectingSectionOne />
              <HeaderInjectingSectionTwo />
            </Layout>
            <HeaderInjectingSectionOne />
          </div>
        </Provider>
      ).render();
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
