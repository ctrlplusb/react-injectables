import React from 'react';
import ReactDOM from 'react-dom';
import { Provider as InjectablesProvider } from '../../../src/index.js';
import { browserHistory, Router, Route, IndexRoute } from 'react-router';

import App from './App';
import Home from './Home';
import PageOne from './PageOne';
import PageTwo from './PageTwo';

const container = document.getElementById(`app`);

ReactDOM.render((
  <InjectablesProvider>
    <Router history={browserHistory}>
      <Route path="/" component={App}>
        <IndexRoute component={Home} />
        <Route path="pageOne" component={PageOne} />
        <Route path="pageTwo" component={() => <PageTwo foo bar baz />} />
      </Route>
    </Router>
  </InjectablesProvider>
), container);
