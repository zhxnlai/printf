var React = require('react');
var Classable = require('../../mixins/classable.js');
var assign = require('object-assign');

var EditorStore = require('../../stores/EditorStore.js');
var EditorActionCreators = require('../../actions/EditorActionCreators.js');

function getStateFromStores() {
  return {
    text : EditorStore.getText(),
  };
}

var Explanation = React.createClass({
  mixins: [Classable],

  getInitialState: function() {
    return getStateFromStores();
  },

  propTypes: {
    // value: React.PropTypes.string.isRequired,
  },

  onEditorTextChange: function(e) {
    EditorActionCreators.textChange(e.target.value);
  },

  render: function() {
    var classes = this.getClasses('editor', {
    });

    return (
      <div>
        <h1>Explanation</h1>
      </div>
      );
    }
});

module.exports = Explanation;
