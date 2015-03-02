var React = require('react/addons');
var Router = require('react-router');
var Route = Router.Route;
var Routes = Router.Routes;
var Redirect = Router.Redirect;
var DefaultRoute = Router.DefaultRoute;
var NotFoundRoute = Router.NotFoundRoute;

var Demo = require('./components/pages/demo.jsx');

var AppRoutes = (

    <Route name="demo" path="/" handler={Demo} />

);

module.exports = AppRoutes;
