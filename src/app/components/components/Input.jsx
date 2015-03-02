var React = require('react');
var Classable = require('../../mixins/classable.js');
var assign = require('object-assign');

var CodeMirror = require('react-code-mirror');
require('codemirror/mode/javascript/javascript');

// var WindowListenable = require('../../mixins/window-listenable.js');
var EditorStore = require('../../stores/EditorStore.js');
var EditorActionCreators = require('../../actions/EditorActionCreators.js');

function getStateFromStores() {
  return {
    text : EditorStore.getText(),
    // grammar : EditorStore.getGrammar(),
  };
}


var Input = React.createClass({
  mixins: [Classable],

  getInitialState: function() {
    return getStateFromStores();
  },

  propTypes: {
    value: React.PropTypes.string.isRequired,
  },

  onEditorTextChange: function(e) {
    EditorActionCreators.textChange(e.target.value);
  },

  render: function() {
    var classes = this.getClasses('editor', {
    });

    return (

      <CodeMirror onChange={this.onEditorTextChange} className={classes}  defaultValue={this.state.text} mode="javascript" lineNumbers={true} />
      );
    }
});
// <CodeMirror onChange={this.onEditorTextChange} value={this.state.editorText} className={"pure-u-1 editor "+this.state.editorClassName} lineNumbers={true} mode="text/x-ocaml" theme='monokai'/>

module.exports = Input;
