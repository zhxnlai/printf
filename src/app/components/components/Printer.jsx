var React = require('react');
var Classable = require('../../mixins/classable.js');

var assign = require('object-assign');

var CodeMirror = require('react-code-mirror');

var EditorStore = require('../../stores/EditorStore.js');
var EditorActionCreators = require('../../actions/EditorActionCreators.js');

function getStateFromStores() {
  return {
    text : EditorStore.getText(),
    highlightedNode : EditorStore.getHighlightedNode(),
  };
}

var Printer = React.createClass({
  mixins: [Classable],

  getInitialState: function() {
    return getStateFromStores();
  },

  componentDidMount: function() {
    EditorStore.addChangeListener(this._onChange);
    // this.refs.codeMirror.editor.on('cursorActivity', this.handleCursorActivity);
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

  render: function() {
    var classes = this.getClasses('printer', {
      // "prin": true
    });


    return (
      <div className={classes}>
        <div className="upper">
          <code className="left">{"Args: "}</code>
          <div className="right"><p>Text area</p></div>
        </div>
        <div className="lower">
          <code className="left">{"Results: "}</code>
          <div className="right"><p>Text area</p></div>
        </div>
      </div>
      );
    }
});

module.exports = Printer;
