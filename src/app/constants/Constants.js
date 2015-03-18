var keyMirror = require('keymirror');

module.exports = {

  ActionTypes: keyMirror({

    DID_MOUNT: null,

    CHANGE_TEXT: null,

    HIGHLIGHT_NODE: null,

    HIGHLIGHT_TOP_LEVEL_NODE: null,

    CHANGE_CURSOR_INDEX: null,
    
    CHANGE_ARGS_TEXT: null,

  }),


  // TODO: FIXME XXX
  PayloadSources: keyMirror({
    SERVER_ACTION: null,
    VIEW_ACTION: null
  }),

};
