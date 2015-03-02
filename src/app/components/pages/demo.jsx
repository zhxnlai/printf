var React = require('react');
var Router = require('react-router');
var assign = require('object-assign');

var Input = require('../components/Input.jsx');
var Visualization = require('../components/Visualization.jsx');
var Explanation = require('../components/Explanation.jsx');

var EditorStore = require('../../stores/EditorStore.js');
var EditorActionCreators = require('../../actions/EditorActionCreators.js');

function getStateFromStores() {
  return {
    // languages: EditorStore.getLanguages(),
  };
}

var Demo = React.createClass({
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
        <div className="leftPanel">
          <Input/>
          <Visualization/>
        </div>
        <div className="rightPanel">
          <Explanation/>
        </div>
      </div>
    );
  }

});

module.exports = Demo;
