var keyMirror = require('keymirror');

module.exports = {

  ActionTypes: keyMirror({
    // keyboard
    KEY_LEFT: null,
    KEY_RIGHT: null,
    KEY_UP: null,
    KEY_DOWN: null,
    KEY_HOME: null,
    KEY_END: null,
    KEY_BACKSPACE: null,
    KEY_ENTER: null,

    DID_MOUNT: null,

    KEY_PRESS: null,

    UPDATE_CURSOR: null,

    TEXT_CHANGE: null,

  }),


  // TODO: FIXME XXX
  PayloadSources: keyMirror({
    SERVER_ACTION: null,
    VIEW_ACTION: null
  }),

};
