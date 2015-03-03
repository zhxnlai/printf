var AppDispatcher = require('../dispatcher/AppDispatcher');
var Constants = require('../constants/Constants');
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');
var ohm = require('../libs/ohm.js');

var ActionTypes = Constants.ActionTypes;

var CHANGE_EVENT = 'change';

// Misc Helpers
// ------------
String.prototype.splice = function(idx, rem, s) {
  return (this.slice(0, idx) + s + this.slice(idx + Math.abs(rem)));
};

function clone(obj) {
  var result = {};
  for (var k in obj) {
    if (obj.hasOwnProperty(k))
      result[k] = obj[k];
  }
  return result;
}

// HTML5 storage API
var SOURCE_KEY = "optSource";
var storageAvailable = typeof(Storage) !== "undefined";

var store = function() {
  var g;
  var text = 'your name: %-10s, age: %3$010.3d';
  if(storageAvailable && localStorage.getItem(SOURCE_KEY)) {
    text = localStorage.getItem(SOURCE_KEY);
  }
  var highlightedNode;
  var highlightedTopLevelNode;

  var cursorIndex;

  return {
    getHighlightedNode: function() {
      return highlightedNode;
    },
    highlightNode: function(node) {
      highlightedNode = clone(node);
      // console.log(highlightedNode);
    },

    getHighlightedTopLevelNode: function() {
      return highlightedTopLevelNode;
    },
    highlightTopLevelNode: function(node) {
      highlightedTopLevelNode = clone(node);
    },

    getCursorIndex: function() {
      return cursorIndex;
    },
    setCursorIndex: function(index) {
      cursorIndex = index;
      console.log(cursorIndex);
    },

    getText: function() {
      return text ? text : "";
    },

    setText: function(value) {
      text = value;
      if (storageAvailable) {
        localStorage.setItem(SOURCE_KEY, value);
      }
    },

    getGrammar: function(namespace, domId, grammar) {
      if (!g) {
        try {
          g = ohm.namespace(namespace)
            .loadGrammarsFromScriptElement(document.getElementById(domId))
            .grammar(grammar);
        } catch (err) {
          g = undefined;
          console.log(err);
        }
      }
      return g;
    },
  };
};

var EditorStore = assign({}, EventEmitter.prototype, store(), {

  emitChange: function() {
    this.emit(CHANGE_EVENT);
  },

  /**
   * @param {function} callback
   */
  addChangeListener: function(callback) {
    this.on(CHANGE_EVENT, callback);
  },

  removeChangeListener: function(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  },

});

EditorStore.dispatchToken = AppDispatcher.register(function(payload) {
  var action = payload.action;
  switch (action.type) {
    case ActionTypes.DID_MOUNT:
      var g = EditorStore.getGrammar('demo', 'arithmetic', 'MyLang');
      EditorStore.emitChange();
      break;

    case ActionTypes.TEXT_CHANGE:
      var value = action.value;
      EditorStore.setText(value);
      EditorStore.emitChange();
      break;

    case ActionTypes.HIGHLIGHT_NODE:
      var node = action.node;
      EditorStore.highlightNode(node);
      EditorStore.emitChange();
      break;

    case ActionTypes.HIGHLIGHT_TOP_LEVEL_NODE:
      var node = action.node;
      EditorStore.highlightTopLevelNode(node);
      EditorStore.emitChange();
      break;

    case ActionTypes.CHANGE_CURSOR_INDEX:
      var idx = action.index;
      EditorStore.setCursorIndex(idx);
      EditorStore.emitChange();
      break;

    default:
      console.log(action.type);
      break;
  }

});

module.exports = EditorStore;
