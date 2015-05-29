var React = require('react');
var Classable = require('../../mixins/classable.js');
var tweenState = require('react-tween-state');
var ReactTransitionGroup = React.addons.TransitionGroup;
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
var cx = React.addons.classSet;

function isPrimitive(expr) {
  return expr.constructor.name.indexOf('Prim') >= 0;
}

var PExpr = React.createClass({
  mixins: [Classable, tweenState.Mixin],

  getInitialState: function() {
    return {width: 0};
  },

  propTypes: {
    parent: React.PropTypes.object.isRequired,
    node: React.PropTypes.object.isRequired,
    count: React.PropTypes.number.isRequired,
    shouldAnimate: React.PropTypes.bool.isRequired,
    isInsideFormat: React.PropTypes.bool.isRequired,
  },

  getDefaultProps: function() {
    return {
      shouldAnimate: false
    };
  },

  componentDidMount: function() {
    this.shouldAnimate = this.props.shouldAnimate;
  },

  // animation
  componentWillEnter: function(done) {
    this.animatedStarted = true;

    if (!this.actualWidth) {
      this.actualWidth = parseFloat(window.getComputedStyle(this.getDOMNode()).width);
    }
    var duration = 250;
    this.tweenState('width', {
      easing: tweenState.easingTypes.easeOutSine,
      duration: duration,
      endValue: this.actualWidth,
    });
    this.lastTimeoutIDEnter = window.setTimeout(function() {
      done();
    }.bind(this), duration*1.5);
  },

  componentWillLeave: function(done) {
    this.animatedStarted = true;

    var targetWidth = 0;
    var duration = 250;
    this.tweenState('width', {
      easing: tweenState.easingTypes.easeOutSine,
      duration: duration,
      endValue: targetWidth,
    });
    this.lastTimeoutIDLeave = window.setTimeout(function() {
      done();
    }.bind(this), duration*1.5);
  },

  // TODO: performance optimization
  // shouldComponentUpdate: function(nextProps, nextState) {}

  render: function() {
    var style = {
    };

    var {shouldAnimate, parent, node, count, children, isWhitespace, isInsideFormat} = this.props;

    if ( shouldAnimate && this.animatedStarted) {
      var width = this.getTweeningValue('width');
      style.width = width;
      // console.log("width: "+style.width +" actualWidth: "+parseFloat(window.getComputedStyle(this.getDOMNode()).width));
    }

    if (isInsideFormat) {
      isWhitespace = false;
    }
    // label
    var isPrim = isPrimitive(node.expr);
    var displayString = node.displayString;
    if (displayString === "/[\\s]/") {
      displayString = '·';
      // isPrim = false;
    }
    var labelClasses = cx({
      'label': true,
      'prim': isPrim,
    });
    var labelProps = {
      onMouseEnter: parent.onMouseOverPExpr.bind(parent, node),
      onMouseLeave: parent.onMouseOutPExpr,
      onClick: parent.onClickPExpr.bind(parent, node),
    };
    var label = <div key={"label#"+count} className={labelClasses} {...labelProps}>{displayString}</div>;

    // children
    var childrenWrapper =
      <div key={"children#"+count} className="children">
        {(displayString === "format") ? <ReactTransitionGroup className="childrenCSSTransitionGroup" component="div">
                                          {children}
                                        </ReactTransitionGroup>
                                      : {children}}
      </div>;

    // pexpr
    var pexprClasses = cx({
      'pexpr': true,
      'whitespace': isWhitespace,
    });
    var pexprProps = {
      node: node,
    };
    // key={"formatPExpr#"+count+"type:"+displayString}
    return <div style={style} className={pexprClasses} {...pexprProps}>
            {label}{childrenWrapper}
          </div>;

  }
});

module.exports = PExpr;
