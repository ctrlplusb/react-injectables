<p align='center'>
  <img src='https://raw.githubusercontent.com/ctrlplusb/react-injectables/master/assets/logo.png' width='350'/>
  <p align='center'>Explicitly inject Components to any part of your React render tree</p>
</p>

[![Travis](https://img.shields.io/travis/ctrlplusb/react-injectables.svg?style=flat-square)](https://travis-ci.org/ctrlplusb/react-injectables) 
[![npm](https://img.shields.io/npm/v/react-injectables.svg?style=flat-square)](http://npm.im/react-injectables)
[![MIT License](https://img.shields.io/npm/l/react-injectables.svg?style=flat-square)](http://opensource.org/licenses/MIT)
[![Codecov](https://img.shields.io/codecov/c/github/ctrlplusb/react-injectables.svg?style=flat-square)](https://codecov.io/github/ctrlplusb/react-injectables)
[![Maintenance](https://img.shields.io/maintenance/yes/2016.svg?style=flat-square)]()

This is a teeny tiny React library - it's almost unnoticable when gzipped.

## What is this for?

Placeholders, Modals, etc.

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

Injectables aims to provide you with a mechanism to explicity define `Injectable` and `Injector` Components.  An `Injector` produces a Component that gets injected into an `Injectable`.

With Injectables you can easily inject a Component into the `Sidebar` when your `ProductPage` Component gets mounted. Here is a partial example of this:

```javascript
const MyBasketSidebarInjection = Injector({ 
  into: InjectableSidebar
})(MyBasket)

class ProductsPage extends Component {
  ...
  
  render() {
  	return (
  		<div>
          <MyBasketSidebarInjection />
  		
          <h1>Product Page</h1>
          ...
  		</div>
  	);
  }
}
```

Now every time the `ProductPage` Component is mounted the `MyBasket` Component will be injected into `Sidebar` Component. Ok, there is a bit of additional setup required, but the above is a basic overview of how easy it is to define your injections after the initial configuration.

Yep, some fairy dust is involved, but we attempt to keep things as un-magical as possible, pushing for explictness whilst keeping it easy to use.


## Usage

First install the library.

    npm install react-injectables

### Quick Start
    
To get going there are only 3 steps:

  1. Wrap your application with our `InjectablesProvider`.
  2. Wrap a Component you would like to _receive_ injected content with our `Injectable` helper. e.g. `Injectable(MainScreen)`
  4. Wrap a Component you would like to _inject_ with our `Injector` helper. e.g.: `Injector({ into: MainScreen })(MyModal)` 
    
### Full Tutorial 

Ok, here's a more detailed run through with example code.
    
__Step 1__    
    
Somewhere very low down in your application wrap your component tree with our `InjectablesProvider`.  This is the engine that will do all the heavy lifting for you. For example:

```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import { InjectablesProvider } from 'react-injectables';
    
ReactDOM.render((
	<InjectablesProvider>
		<Router>
			...
		</Router>
	</InjectablesProvider>
 ), document.getElementById('app'));
```

__Step 2__
	 
Now you need to create an `Injectable` Component.  Let's say that you would like to create a `Sidebar` component that you could inject in to. You would do the following:

```javascript
import React, { PropTypes } from 'react';
import { Injectable } from 'react-injectables';

// Note the 'injections' prop.  This will contain any injected elements.
function Sidebar({ injections }) {
  return (
    <div className="header">
     {injections}
    </div>
  );
}
    
// We wrap our Sidebar component with Injectable. This does all the wiring up for us.
export default Injectable(Sidebar);
```
    
_Note:_ We recommend naming your component files appropriately to indicate that it is indeed an injectable component.  In the above case we named our component file as `InjectableSidebar.js`  
    
__Step 3__

Ok, so you have an `InjectableSidebar` now, but you need to declare the components that will inject content in to it.

You need to make use of our `Injector`, wrapping the Component you would like to inject, whilst also providing the target `Injectable` Component you created.

```javascript
import React from 'react';
import { Injector } from 'react-injectables';
import InjectableSidebar from './InjectableSidebar';
import MyBasketView from './MyBasketView';

// This sets up our injection.
const MyBasketViewSidebarInjection = Injector({
  into: InjectableSidebar  // The target Injectable Component. The actual Component - explicit. :)
})(MyBasketView);  // The Component you would like to be injected.

class ProductsPage extends Component {
   ....
   
   render() {
     return (
     	<div>
     	  {/* The injection! Nothing actually gets rendered here, it gets sent to
             our target Injectable.  In this case it means that MyBasketView will
             be injected into the Sidebar.
             Notice how you can also pass down props into your injected component too. */}
         <MyBasketViewSidebarInjection focusOnProductId={this.props.productId} />
     	
     	  <h1>Products Page</h1>
     	</div>
     );
   }
}

export default ProductsPage;
```
 
 ---
 
And that's it. Any time the `ProductsPage` is mounted it will inject the `MyBasketView` Component into the `Sidebar`.  When it unmounts, the respective Component will be removed from the `Sidebar`.
 
As you can see it's all explicit, so you can follow the import references to find out any relationships.  

You will need to repeat steps 2 and 3 for any set of Injectable targets and Injector sources you would like to create.  Again, this is to keep things as explicit as possible.

## Properties of Injectables and Injectors

Here are a few basic properties you should be aware of:

   * All injection happens within the initial render cycle by react-dom.  Injection does not cause a double render to occur on your `Injectable`s.  This is a result of us trying to intentionally keep injection as "input to output" as possible.

   * You can have multiple instances of an `Injectable` rendered in your app.  They will all recieve the same injected content from their respective `Injector`s. 

   * You can create multiple `Injector`s Components targetting the same `Injectable` component. For example, you may want to pass in action buttons from different components into an InjectableActions component. 
   
   * If an Component that is hosting `Injector` is unmounted then the injected Components will automatically be removed from the `Injectable` target. 
   
   * Any new `Injector`s that are rendered into the tree will automatically have their injected Components passed into any existing `Injectable` targets. i.e. a props update. 
   
   * `Injector`s are allowed to be mounted before any `Injectable`s.  Once their target `Injectable` Component is mounted then any Components from existing `Injector`s will automatically be passed into the newly mounted `Injectable`.

## Examples

At the moment there is only one example, using react-router.  Check out the examples folder.  I wouldn't recommend running it yet as I have yet to add any style to it, but it will execute if you try. :)


## Some other considerations.

__I am using redux or another flux-like library__

Then perhaps you should try and use their respective action flows in order to control the "injection" of your content in a manner that follows their uni-directional flows. 
