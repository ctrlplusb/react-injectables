<p align='center'>
  <img src='https://raw.githubusercontent.com/ctrlplusb/react-injectables/master/assets/logo.png' width='350'/>
  <p align='center'>Explicitly inject Elements into any part of your React render tree</p>
</p>

[![Travis](https://img.shields.io/travis/ctrlplusb/react-injectables.svg?style=flat-square)](https://travis-ci.org/ctrlplusb/react-injectables)
[![npm](https://img.shields.io/npm/v/react-injectables.svg?style=flat-square)](http://npm.im/react-injectables)
[![MIT License](https://img.shields.io/npm/l/react-injectables.svg?style=flat-square)](http://opensource.org/licenses/MIT)
[![Codecov](https://img.shields.io/codecov/c/github/ctrlplusb/react-injectables.svg?style=flat-square)](https://codecov.io/github/ctrlplusb/react-injectables)

## What is this for?

Envision you have the following component tree:

```html
<App>
	<Sidebar />
	<Main>
		<Header />
		{renderedRouteContent}			
		<Footer />
	</Main>
</App>
```
	
A fairly standard configuration, essentially you have a master application template which each of your routes get rendered in to.  This is handy as you get to share things like your Header, Menu, Footer across all your rendered routes without having to repeat all that code.  But what if you wanted to extend your base template with additional content that is specific to one of the routes being rendered?

For example, you'll notice the base template holds a handy little `Sidebar` component.  Perhaps you would like a `MyBasketSummary` to be rendered in there whilst the user is viewing the `ProductsRoute`?  Or maybe you would like to inject a new `Button` or `Image` into the `Header` for one of your routes?

How could you solve these seemingly simple problems?

One option would be to use react-routers native capability to pass down multiple named components for each of the routes into the base template. For the simple cases we recommend this approach, however, with complex applications having deeply nested routes and component structures this approach may be difficult to manage and could end up in complex props pass-throughs.  

Enter Injectables.

Injectables aims to provide you with a mechanism to explicity define an Injectable target and Injector source component(s).  

Fairy dust is involved, however, we attempt to keep things as un-magical as possible - explictness is the key.


## Usage

First install the library.

    npm install react-injectables

### Quick Start
    
Here is a summary of what you need to do in order to support the injection of content from one Component to another:


  1. Wrap your application with our `Provider`.
  2. Create a pair of `Injectable` and `Injector` higher order components using our `prepInjection()` function.
  3. Wrap the component you would like to be recieve content with the `Injectable` higher order component. For example: `const InjectableHeader = Injectable(Header)`
  4. Wrap a component you would like to produce content with the `Injector` higher order component. This is also the point in which you declare the content to be injected.  For example: `const InjectorProductPage = Injector(<div>I will be injected</div>)(ProductPage)` 
    
### Full Tutorial 

Ok, here's a more detailed run through with example code.
    
__Step 1__    
    
Somewhere very low down in your application wrap your component tree with our `Provider`.  This is the engine that will do all the heavy lifting for you. For example:

```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-injectables';
    
ReactDOM.render((
	<Provider>
		<Router>
			...
		</Router>
	</Provider>
 ), document.getElementById('app'));
```

_Note:_ If you already have another component with the name of `Provider` in your app (think redux), then you can rename the import, like so:
`import { Provider as InjectablesProvider } from 'react-injectables';`

__Step 2 + 3__
	 
Now you need to create an Injectable Component.  We have a helper function that will provide you with two higher order component functions to aid you with this.

Let's say that you would like to create a Header component that you could inject in to. You would do the following:

```javascript
// ./src/components/InjectableHeader.js
 
import React, { PropTypes } from 'react';
import { prepInjection } from 'react-injectables';

// Create a new injectable configuration. Each call to prepInjection
// creates a unique set of Injectable and Injector higher order
// components. This allows us to avoid magic strings in your code.
const { Injectable, Injector } = prepInjection();

 // Note the prop named 'injected'.  This will contain any injected elements.
const Header = ({ injected }) => (
  <div className="header">
   {injected.length > 0 
   	? injected 
   	: <div>Nothing has been injected</div>}
  </div>
);
Header.propTypes = {
  injected: PropTypes.arrayOf(PropTypes.element)
};

// We export the Injector higher order component renamed as HeaderInjector to
// make it explicity what the target is for the injector.
export const HeaderInjector = Injector;
    
// We wrap our Header component definition with the Injectable higher order
// component call. This does all the wiring up for us. Any injections will
// be passed down to our component via the 'injected' prop.
export default Injectable(Header);
```
    
_Note:_ We recommend naming your component files appropriately to indicate that it is indeed an injectable component.  In the above case we named our component file as `InjectableHeader.js`  
    
__Step 4__

Ok, so you have an `InjectableHeader` now, but you need to declare which components you would like to inject content into the header with.

Within the component you indentify for this purpose pull the `HeaderInjector` higher order component from your newly created `InjectableHeader` component. Then wrap the export of your component with this higher order function, making sure to pass in the content you would like to inject into the Header.

```javascript
import React from 'react';
import { HeaderInjector } from './InjectableHeader';

const PageOne = () => (
  <div>
    I am page one.
  </div>
);
    
export default HeaderInjector([
  <div>Injection from Page One</div>
])(PageOne);
```
 
 ---
 
And that's it. :)
 
As you can see it's all explicit, so you can follow the import references to find out any relationships.  

You will need to repeat steps 2 - 4 for any set of Injectable targets and Injector sources you would like to create.  Again, this is to keep things as explicit as possible.

## Properties of Injectables and Injectors

Here are a few basic properties you should be aware of:

   * All "injection" happens within the first render cycle by react-dom (if both an Injectable and Injector exist within the react dom tree).  This is intentionally to try and keep things as "uni-directional" / "input -> output" as possible.
   * If an Injector is removed from the tree then it's injected elements will automatically be removed from the Injectable target.  
   * Any new Injectors within the tree will automatically have their injected content rendered within the Injectable target. 
   * Multiple instances of an Injector will not cause multiple instances of the injection element to be rendered within the Injectable target.  Only unique instances are passed through to the Injectable target.
   * You can use the Injector higher order function to create multiple injector sources, all the unique elements will be passed through to the Injectable target.
   * Injectors are allowed to exist before any Injectable instances.  Once the Injectable instance is rendered then existing Injectors will have their injections rendered within the Injectable.
   * You can have multiple instances of an Injectable rendered in your app.  They will all recieve the same injected content from their respective Injectors. 
   * You should create a new Injectable/Injector HOC pair (via the prepInjection function) for every Injectable target you would like.

## Examples

At the moment there is only one example, using react-router.  Pull the source onto your machine then execute the following commands:

    cd examples/react-router
    npm install
    npm run watch
    
Browse to localhost:3000 to see it in action.

## Some other considerations.

__I am using redux or another flux-like library__

Then perhaps you should try and use their respective action flows in order to control the "injection" of your content in a manner that follows their uni-directional flows. 
