var React = require('react');
var Classable = require('../../mixins/classable.js');
var tweenState = require('react-tween-state');
var ReactTransitionGroup = React.addons.TransitionGroup;
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
var cx = React.addons.classSet;

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
  },

  getDefaultProps: function() {
    return {
      shouldAnimate: false
    };
  },

  componentDidMount: function() {
    // this.isMounted = true;
    // console.log("did mount");
    this.shouldAnimate = this.props.shouldAnimate;

  },

  // animation
  componentWillEnter: function(done) {
    if (!this.actualWidth) {
      this.actualWidth = parseFloat(window.getComputedStyle(this.getDOMNode()).width);
    }
    var duration = 250;
    this.animatedStarted = true;
    this.tweenState('width', {
      easing: tweenState.easingTypes.easeOutSine,
      duration: duration,
      endValue: this.actualWidth,
    });
    // call done
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

    // call done
    this.lastTimeoutIDLeave = window.setTimeout(function() {
      done();
    }.bind(this), duration*1.5);
  },

  // shouldComponentUpdate: function(nextProps, nextState) {
  //   // not yet mounted
  //   if (this.props.node.displayString === "format" ) {
  //     return true;
  //   }
  //
  //   if (nextState.width === 0) {
  //     return true;
  //   }
  //   // console.log(nextProps.shouldAnimate || this.props.shouldAnimate);
  //   return nextProps.shouldAnimate || this.props.shouldAnimate;
  // },

  render: function() {
    var style = {
    };

    // console.log(this.getTweeningValue('width'));
    if ( this.props.shouldAnimate && this.animatedStarted) {

      if (this.animatedStarted) {
        var width = this.getTweeningValue('width');
        style.width = width;
        // a hack to make chrome update width
        style.left = width;
      }
      // console.log("width: "+style.width +" actualWidth: "+parseFloat(window.getComputedStyle(this.getDOMNode()).width));
    }

    var parent = this.props.parent;
    var node = this.props.node;
    var formatPExprCount = this.props.count;
    var childNodes = this.props.children;
    var isWhitespace = this.props.isWhitespace;

    // label
    var labelClasses = cx({
      'label': true,
      'prim': node.expr.isPrimitive(),
    });
    var labelProps = {
      onMouseEnter: parent.onMouseOverPExpr.bind(parent, node),
      onMouseLeave: parent.onMouseOutPExpr,
      onClick: parent.onClickPExpr.bind(parent, node),
    };
    var displayString = node.displayString;
    if (displayString === "/[\\s]/") {
      displayString = ' ';
    }
    var label = <div key={"label#"+formatPExprCount} className={labelClasses} {...labelProps}>{displayString}</div>;

    // children
    var children =
      <div key={"children#"+formatPExprCount} className="children">
        {(displayString === "format") ? <ReactTransitionGroup className="childrenCSSTransitionGroup" component="div">
                                          {childNodes}
                                        </ReactTransitionGroup>
                                      : {childNodes}}
      </div>;

    // pexpr
    var pexprClasses = cx({
      'pexpr': true,
      'whitespace': isWhitespace,
    });
    var pexprProps = {
      node: node,
    };
    return <div style={style} key={"formatPExpr#"+formatPExprCount+"type:"+displayString} className={pexprClasses} {...pexprProps}>
            {label}{children}
          </div>;

  }
});

module.exports = PExpr;
