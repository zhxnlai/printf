var AppDispatcher = require('../dispatcher/AppDispatcher');
var Constants = require('../constants/Constants');
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');
var ohm = require('../libs/ohm.js');

var ActionTypes = Constants.ActionTypes;

var CHANGE_EVENT = 'change';

var DEFAULT_TEXT = 'your name: %-10s, age: %3$010.3d';

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
var SOURCE_KEY = "printf_input";
var ARGS_SOURCE_KEY = "printf_args";
var storageAvailable = typeof(Storage) !== "undefined";

// detect mobile browser
var IS_MOBILE = typeof navigator === 'undefined' || (
  navigator.userAgent.match(/Android/i)
    || navigator.userAgent.match(/webOS/i)
    || navigator.userAgent.match(/iPhone/i)
    || navigator.userAgent.match(/iPad/i)
    || navigator.userAgent.match(/iPod/i)
    || navigator.userAgent.match(/BlackBerry/i)
    || navigator.userAgent.match(/Windows Phone/i)
);

// TODO: setters should be private to file scope
var store = function() {
  var g;
  var text = DEFAULT_TEXT;
  var argsText = "";
  var args = [];

  if(storageAvailable) {
    if (localStorage.getItem(SOURCE_KEY)) {
      text = localStorage.getItem(SOURCE_KEY);
    }
    if (localStorage.getItem(ARGS_SOURCE_KEY)) {
      argsText = localStorage.getItem(ARGS_SOURCE_KEY);
    }
  }
  var highlightedNode;
  var highlightedTopLevelNode;

  var cursorIndex;

  var trace;

  return {
    getIsMobile: function() {
      return IS_MOBILE;
    },

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
    },

    getText: function() {
      return text ? text : "";
    },
    setText: function(value) {
      text = value;
      if (storageAvailable) {
        localStorage.setItem(SOURCE_KEY, value);
      }
      this.updateTrace();
    },

    getArgsText: function() {
      return argsText ? argsText : "";
    },
    setArgsText: function(value) {
      argsText = value;
      if (storageAvailable) {
        localStorage.setItem(ARGS_SOURCE_KEY, value);
      }

      // console.log(argsText);
      this.updateArgs();
    },
    updateArgs: function() {
      var newArgs = [];
      if (argsText) {
        try {
          newArgs = eval("["+argsText+"]");
        } catch(e) {
          // console.log("args parsing syntax error");
        }

        // console.log(newArgs);

        if (Array.isArray(newArgs)){
          if (newArgs.some(function(item) {
            return !(typeof item === "string" || typeof item === "number");
          })) {
            console.log("args type error");
          } else {
          }
        }

      }

      args = newArgs.filter(function(item) {
        return item !== null;
      });

    },
    getArgs: function() {
      return args ? args : [];
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
      this.updateTrace();
      return g;
    },

    updateTrace: function() {
      if (g) {
        try {
          // var jsString = eval("\""+text+"\""); // this will require source mapping
          var root = g.matchContents(text, 'Expr', true, true);
          trace = root._trace;
        } catch (e) {
          if (!(e instanceof ohm.error.MatchFailure))
            throw e;
          trace = e.state.trace;
        }
      }
    },
    getTrace: function() {
      return trace;
    }
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
      EditorStore.updateArgs();
      EditorStore.emitChange();
      break;

    case ActionTypes.CHANGE_TEXT:
      EditorStore.setText(action.value);
      EditorStore.emitChange();
      break;

    case ActionTypes.CHANGE_ARGS_TEXT:
      EditorStore.setArgsText(action.value);
      EditorStore.emitChange();
      break;

    case ActionTypes.HIGHLIGHT_NODE:
      EditorStore.highlightNode(action.node);
      EditorStore.emitChange();
      break;

    case ActionTypes.HIGHLIGHT_TOP_LEVEL_NODE:
      EditorStore.highlightTopLevelNode(action.node);
      EditorStore.emitChange();
      break;

    case ActionTypes.CHANGE_CURSOR_INDEX:
      EditorStore.setCursorIndex(action.index);
      EditorStore.emitChange();
      break;

    default:
      console.log("No implementation for action: "+action.type);
      break;
  }

});

module.exports = EditorStore;
