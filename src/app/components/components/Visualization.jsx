var React = require('react');
var assign = require('object-assign');
var ohm = require('../../libs/ohm.js');
var keyMirror = require('keymirror');
var cx = React.addons.classSet;

var Classable = require('../../mixins/classable.js');
// var WindowListenable = require('../../mixins/window-listenable.js');
var EditorStore = require('../../stores/EditorStore.js');
var EditorActionCreators = require('../../actions/EditorActionCreators.js');

function getStateFromStores() {
  return {
    text : EditorStore.getText(),
    grammar : EditorStore.getGrammar(),
  };
}

var blackholeTypes = keyMirror({
  number: null,
  // chars: null,
});
blackholeTypes['(char)*'] = true;

// A blackhole node is hidden and makes all its descendents hidden too.
function isBlackhole(traceNode) {
  var desc = traceNode.displayString;
  if (desc) {
    return desc[desc.length - 1] === '_' ||
           desc === 'space' || desc === 'empty' ||
           blackholeTypes[desc];
  }
  return false;
}

function shouldNodeBeVisible(traceNode) {
  // TODO: We need to distinguish between nodes that nodes that should be
  // hidden and nodes that should be collapsed by default.

  if (traceNode.displayString === "(format chars)*") {
    return false;
  }

  switch (traceNode.expr.constructor.name) {
    case 'Alt':
    case 'Seq':
      return false;
    case 'Many':
      // Not sure if this is exactly right. Maybe better would be to hide the
      // node if it doesn't have any visible children.
      return traceNode.interval.contents.length > 0;
    default:
      // Hide things that don't correspond to something the user wrote.
      if (!traceNode.expr.interval)
        return false;
  }


  return true;
}


var Visualization = React.createClass({
  mixins: [Classable],

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


  onMouseOverPExpr: function(e) {
    console.log("over");
  },

  onMouseOutPExpr: function(e) {
    console.log("out");
  },

  onClickPExpr: function(e) {
    console.log("click");
  },

  render: function() {

    var tree = <h1>{this.state.text}</h1>;
    var m = this.state.grammar;
    if (m) {
      var text = this.state.text;
      var trace;
      try {
        var root = m.matchContents(text, 'Expr', true, true);
        trace = root._trace;
      } catch (e) {
        if (!(e instanceof ohm.error.MatchFailure))
          throw e;
        trace = e.state.trace;
      }

      var self = this;
      tree = (function walkTraceNodes(nodes, container, inputContainer, showTrace) {
        return nodes.map(function(node) {
          if (!node.succeeded) return;  // TODO: Allow failed nodes to be shown.

          var contents = node.expr.isPrimitive() ? node.interval.contents : '';
          var isWhitespace = contents.length > 0 && contents.trim().length === 0;

          var shouldShowTrace = showTrace && !isBlackhole(node);

          var childNodes = walkTraceNodes(node.children, undefined, undefined, shouldShowTrace);
          if (!childNodes.length) {
            var content = node.interval.inputStream.source
                          .substring(node.interval.startIdx, node.interval.endIdx)
                          .split("") // to array
                          .map(function(char) {
                            if (char === ' ') {
                              return <span className="whitespace">{'·'}</span>;
                            } else {
                              return char;
                            }
                          });
            if (content) {
              childNodes =
                <div className="inputCharWrapper">
                  <div className="placeholder">{content}</div>
                  <div className="inputChar">{content}</div>
                </div>;
            }
          }

          if ((shouldShowTrace && shouldNodeBeVisible(node)) || isWhitespace) {
            var labelClasses = cx({
              'label': true,
              'prim': node.expr.isPrimitive(),
            });
            var displayString = node.displayString;
            if (displayString === "/[\\s]/") {
              displayString = ' ';
            }
            var label = <div className={labelClasses}>{displayString}</div>;
            var children = <div className="children">{childNodes}</div>;
            var pexprClasses = cx({
              'pexpr': true,
              'whitespace': isWhitespace,
            });
            // console.log(this.onMouseOverPExpr);
            var props = {
              onMouseOver: self.onMouseOverPExpr,
              onMouseOut: self.onMouseOutPExpr,
              onClick: self.onClickPExpr
            };
            return <div className={pexprClasses} {...props}>{label}{children}</div>;
          } else {
            return childNodes;
          }
        }).filter(function(node) {
          var ret = node === undefined || (Array.isArray(node) && node.length === 0);
          return !ret;
        });
      })(trace, undefined, undefined, true);

      // console.log(tree);

      // React.isValidElement
      tree = (function transformTopLevelNodes(node) {
        if (React.isValidElement(node)) {
          return <div className="topLevelNode">{node}</div>;
        } else {
          return node.map(function(subnode) {
            return transformTopLevelNodes(subnode);
          });
        }
      })(tree);

      // tree = (function transformTopLevelNodes(root) {
      //   if (root.length === 1) {
      //     return transformTopLevelNodes(root[0]);
      //   } else {
      //     // console.log(root.length);
      //     return root.map(function(topLevelNode) {
      //       return <div className="topLevelNode">{topLevelNode}</div>;
      //     });
      //   }
      // })(tree);

    }

    return (
      <div className="visualizationScrollWrapper">
        <div className="visualization">
          {tree}
        </div>
      </div>
    );
  }

});

module.exports = Visualization;
