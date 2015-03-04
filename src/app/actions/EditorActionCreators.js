var AppDispatcher = require('../dispatcher/AppDispatcher');
var Constants = require('../constants/Constants');

var ActionTypes = Constants.ActionTypes;

module.exports = {

  didMount: function() {
    AppDispatcher.handleViewAction({
      type: ActionTypes.DID_MOUNT,
    });
  },

  textChange: function(value) {
    AppDispatcher.handleViewAction({
      type: ActionTypes.CHANGE_TEXT,
      value: value
    });
  },

  highlightNode: function(node) {
    AppDispatcher.handleViewAction({
      type: ActionTypes.HIGHLIGHT_NODE,
      node: node
    });
  },

  highlightTopLevelNode: function(node) {
    AppDispatcher.handleViewAction({
      type: ActionTypes.HIGHLIGHT_TOP_LEVEL_NODE,
      node: node
    });
  },

  changeCursorIndex: function(index) {
    AppDispatcher.handleViewAction({
      type: ActionTypes.CHANGE_CURSOR_INDEX,
      index: index
    });
  },

};
