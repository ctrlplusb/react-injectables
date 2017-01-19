💀 ___DEPRECATED___ 💀

I have given up on this library. Sorry.

Good news though, it sounds like portals may become a first class citizen when React Fiber lands. 🎉
---

<p align='center'>
  <img src='https://raw.githubusercontent.com/ctrlplusb/react-injectables/master/assets/logo.png' width='350'/>
  <p align='center'>Explicitly inject Components to any part of your React render tree</p>
</p>

[![Travis](https://img.shields.io/travis/ctrlplusb/react-injectables.svg?style=flat-square)](https://travis-ci.org/ctrlplusb/react-injectables) 
[![npm](https://img.shields.io/npm/v/react-injectables.svg?style=flat-square)](http://npm.im/react-injectables)
[![MIT License](https://img.shields.io/npm/l/react-injectables.svg?style=flat-square)](http://opensource.org/licenses/MIT)
[![Codecov](https://img.shields.io/codecov/c/github/ctrlplusb/react-injectables.svg?style=flat-square)](https://codecov.io/github/ctrlplusb/react-injectables)
[![Maintenance](https://img.shields.io/maintenance/yes/2016.svg?style=flat-square)]()

* Uses React's natural render cycles, no DOM hacks.
* Injections are handled synchronously, no double renders.
* Supports props pass through to injected Components - behaviour++.
* No magic strings in your code.  Explicitly define source and target Components.
* Works with React 0.14 and 15.
* Extensive test coverage.
* Micro library. Gzip it to nothingness.

_Note: There have been a lot of releases recently, however, based on usage within my production cases I am happy with where the API is.  Please consider the API in a long term stable condition.  I shall make every attempt from now on to avoid any breaking changes._ 

## What is this for?

Content Placeholders, Modals, etc.

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
import { SidebarInjector } from '../InjectableSidebar';
import MyBasket from '../MyBasket';

const MyBasketSidebarInjection = SidebarInjector(MyBasket);

class ProductPage extends Component {
  render() {
  	return (
  		<div>
         {/* MyBasket will get injected into Sidebar! */}
         <MyBasketSidebarInjection /> 
  		
         <h1>Product Page</h1>
         ...
  		</div>
  	);
  }
}

export default ProductPage;
```

Now every time the `ProductPage` Component is mounted the `MyBasket` Component will be injected into `Sidebar` Component. Ok, there is a bit of additional setup required in the `Sidebar` Component, but the above is a basic overview of how easy it is to define your injections after the initial configuration.

Yes, a bit of fairy dust is involved, but we attempt to keep things as un-magical as possible, pushing for explictness whilst maintaining ease of use.


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
import { Injectable, Injector } from 'react-injectables';

// Note the 'injections' prop.  This will contain any injected elements.
function Sidebar({ injections }) {
  return (
    <div className="header">
     {injections}
    </div>
  );
}

// We wrap our Sidebar component with Injectable. This does all the wiring up for us.
const InjectableSidebar = Injectable(Sidebar);

// Create a default Injector configuration for our injectable sidebar.
// Our Components can use this helper to create injections for the sidebar.
// NOTE: We are exporting this helper, it will come in handy for the next step.
export const SidebarInjector = Injector({ into: InjectableSidebar });

export default InjectableSidebar;
```

Notice we also create a default `Injector` configuration for our `InjectableSidebar` called `SidebarInjector`.  This has been exported to allow our other Components to easily import and use this pre-configured helper - it saves us having to repeat this configuration thereby reducing errors.
    
We recommend naming your component files appropriately to indicate that it is indeed an injectable component.  In the above case we named our component file as `InjectableSidebar.js`.  Forming your own conventions around the naming of your injectables and injectors will help.
    
__Step 3__

Ok, so now you have an `InjectableSidebar` Component and a `SidebarInjector` helper function.  Next up you need to declare a Component that will cause an injection into the Sidebar to occur.

```javascript
import React from 'react';
import { SidebarInjector } from './InjectableSidebar';
import MyBasketView from './MyBasketView';

// Use the SidebarInjector helper to create a Component that will inject the
// MyBasketView Component into our InjectableSidebar Component.
const MyBasketViewSidebarInjection = SidebarInjector(MyBasketView);

class ProductPage extends Component {
   ....
   
   render() {
     return (
     	<div>
     	  {/* The injection happens here, i.e. when the ProductPage gets mounted. 
     	      Nothing actually gets rendered at this location, the Component gets sent to
             our target Injectable.  In this case it means that MyBasketView will
             be injected into the Sidebar.
             Notice how you can also pass down props into your injected component too. */}
         <MyBasketViewSidebarInjection focusOnProductId={this.props.productId} />
     	
         <h1>Product Page</h1>
         
         ...
     	</div>
     );
   }
}

export default ProductPage;
```
 
And that's it. Any time the `ProductPage` is mounted it will inject the `MyBasketView` Component into the `Sidebar`.  When the `ProductPage` unmounts, it's respective injected Component will be removed from the `Sidebar`.
 
As you can see it's all explicit, so you can follow the import references to find out any relationships.  

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
