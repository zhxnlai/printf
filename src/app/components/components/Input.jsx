var React = require('react');
var Classable = require('../../mixins/classable.js');
var assign = require('object-assign');

var CodeMirror = require('react-code-mirror');

var EditorStore = require('../../stores/EditorStore.js');
var EditorActionCreators = require('../../actions/EditorActionCreators.js');

function getStateFromStores() {
  return {
    text : EditorStore.getText(),
  };
}

var Input = React.createClass({
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

    var props = {
      lineWrapping: true,
      viewportMargin: Infinity,
      lineNumbers: true,

      onChange: this.onEditorTextChange,
      defaultValue: this.state.text,
    };

    return (
      <div className={classes} >
        <code className="left">{"printf("}</code>
        <div className="mid"><CodeMirror {...props}/></div>
        <code className="right">{", ...);"}</code>
      </div>
      );
    }
});
// <CodeMirror onChange={this.onEditorTextChange} value={this.state.editorText} className={"pure-u-1 editor "+this.state.editorClassName} lineNumbers={true} mode="text/x-ocaml" theme='monokai'/>

module.exports = Input;
