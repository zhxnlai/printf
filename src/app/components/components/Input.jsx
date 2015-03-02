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

var Input = React.createClass({
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

  componentDidUpdate: function() {
    // var el = this.getDOMNode();
    // d3Chart.update(el, this.getChartState());
    if (this.state.highlightedNode) {
      this.highlight(this.state.highlightedNode.interval, 'highlightRule');
    }
  },

  onEditorTextChange: function(e) {
    EditorActionCreators.textChange(e.target.value);
  },

  highlight: function(interval, className) {
    var cm = this.refs.codeMirror.editor;
    cm.getAllMarks().forEach(function(m) { m.clear(); });
    if (cm && interval) {
      var startPos = cm.posFromIndex(interval.startIdx),
          endPos = cm.posFromIndex(interval.endIdx);
      cm.markText(startPos, endPos, { className: className });
    } else {
      // console.log("code mirror not available");
    }
  },

  render: function() {
    var classes = this.getClasses('editor', {
    });

    // if (this.state.highlightedNode) {
    //   console.log(this.state.highlightedNode);
    // }
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
        <div className="mid"><CodeMirror ref="codeMirror" {...props}/></div>
        <code className="right">{", ...);"}</code>
      </div>
      );
    }
});
// <CodeMirror onChange={this.onEditorTextChange} value={this.state.editorText} className={"pure-u-1 editor "+this.state.editorClassName} lineNumbers={true} mode="text/x-ocaml" theme='monokai'/>

module.exports = Input;
