<p align='center'>
  <img src='https://raw.githubusercontent.com/ctrlplusb/react-injectables/master/assets/logo.png' width='350'/>
  <p align='center'>Explicitly inject Elements into any part of your React render tree</p>
</p>

[![Travis](https://img.shields.io/travis/ctrlplusb/react-injectables.svg?style=flat-square)](https://travis-ci.org/ctrlplusb/react-injectables)
[![npm](https://img.shields.io/npm/v/react-injectables.svg?style=flat-square)](http://npm.im/react-injectables)
[![MIT License](https://img.shields.io/npm/l/react-injectables.svg?style=flat-square)](http://opensource.org/licenses/MIT)
[![Codecov](https://img.shields.io/codecov/c/github/ctrlplusb/react-injectables.svg?style=flat-square)](https://codecov.io/github/ctrlplusb/react-injectables)

Tiny, and the only dependency is a peer dependency of React.

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

With Injectables you can easily inject into `Sidebar` from your `ProductPage` doing something similar to the following:

```javascript
import { Injector } from 'react-injectables';

class ProductsPage extends Component {
  ...
}

export default Injector({
  to: Sidebar,
  elements: [ <MyBasketSummary />]
})(ProductsPage);
```

Now every time `ProductPage` is rendered onto the page the `MyBasketSummary` will be injected into `Sidebar`. Ok, there is a tiny bit of additional setup. But it's quick sticks to get going. 

Fairy dust is involved, but we attempt to keep things as un-magical as possible, keeping things explict, whilst also easy to use.


## Usage

First install the library.

    npm install react-injectables

### Quick Start
    
To get going there are only 3 steps:

  1. Wrap your application with our `Provider`.
  3. Wrap the component you would like to be recieve content with our `Injectable`. e.g. `Injectable(Sidebar)`
  4. Wrap a component you would like to produce content with our `Injector`. e.g.: `Injector({ to: InjectableSidebar, elements: [<MyBasketsView>])(ProductPage)` 
    
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

__Step 2__
	 
Now you need to create an Injectable Component.  Let's say that you would like to create a Sidebar component that you could inject in to. You would do the following:

```javascript
// ./src/components/InjectableHeader.js
 
import React, { PropTypes } from 'react';
import { Injectable } from 'react-injectables';

 // Note the prop named 'injected'.  This will contain any injected elements.
const Sidebar = ({ injected }) => (
  <div className="header">
   {injected.length > 0 
   	? injected 
   	: <div>Nothing has been injected</div>}
  </div>
);
Sidebar.propTypes = {
  injected: PropTypes.arrayOf(PropTypes.element)
};
    
// We wrap our Sidebar component with Injectable. This does all the wiring up for us.
export default Injectable(Sidebar);
```
    
_Note:_ We recommend naming your component files appropriately to indicate that it is indeed an injectable component.  In the above case we named our component file as `InjectableSidebar.js`  
    
__Step 3__

Ok, so you have an `InjectableSidebar` now, but you need to declare the components that will inject content in to it.

You need to make use of our `Injector`, wrapping your component, whilst also providing the target injectable component and the elements that you wish to inject.

```javascript
import React from 'react';
import { Injector } from 'react-injectables';
import InjectableSidebar from './InjectableSidebar';

class ProductsPage extends Component {
   ....
}
    
export default Injector({
  to: InjectableSidebar,
  elements: [<div>Injection from Products Page</div>]
})(ProductsPage);
```
 
 ---
 
And that's it. Any time the `ProductsPage` is rendered it will inject it's content into the `Sidebar`.  When it unmounts, it's injected elements will be removed from the `Sidebar`.
 
As you can see it's all explicit, so you can follow the import references to find out any relationships.  

You will need to repeat steps 2 and 3 for any set of Injectable targets and Injector sources you would like to create.  Again, this is to keep things as explicit as possible.

## Properties of Injectables and Injectors

Here are a few basic properties you should be aware of:

   * All injection happens within the initial render cycle by react-dom.  Injection does not cause a double render to occur.  This is a result of us trying to intentionally keep injection as "uni-directional" / "input -> output" as possible.

   * You can have multiple instances of an Injectable rendered in your app.  They will all recieve the same injected content from their respective Injectors. 

   * You can create multiple Injectors components targetting the same Injectable component. The rendered Injectors shall have their injected elements collected and passed through to the target Injectable. For example, you may want to pass in action buttons from different components into an InjectableActions component. 

   * Multiple renders of the same Injector instance will not result in duplicate content being rendered within the Injectable target.  Only unique instances are passed through to the Injectable target.
   
   * If an Injector is removed from the tree then it's injected elements will automatically be removed from the Injectable target.  
   
   * Any new Injectors that are rendered into the tree will automatically have their injected content rendered within any rendered Injectable target. 
   
   * Injectors are allowed to be rendered before any Injectables.  Once a related Injectable instance is rendered then any content from existing Injectors will automatically be rendered by the newly rendered Injectable.
   
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
