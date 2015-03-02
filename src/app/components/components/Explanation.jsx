var React = require('react');
var Classable = require('../../mixins/classable.js');
var assign = require('object-assign');

var EditorStore = require('../../stores/EditorStore.js');
var EditorActionCreators = require('../../actions/EditorActionCreators.js');

var Format = require('./Format.jsx');

function getStateFromStores() {
  return {
    highlightedNode : EditorStore.getHighlightedNode(),
  };
}

var displayNameToId = {
  "format": "format-placeholders",
  "(parameter)?": "parameter",
  "(flags)?": "flags",
  "(width)?": "width",
  "(precision)?": "precision",
  "(length)?": "length",
  "specifier": "specifier",

  "parameter": "parameter",
  "flags": "flags",
  "width": "width",
  "precision": "precision",
  "length": "length",

};

var Explanation = React.createClass({
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

  showNode: function (oNode) {
    var nLeft = 0, nTop = 0;
    for (var oItNode = oNode; oItNode; nLeft += oItNode.offsetLeft, nTop += oItNode.offsetTop, oItNode = oItNode.offsetParent);
    var node = this.getDOMNode();
    node.scrollTop = nTop;
    node.scrollLeft = nLeft;

    // TODO: highlight the node
  },

  showBookmark: function(sBookmark, bUseHash) {
    if (arguments.length === 1 || bUseHash) {
        location.hash = sBookmark;
        return;
    }
    // var oBookmark = this.getDOMNode().querySelector(sBookmark);
    var oBookmark = document.getElementById(sBookmark);
    if (oBookmark) {
        this.showNode(oBookmark);
    }
  },

  componentDidUpdate: function() {
    if (this.state.highlightedNode) {
      var displayString = this.state.highlightedNode.displayString;
      var elementId = displayNameToId[displayString] ? displayNameToId[displayString]
                                                     : displayString;
      this.showBookmark(elementId, false);
    }
  },

  render: function() {
    var classes = this.getClasses('explanation', {
    });

    // console.log(this.state.highlightedNode);
    var subtitle = "";
    if (this.state.highlightedNode) {
      var displayString = this.state.highlightedNode.displayString;
      subtitle = "Showing explanation for: "+displayString;
    }

    return (
      <div className={classes}>
        <div className="explanation-body">
          <h1>Printf Format String</h1>
          <h2>{subtitle}</h2>
          <Format/>
        </div>
      </div>
      );
    }
});

module.exports = Explanation;
