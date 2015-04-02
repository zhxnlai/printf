var React = require('react');
var Classable = require('../../mixins/classable.js');
var marked = require('marked');

// using brfs transform
var fs = require('fs');
var text = fs.readFileSync(__dirname + '/../../../../resource/explanation.md', 'utf8');

var Markdown = React.createClass({
  mixins: [Classable],

  render: function() {
    var classes = this.getClasses('format', {
      "markdown-body": true
    });

    var rawMarkup = marked(text);

    return (
      <div className={classes}>
        <span dangerouslySetInnerHTML={{__html: rawMarkup}} />
      </div>
      );
    }
});

module.exports = Markdown;
