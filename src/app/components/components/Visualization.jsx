var React = require('react');
var assign = require('object-assign');
var ohm = require('../../libs/ohm.js');
var keyMirror = require('keymirror');
var cx = React.addons.classSet;
// var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
// <ReactCSSTransitionGroup transitionName="example"></ReactCSSTransitionGroup>
var ReactTransitionGroup = React.addons.TransitionGroup;

var PExpr = require('./PExpr.jsx');

var Classable = require('../../mixins/classable.js');
// var WindowListenable = require('../../mixins/window-listenable.js');
var EditorStore = require('../../stores/EditorStore.js');
var EditorActionCreators = require('../../actions/EditorActionCreators.js');

function getStateFromStores() {
  return {
    text : EditorStore.getText(),
    trace : EditorStore.getTrace(),
    highlightedNode : EditorStore.getHighlightedNode(),
    highlightedTopLevelNode : EditorStore.getHighlightedTopLevelNode(),
    cursorIndex: EditorStore.getCursorIndex(),
    isMobile: EditorStore.getIsMobile(),
  };
}

var blackholeNodeTypes = keyMirror({
  number: null,
  // "digit+": null,
  precision_n: null,
  '(char & (~format))*': null,
  '(char)*': null,
  'char': null,
  "('%')? (char)*": null,
});

// A blackhole node is hidden and makes all its descendents hidden too.
function isBlackhole(traceNode) {

  var desc = traceNode.displayString;
  if (desc) {
    if (desc[desc.length - 1] === '_' ||
           desc === 'space' || desc === 'empty' ||
           blackholeNodeTypes[desc]) {
      return true;
    }

    // if (desc[desc.length - 1] === '_' ||
    //        desc === 'space' || desc === 'empty' ||
    //        blackholeNodeTypes[desc]) {
    //   return true;
    // }
    // hide empty chars
    // if (desc === "chars" && traceNode.interval && traceNode.interval.startIdx === traceNode.interval.endIdx) {
    //   return true;
    // }
  }

  var ret = false;
  if (traceNode.interval) {
    // hide nodes that captures no input
    if (traceNode.interval.startIdx === traceNode.interval.endIdx) {
      ret = true;
    }

    // except when it is in a highlighted top level node
    [this.state.highlightedTopLevelNode, this.state.cursorHighlightedTopLevelNode].forEach(function(topLevelNode) {
      if (topLevelNode) {
        var highlightedInterval = topLevelNode.interval;
        if (highlightedInterval &&
          traceNode.interval.startIdx >= highlightedInterval.startIdx &&
            traceNode.interval.endIdx <= highlightedInterval.endIdx) {
          ret = false;
        }
      }
    });
  }


  return ret;
}

// TODO: use this
var shouldHideNodeTypes = keyMirror({
  "(format chars)*": null,
  "(component)*": null,
  "component": null,
  // "char": null,
});

function shouldNodeBeVisible(traceNode) {
  // TODO: We need to distinguish between nodes that nodes that should be
  // hidden and nodes that should be collapsed by default.

  var desc = traceNode.displayString;
  if (shouldHideNodeTypes[desc]) {
    return false;
  }


  switch (traceNode.expr.constructor.name) {
    case 'Alt':
    case 'Seq':
      return false;
    case 'Many':
      // Not sure if this is exactly right. Maybe better would be to hide the
      // node if it doesn't have any visible children.
      // return traceNode.interval.contents.length > 0;
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
  },

  componentWillUnmount: function() {
    EditorStore.removeChangeListener(this._onChange);
  },

  /**
   * Event handler for 'change' events coming from the stores
   */
  _onChange: function() {
    var newState = getStateFromStores();

    newState.cursorHighlightedTopLevelNode = undefined;
    React.Children.forEach(this.refs.topLevelNodeWrapper.props.children, function(child) {
      var node = child.props.node;
      var cursorIdx = newState.cursorIndex;
      if (cursorIdx !== undefined && node && node.interval) {
        if (node.interval.startIdx <= cursorIdx &&
            cursorIdx <= node.interval.endIdx ) {
          newState.cursorHighlightedTopLevelNode = node;
        }
      }
    });

    this.setState(newState);
  },

  onMouseOverPExpr: function(node, e) {
    EditorActionCreators.highlightNode(node);
  },

  onMouseOutPExpr: function(e) {
    // Remove marker
    EditorActionCreators.highlightNode(undefined);
  },

  onMouseEnterTopLevelPExpr: function(node, e) {
    // if (this.lastTimeoutIDEnter) {
    //   window.clearTimeout(this.lastTimeoutIDEnter);
    // }
    //
    // this.lastTimeoutIDEnter = window.setTimeout(function(){EditorActionCreators.highlightTopLevelNode(node);}, 100);
    if (this.lastTimeoutIDLeave) {
      window.clearTimeout(this.lastTimeoutIDLeave);
    }
    EditorActionCreators.highlightTopLevelNode(node);
  },

  onMouseLeaveTopLevelPExpr: function(e) {
    if (this.lastTimeoutIDLeave) {
      window.clearTimeout(this.lastTimeoutIDLeave);
    }
    this.lastTimeoutIDLeave = window.setTimeout(function(){EditorActionCreators.highlightTopLevelNode(undefined);}, 500);
    // EditorActionCreators.highlightTopLevelNode(undefined);
  },

  onClickPExpr: function(node, e) {
    // TODO: collapse
    console.log(node);
  },

  render: function() {
    var tree = [];
    var trace = this.state.trace;
    if (trace) {

      var inputCharWrapperCount = 0;
      var formatPExprCount = 0;
      var self = this;
      tree = (function walkTraceNodes(nodes, showTrace, isDirectChildOfFormat, isDesendenceOfFormat) {
        return nodes.map(function(node, i) {
          if (!node.succeeded) return;  // TODO: Allow failed nodes to be shown.

          var contents = node.expr.isPrimitive() ? node.interval.contents : '';
          var isWhitespace = contents.length > 0 && contents.trim().length === 0;

          var shouldShowTrace = showTrace && !isBlackhole.bind(self)(node);

          var willBeDirectChildOfFormat = isDirectChildOfFormat;
          if (shouldNodeBeVisible.bind(self)(node)) {
            willBeDirectChildOfFormat = node.displayString === "format";
          }
          var willBeDecendenceOfFormat = isDesendenceOfFormat || willBeDirectChildOfFormat;

          var childNodes = walkTraceNodes(node.children, shouldShowTrace, willBeDirectChildOfFormat, willBeDecendenceOfFormat);
          // leaf node
          if (childNodes.length === 0) {
            var content = node.interval.inputStream.source
                          .substring(node.interval.startIdx, node.interval.endIdx)
                          .split("") // to array
                          // space, new line, tab
                          .map(function(char) { return /\s/.test(char) ? <span className="whitespace">{'·'}</span> : char; });
            if (content && content.length>0) {
              var shouldHighlight = false;
              var shouldDim = false;
              if (self.state.highlightedNode) {
                var highlightedInterval = self.state.highlightedNode.interval;
                if (highlightedInterval) {
                  if (node.interval.startIdx >= highlightedInterval.startIdx &&
                     node.interval.endIdx <= highlightedInterval.endIdx) {
                   shouldHighlight = true;
                 } else {
                   shouldDim = true;
                 }
                }
              }
              var inputCharClasses = cx({
                'inputChar': true,
                // 'highlightRule': shouldHighlight,
                'dimRule': shouldDim,
              });
              inputCharWrapperCount++;
              childNodes =
                <div key={"inputCharWrapper#"+inputCharWrapperCount+"content:"+content} className="inputCharWrapper">
                  <div key={"placeholder#"+inputCharWrapperCount+"content:"+content} className="placeholder">{content}
                    <div key={"inputChar:"+Math.random()/*force to re-render, this would disable easeout animation, otherwise might cause misalignment*/} className={inputCharClasses}>{content}</div>
                  </div>
                </div>;
            }
          }

          if ((shouldShowTrace && shouldNodeBeVisible.bind(self)(node)) || isWhitespace) {
            var displayString = node.displayString;
            if (displayString === "format") {
              formatPExprCount++;
            }
            var pexprProps = {
              parent: self,
              node: node,
              count: formatPExprCount,
              children: childNodes,
              isWhitespace: isWhitespace,
              shouldAnimate: isDirectChildOfFormat,
              isInsideFormat: isDesendenceOfFormat,
            };
            // http://facebook.github.io/react/docs/multiple-components.html#dynamic-children
            return <PExpr key={"formatPExpr#"+formatPExprCount+"type:"+displayString+i} {...pexprProps}/>;
          } else {
            return childNodes;
          }
        })
        // filter empty nodes
        .filter(function(node) {
          var ret = node === undefined || (Array.isArray(node) && node.length === 0);
          return !ret;
        });
      })(trace, true, false, false);

      // wrap top level nodes, make them line wrappable
      var topLevelNodeCount = 0;
      tree = (function transformTopLevelNodes(node) {
        if (React.isValidElement(node)) {
          var topLevelNodeProps = {
            onMouseEnter: self.onMouseEnterTopLevelPExpr.bind(self, node.props.node),
            onMouseLeave: self.onMouseLeaveTopLevelPExpr,
            node: node.props.node
          };
          topLevelNodeCount++;
          return <div key={"topLevelNode#"+topLevelNodeCount} className="topLevelNode" {...topLevelNodeProps}>{node}</div>;
        } else {
          return node.map(function(subnode) {
            return transformTopLevelNodes(subnode);
          });
        }
      })(tree);

    }

    var failureMessage = "Cannot visualize:";
    if (this.state.isMobile) {
      failureMessage = "Cannot visualize on mobile browser:";
    }
    if (tree.length === 0) {
      tree = [<h1 className="failureMessage">{failureMessage}</h1>,
              <h2 className="failure">{this.state.text}</h2>];
    }

    return (
      <div className="visualizationScrollWrapper">
        <div ref="topLevelNodeWrapper" className="visualization">
          {tree}
        </div>
      </div>
    );
  }

});

// <ReactTransitionGroup key={"topLevelNode#"+topLevelNodeCount} className="topLevelNode"  {...topLevelNodeProps} component="div">
//                                   {tree}
//       </ReactTransitionGroup>;

module.exports = Visualization;
