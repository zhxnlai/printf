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
  "(flag)*": "flags",
  "(width)?": "width",
  "(precision)?": "precision",
  "(length)?": "length",
  "specifier": "specifier",

  "flag": "flags",

  "parameter": "parameter",
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
    var node = this.getDOMNode();

    for (var oItNode = oNode; oItNode && oItNode !== node; nLeft += oItNode.offsetLeft, nTop += oItNode.offsetTop, oItNode = oItNode.offsetParent);
    node.scrollTop = nTop;
    node.scrollLeft = nLeft;

    // highlight the node
    oNode.classList.add("highlightRule");
    this.lastHighlightedNode = oNode;
  },

  showBookmark: function(sBookmark, bUseHash) {
    if (arguments.length === 1 || bUseHash) {
        location.hash = sBookmark;
        return;
    }
    // var oBookmark = this.getDOMNode().querySelector(sBookmark);
    var oBookmark = document.getElementById(sBookmark);
    if (oBookmark) {
        // special treatment for <td/>
        if (oBookmark.parentNode.tagName === "TD") {
          oBookmark = oBookmark.parentNode;
        }
        this.showNode(oBookmark);
    }
  },

  componentDidUpdate: function() {
    if (this.state.highlightedNode) {
      if (this.lastHighlightedNode) {
        this.lastHighlightedNode.classList.remove("highlightRule");
      }

      var displayString = this.state.highlightedNode.displayString;
      var elementId = displayNameToId[displayString] ? displayNameToId[displayString]
                                                     : displayString;
      this.showBookmark(elementId, false);
    }
  },

  render: function() {
    var classes = this.getClasses('explanation', {
    });

    // var subtitle = "";
    // if (this.state.highlightedNode) {
    //   var displayString = this.state.highlightedNode.displayString;
    //   subtitle = "Showing explanation for: "+displayString;
    // }<h2>{subtitle}</h2>

    return (
      <div className={classes}>
        <div className="explanation-body">
          <Format/>
        </div>
      </div>
      );
    }
});

module.exports = Explanation;
