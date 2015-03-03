var React = require('react');
var assign = require('object-assign');
var ohm = require('../../libs/ohm.js');
var keyMirror = require('keymirror');
var cx = React.addons.classSet;
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
// <ReactCSSTransitionGroup transitionName="example"></ReactCSSTransitionGroup>

var Classable = require('../../mixins/classable.js');
// var WindowListenable = require('../../mixins/window-listenable.js');
var EditorStore = require('../../stores/EditorStore.js');
var EditorActionCreators = require('../../actions/EditorActionCreators.js');

function getStateFromStores() {
  return {
    text : EditorStore.getText(),
    grammar : EditorStore.getGrammar(),
    highlightedNode : EditorStore.getHighlightedNode(),
    highlightedTopLevelNode : EditorStore.getHighlightedTopLevelNode(),
  };
}

var blackholeNodeTypes = keyMirror({
  number: null,
  precision_n: null,
  '(char)*': null
});

// A blackhole node is hidden and makes all its descendents hidden too.
function isBlackhole(traceNode) {
  var desc = traceNode.displayString;
  if (desc) {
    return desc[desc.length - 1] === '_' ||
           desc === 'space' || desc === 'empty' ||
           blackholeNodeTypes[desc];
  }
  return false;
}

function shouldNodeBeVisible(traceNode) {
  // TODO: We need to distinguish between nodes that nodes that should be
  // hidden and nodes that should be collapsed by default.

  if (traceNode.displayString === "(format chars)*") {
    return false;
  }

  if (this.state.highlightedTopLevelNode) {
    var highlightedInterval = this.state.highlightedTopLevelNode.interval;
    if (highlightedInterval &&
      traceNode.interval.startIdx >= highlightedInterval.startIdx &&
        traceNode.interval.endIdx <= highlightedInterval.endIdx) {
    } else {
      if (traceNode.interval && traceNode.interval.startIdx === traceNode.interval.endIdx) {
        return false;
      }
    }
  } else {
    if (traceNode.interval && traceNode.interval.startIdx === traceNode.interval.endIdx) {
      return false;
    }
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

var topLevelNodeMouseEventDelay = 100;

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

  onMouseOverPExpr: function(node, e) {
    EditorActionCreators.highlightNode(node);
  },

  onMouseOutPExpr: function(e) {
    // Remove marker
    EditorActionCreators.highlightNode(undefined);
  },

  onMouseOverTopLevelPExpr: function(node, e) {
    if (this.lastTimeoutIDEnter) {
      window.clearTimeout(this.lastTimeoutIDEnter);
    }
    this.lastTimeoutIDEnter = window.setTimeout(function(){EditorActionCreators.highlightTopLevelNode(node);}, topLevelNodeMouseEventDelay);
  },

  onMouseOutTopLevelPExpr: function(e) {
    if (this.lastTimeoutIDLeave) {
      window.clearTimeout(this.lastTimeoutIDLeave);
    }
    this.lastTimeoutIDLeave = window.setTimeout(function(){EditorActionCreators.highlightTopLevelNode(undefined);}, topLevelNodeMouseEventDelay);
  },

  onClickPExpr: function(node, e) {
    // TODO: collapse
    console.log(node);
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
          // leaf node
          if (!childNodes.length) {
            var content = node.interval.inputStream.source
                          .substring(node.interval.startIdx, node.interval.endIdx)
                          .split("") // to array
                          .map(function(char) { return char === ' ' ? <span className="whitespace">{'·'}</span> : char; });
            if (content && content.length>0) {
              var shouldHighlight = false;
              if (self.state.highlightedNode) {
                var highlightedInterval = self.state.highlightedNode.interval;
                if (highlightedInterval &&
                    node.interval.startIdx >= highlightedInterval.startIdx &&
                    node.interval.endIdx <= highlightedInterval.endIdx) {
                    shouldHighlight = true;
                }
              }
              var inputCharClasses = cx({
                'inputChar': true,
                'highlightRule': shouldHighlight,
              });
              childNodes =
                <div className="inputCharWrapper">
                  <div className="placeholder">{content}</div>
                  <div className={inputCharClasses}>{content}</div>
                </div>;
            }
          }

          if ((shouldShowTrace && shouldNodeBeVisible.bind(self)(node)) || isWhitespace) {
            // label
            var labelClasses = cx({
              'label': true,
              'prim': node.expr.isPrimitive(),
            });
            var labelProps = {
              onMouseEnter: self.onMouseOverPExpr.bind(self, node),
              onMouseLeave: self.onMouseOutPExpr,
              onClick: self.onClickPExpr.bind(self, node),
            };
            var displayString = node.displayString;
            if (displayString === "/[\\s]/") {
              displayString = ' ';
            }
            var label = <div className={labelClasses} {...labelProps}>{displayString}</div>;
            // children
            var children = <div className="children">{childNodes}</div>;
            // pexpr
            var pexprClasses = cx({
              'pexpr': true,
              'whitespace': isWhitespace,
            });
            var pexprProps = {
              node: node,
            };
            return <div className={pexprClasses} {...pexprProps}>{label}{children}</div>;
          } else {
            return childNodes;
          }
        })
        // filter empty nodes
        .filter(function(node) {
          var ret = node === undefined || (Array.isArray(node) && node.length === 0);
          return !ret;
        });
      })(trace, undefined, undefined, true);

      // wrap top level nodes, make them line wrappable
      tree = (function transformTopLevelNodes(node) {
        if (React.isValidElement(node)) {
          var topLevelNodeProps = {
            onMouseEnter: self.onMouseOverTopLevelPExpr.bind(self, node.props.node),
            onMouseLeave: self.onMouseOutTopLevelPExpr,
          };
          return <div className="topLevelNode" {...topLevelNodeProps}>{node}</div>;
        } else {
          return node.map(function(subnode) {
            return transformTopLevelNodes(subnode);
          });
        }
      })(tree);
    }

    return (
      <div className="visualizationScrollWrapper">{/*TODO: no longer needed*/}
        <div className="visualization">
          {tree}
        </div>
      </div>
    );
  }

});

module.exports = Visualization;
