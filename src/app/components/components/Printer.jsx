var React = require('react');
var Classable = require('../../mixins/classable.js');

var assign = require('object-assign');

var CodeMirror = require('react-code-mirror');
require('codemirror/addon/display/placeholder.js');

var EditorStore = require('../../stores/EditorStore.js');
var EditorActionCreators = require('../../actions/EditorActionCreators.js');

var format = require('../../libs/stringformat.js');

function getStateFromStores() {
  return {
    text : EditorStore.getText(),
    argsText : EditorStore.getArgsText(),
    args : EditorStore.getArgs(),
    trace : EditorStore.getTrace(),
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
    // if (this.state.highlightedNode) {
    //   this.highlight(this.state.highlightedNode.interval, 'highlightRule');
    // }
  },

  onEditorTextChange: function(e) {
    EditorActionCreators.changeArgsText(e.target.value);
  },

  handleCursorActivity: function() {
    var cm = this.refs.codeMirror.editor;
    var cursorIndex = cm.indexFromPos(cm.getCursor());
    EditorActionCreators.changeCursorIndex(cursorIndex);
  },

  // highlight: function(interval, className) {
  //   var cm = this.refs.codeMirror.editor;
  //   cm.getAllMarks().forEach(function(m) { m.clear(); });
  //   if (cm && interval) {
  //     var startPos = cm.posFromIndex(interval.startIdx),
  //         endPos = cm.posFromIndex(interval.endIdx);
  //     cm.markText(startPos, endPos, { className: className });
  //   } else {
  //     // console.log("code mirror not available");
  //   }
  // },

  render: function() {
    var classes = this.getClasses('printer', {
      // "prin": true
    });


    var formatNodes = [];
    var trace = this.state.trace;
    if (trace) {
      (function findFormatNodes(nodes) {
        nodes.forEach(function(node, i) {
          var displayString = node.displayString;
          if (displayString === "format") {
            if (node.interval.startIdx < node.interval.endIdx) {
              formatNodes.push(node);
            }
          } else {
            // no format inside format
            findFormatNodes(node.children);
          }
        });
      })(trace);
    }

    var args = this.state.args;
    var text = this.state.text;

    // console.log(JSON.stringify(args));

    var preview = "Preview not available.";
    var results = "Results not available.";
    var numArgsString = "("+args.length+"/"+formatNodes.length+")";

    if (args && text) {
      var argsString = args.length === 0 ? "" : ", "+args.map(function(item) {
        return JSON.stringify(item);
      }).join(", ");
      preview = "printf(\""+text+"\""+argsString+");";

      if (args.length > 0) {
        var fullArgs = args.slice();
        try {
          fullArgs.unshift(JSON.parse("\""+text+"\""));
          results = format.apply(null, fullArgs);
        } catch(e) {
          console.log(e);
          results = e.toString();
        }
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
          <code className="left">{"Args"+numArgsString+": "}</code>
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
