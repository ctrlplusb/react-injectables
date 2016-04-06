<p align='center'>
  <img src='https://raw.githubusercontent.com/ctrlplusb/react-injectables/master/assets/logo.png' width='350'/>
  <p align='center'>Explicitly inject Elements to any part of your React render tree</p>
</p>

[![Travis](https://img.shields.io/travis/ctrlplusb/react-injectables.svg?style=flat-square)](https://travis-ci.org/ctrlplusb/react-injectables) 
[![npm](https://img.shields.io/npm/v/react-injectables.svg?style=flat-square)](http://npm.im/react-injectables)
[![MIT License](https://img.shields.io/npm/l/react-injectables.svg?style=flat-square)](http://opensource.org/licenses/MIT)
[![Codecov](https://img.shields.io/codecov/c/github/ctrlplusb/react-injectables.svg?style=flat-square)](https://codecov.io/github/ctrlplusb/react-injectables)
[![Maintenance](https://img.shields.io/maintenance/yes/2016.svg?style=flat-square)]()

Tiny, and the only dependency is a peer dependency of React.

### Warning

I am actively developing this project whilst applying it to a production use-case.  This is exposing the limitations of the API pretty fast requiring that I do quick updates.  Expect the versions to bump excessively over the next couple of weeks, but I will stabilise it as quickly as I can.  I'm not a fan of 0.x.x beta releases and don't mind big numbers.  I like that each version I release clearly indicates breaking changes.  This message will disappear as soon as I believe the API will remain stable for an extended period of time. 

## What is this for?

Placeholders, Modals, etc etc.

## Overview

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
  inject: function () { return (<MyBasketSummary />); }
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
  2. Wrap a component you would like to _receive_ content with our `Injectable`. e.g. `Injectable(Sidebar)`
  4. Wrap a component you would like to _produce_ content with our `Injector`. e.g.: `Injector({ to: InjectableSidebar, inject: () => <MyBasketsView>)(ProductPage)` 
    
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
import React, { PropTypes } from 'react';
import { Injectable } from 'react-injectables';

// Note the 'injected' prop.  This will contain any injected elements.
function Sidebar({ injected }) {
  return (
    <div className="header">
     {injected}
    </div>
  );
}
    
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
import BasketViewPage from './BasketViewPage';

class ProductsPage extends Component {
   ....
}

// We are using this stateless component as our inject resolver.
// It will receive any props that will be passed into ProductsPage, including updated ones.
function Inject(props) {
  return (<BasketViewPage focusOnProductId={props.productId} />);
}
    
export default Injector({
  to: InjectableSidebar,  // You have to specify the actual Injectable Component. Explicit.
  inject: Inject  // The inject function or a React Element.
})(ProductsPage);
```
 
The `inject` property argument for the `Injector` accepts either of two things:

  * A function with a `props` argument that when executed will return a React Element. i.e. a stateless functional component.  It will recieve the same props that will be passed into the component being wrapped by the `Injector`.  If you wrap your component with multiple higher order functions/components then please make sure that `Injector` is the first of the functions used to wrap your component. For e.g. 
  ```javascript
  export default compose( // executes last to first.
    Connect(stateM, propsM), 
    Injector(args)
  )(ProductsPage);
  ```

  * A React element. This works, however the element is created up front before it is even needed.  Also you lose the capability to interogate any props that may have been passed into your component.
 
 ---
 
And that's it. Any time the `ProductsPage` is rendered it will inject it's content into the `Sidebar`.  When it unmounts, it's injected elements will be removed from the `Sidebar`.
 
As you can see it's all explicit, so you can follow the import references to find out any relationships.  

You will need to repeat steps 2 and 3 for any set of Injectable targets and Injector sources you would like to create.  Again, this is to keep things as explicit as possible.

## Properties of Injectables and Injectors

Here are a few basic properties you should be aware of:

   * All injection happens within the initial render cycle by react-dom.  Injection does not cause a double render to occur.  This is a result of us trying to intentionally keep injection as "uni-directional" / "input -> output" as possible.

   * You can have multiple instances of an Injectable rendered in your app.  They will all recieve the same injected content from their respective Injectors. 

   * You can create multiple Injectors components targetting the same Injectable component. The rendered Injectors shall have their injected elements collected and passed through to the target Injectable. For example, you may want to pass in action buttons from different components into an InjectableActions component. 
   
   * If an Injector is removed from the tree then it's injected elements will automatically be removed from the Injectable target. 
   
   * Any new Injectors that are rendered into the tree will automatically have their injected content rendered within any rendered Injectable target. 
   
   * Injectors are allowed to be rendered before any Injectables.  Once their target Injectable Component is rendered then any content from existing the Injectors will automatically be rendered within the newly rendered Injectable.

## Examples

At the moment there is only one example, using react-router.  Check out the examples folder.  I wouldn't recommend running it yet as I have yet to add any style to it, but it will execute if you try. :)


## Some other considerations.

__I am using redux or another flux-like library__

Then perhaps you should try and use their respective action flows in order to control the "injection" of your content in a manner that follows their uni-directional flows. 
