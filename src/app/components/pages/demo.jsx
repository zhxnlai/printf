var React = require('react');
var Router = require('react-router');
var assign = require('object-assign');

var Input = require('../components/Input.jsx');
var Visualization = require('../components/Visualization.jsx');
// var Visualization = require('../components/Visualization.jsx');

var EditorStore = require('../../stores/EditorStore.js');
var EditorActionCreators = require('../../actions/EditorActionCreators.js');

function getStateFromStores() {
  return {
    // languages: EditorStore.getLanguages(),
  };
}

var Dashboard = React.createClass({
  mixins: [Router.State, Router.Navigation],

  getInitialState: function() {
    return getStateFromStores();
  },

  componentDidMount: function() {
    EditorStore.addChangeListener(this._onChange);
    EditorActionCreators.didMount();
  },

  componentWillUnmount: function() {
    EditorStore.removeChangeListener(this._onChange);
  },

  /**
   * Event handler for 'change' events coming from the stores
   */
  _onChange: function() {
    this.setState(getStateFromStores());
  },

  render: function() {
    return (
      <div className="demo-page">
        <Input/>
        <Visualization/>
      </div>
    );
  }

});

module.exports = Dashboard;


/*
<Navbar>
  <Nav>
    <NavItemLink
      to="demo"
      params={{ someparam: 'hello' }}>
      Printf 101
    </NavItemLink>

  </Nav>
</Navbar>

<br />
ButtonLink<br />
<ButtonLink
  to="demo"
  params={{ someparam: 'hello' }}>
  Linky!
</ButtonLink>
<RouteHandler />
*/
