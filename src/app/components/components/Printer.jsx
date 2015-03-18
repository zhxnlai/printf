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
    // trace : EditorStore.getTrace(),
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

  componentDidUpdate: function() {
    if (this.state.argsErrorMsg !== undefined) {
      // this.highlight(this.state.argsErrorMsg);
    }
  },

  onEditorTextChange: function(e) {
    EditorActionCreators.changeArgsText(e.target.value);
  },

  // handleCursorActivity: function() {
  //   var cm = this.refs.codeMirror.editor;
  //   var cursorIndex = cm.indexFromPos(cm.getCursor());
  //   EditorActionCreators.changeCursorIndex(cursorIndex);
  // },

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
      // "prin": true
    });


    // var formatNodes = [];
    // var trace = this.state.trace;
    // if (trace) {
    //   (function findFormatNodes(nodes) {
    //     nodes.forEach(function(node, i) {
    //       var displayString = node.displayString;
    //       if (displayString === "format") {
    //         if (node.interval.startIdx < node.interval.endIdx) {
    //           formatNodes.push(node);
    //         }
    //       } else {
    //         // no format inside format
    //         findFormatNodes(node.children);
    //       }
    //     });
    //   })(trace);
    // }

    var args = this.state.args;
    var text = this.state.text;

    // console.log(JSON.stringify(args));

    var preview = "Preview not available.";
    var results = "Results not available.";
    var numArgsString = "";// "("+args.length+"/"+formatNodes.length+")";

    if (args && text) {
      var argsString = this.state.argsText.length === 0 ? "" : ", "+this.state.argsText;
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
      // lineNumbers: true,
      onChange: this.onEditorTextChange,
      defaultValue: this.state.argsText,
      placeholder: "Insert arguments here..."
    };

    return (
      <div className={classes}>
        <div className="upper">
          <code className="left">{"Arguments: "}</code>
          <div className="right"><CodeMirror ref="codeMirror" {...props}/></div>
        </div>
        <div className="middle">
          <code className="left">{"Preview: "}</code>
          <div className="right"><pre>{preview}</pre></div>
        </div>
        <div className="lower">
          <code className="left">{"Results: "}</code>
          <div className="right"><pre>{results}</pre></div>
        </div>
      </div>
      );
    }
});

module.exports = Printer;
