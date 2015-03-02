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
      type: ActionTypes.TEXT_CHANGE,
      value: value
    });
  },

  highlightNode: function(node) {
    AppDispatcher.handleViewAction({
      type: ActionTypes.HIGHLIGHT_NODE,
      node: node
    });
  },

};
