var React = require('react');
var Classable = require('../../mixins/classable.js');
var assign = require('object-assign');
var CodeMirror = require('react-code-mirror');
require('codemirror/addon/display/placeholder.js');

var EditorStore = require('../../stores/EditorStore.js');
var EditorActionCreators = require('../../actions/EditorActionCreators.js');

var printf = require('../../libs/stringformat.js');

function getStateFromStores() {
  return {
    text : EditorStore.getText(),
    argsText : EditorStore.getArgsText(),
    argsErrorMsg : EditorStore.getArgsErrorMsg(),
    args : EditorStore.getArgs(),
    highlightedNode : EditorStore.getHighlightedNode(),
  };
}

var Printer = React.createClass({
  mixins: [Classable],

  getInitialState: function() {
    return assign(getStateFromStores(), {
      inputs: []
    });
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
    if (this.state.argsErrorMsg !== undefined) {
      // this.highlight(this.state.argsErrorMsg);
    }
  },

  onEditorTextChange: function(e) {
    EditorActionCreators.changeArgsText(e.target.value);
  },

  highlight: function(msg) {
    var cm = this.refs.codeMirror.editor;
    if (this.lineWidget) {
      cm.removeLineWidget(this.lineWidget);
    }
    if (cm && msg) {
      var msgEl = document.createElement("div");
      msgEl.className = "errorMsg";
      msgEl.appendChild(document.createTextNode(msg));

      this.lineWidget = cm.addLineWidget(0, msgEl, {coverGutter: false, noHScroll: true});
    } else {
      // console.log("code mirror not available");
    }
  },

  render: function() {
    var classes = this.getClasses('printer', {
    });

    var {args, text, argsText} = this.state;

    var preview = "Preview not available.";
    var results = "Results not available.";

    if (args && text) {
      var argsString = argsText.length === 0 ? "" : ", "+argsText;
      preview = "printf(\""+text+"\""+argsString+");";

      try {
        results = eval(preview);
      } catch(e) {
        console.log(e);
        results = e.toString();
      }
    }

    var props = {
      lineWrapping: true,
      viewportMargin: Infinity,
      onChange: this.onEditorTextChange,
      defaultValue: argsText,
      placeholder: "Insert arguments here..."
    };

    return (
      <div className={classes}>
        <div className="upper">
          <div className="left">
            {"Arguments: "}
            <div className="placeholder">{"Arguments: "}</div>
          </div>
          <div className="right"><CodeMirror ref="codeMirror" {...props}/></div>
        </div>
        <div className="middle">
          <div className="left">{"Preview: "}
            <div className="placeholder">{"Arguments: "}</div>
          </div>
          <div className="right"><pre>{preview}</pre></div>
        </div>
        <div className="lower">
          <div className="left">{"Results: "}
            <div className="placeholder">{"Arguments: "}</div>
          </div>
          <div className="right"><pre>{results}</pre></div>
        </div>
      </div>
      );
    }
});

module.exports = Printer;
