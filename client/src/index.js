import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Home from './Home/Home';
import './index.css';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(
<Router>
    <div>
    <Switch>
        {/* <Route path="/admin" component={Admin} />
        <Route path="/:listId" component={Main} /> */}
        <Route path="/" component={Home} />
    </Switch>
    </div>
</Router>, document.getElementById('root'));

serviceWorker.unregister();
