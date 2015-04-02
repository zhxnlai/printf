var React = require('react');
var Router = require('react-router');
var mui = require('material-ui');
var AppBar = mui.AppBar;
var AppCanvas = mui.AppCanvas;
var Menu = mui.Menu;
var IconButton = mui.IconButton;
var RouteHandler = Router.RouteHandler;
var Help = require('../components/Help.jsx');
var EditorActionCreators = require('../../actions/EditorActionCreators.js');

function getStateFromStores() {
  return {
    // languages: EditorStore.getLanguages(),
  };
}

var Demo = React.createClass({
  mixins: [Router.State, Router.Navigation],

  getInitialState: function() {
    return getStateFromStores();
  },

  propTypes: {
    // single child
    children: React.PropTypes.element.isRequired
  },

  onHelpButtonTouchTap: function() {
    EditorActionCreators.highlightNode({displayString: "usage"});
  },

  render: function() {
    var title = "Printf Format String Visualizer";

    var helpButton = <IconButton className="help-button" tooltip="Help" onTouchTap={this.onHelpButtonTouchTap}>
                        <Help/>
                      </IconButton>;

    var githubButton = (
      <IconButton
        className="github-icon-button"
        iconClassName="muidocs-icon-custom-github"
        href="https://github.com/zhxnlai/printf"
        linkButton={true} tooltip="GitHub"/>
    );

    return (
      <AppCanvas className="master" predefinedLayout={1}>
        <AppBar
          className="mui-dark-theme"
          title={title}
          zDepth={1}
          showMenuIconButton={false}>
          <div className="appbar-icon-group">
            {helpButton}
            {githubButton}
          </div>
        </AppBar>

        <RouteHandler key={this.getPath()} />

      </AppCanvas>

    );
  }

});


/*
<div className="page-with-nav">
  <div className="header">
  </div>
  <div className="content">
    {this.props.children}
  </div>
</div>

*/
module.exports = Demo;
