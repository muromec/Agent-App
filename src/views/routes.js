/**
* @jsx React.DOM
*/
'use strict';


var Index = require('./Index');
var Home = require('./Home');
var Sign = require('./Sign');
var Configure = require('./Configure');
var Router = require('react-router');
var Route = Router.Route;
var DefaultRoute = Router.DefaultRoute;

var routes = (
  <Route handler={Index} path="/">
    <DefaultRoute name="home" handler={Home} />
    <Route path="/sign" name="sign" handler={Sign} />
    <Route path="/config" name="config" handler={Configure} />
  </Route>
);

module.exports = routes;
