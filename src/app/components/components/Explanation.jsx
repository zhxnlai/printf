var React = require('react');
var Classable = require('../../mixins/classable.js');
var assign = require('object-assign');

var EditorStore = require('../../stores/EditorStore.js');
var EditorActionCreators = require('../../actions/EditorActionCreators.js');

function getStateFromStores() {
  return {
    highlightedNode : EditorStore.getHighlightedNode(),
  };
}

var Explanation = React.createClass({
  mixins: [Classable],

  getInitialState: function() {
    return getStateFromStores();
  },

  componentDidMount: function() {
    EditorStore.addChangeListener(this._onChange);
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

  propTypes: {
    // value: React.PropTypes.string.isRequired,
  },

  onEditorTextChange: function(e) {
    EditorActionCreators.textChange(e.target.value);
  },

  render: function() {
    var classes = this.getClasses('explanation', {
    });

    console.log(this.state.highlightedNode);

    return (
      <div className={classes}>
        <h1>Explanation</h1>
      </div>
      );
    }
});

module.exports = Explanation;
