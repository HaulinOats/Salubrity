import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Home from './Home/Home';
import Admin from './Admin/Admin';
import Errors from './Widgets/Errors/Error';
import './index.css';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(
<Router>
    <Switch>
        <Route path="/admin" component={Admin} />
        <Route path='/errors' component={Errors} />
        <Route path="/" component={Home} />
    </Switch>
</Router>, document.getElementById('root'));

serviceWorker.unregister();
