var React = require('react');
var Classable = require('../../../mixins/classable.js');
var marked = require('marked');

var text =  "### Parameter \nParameter can be omitted or can be:\n\nCharacter|Description\n---|---\n`n$`| n is the number of the parameter to display using this format specifier, allowing the parameters provided to be output multiple times, using varying format specifiers or in different orders. If any single placeholder specifies a parameter, all the rest of the placeholders MUST also specify a parameter. This is a POSIX extension and not in C99. \nExample: `printf(\"%2$d %2$#x; %1$d %1$#x\",16,17) produces \"17 0x11; 16 0x10\"`\n";

var Parameter = React.createClass({
  mixins: [Classable],

  render: function() {
    var classes = this.getClasses('format', {
      "markdown-body": true
    });

    // classes["markdown-body"] = true

    var rawMarkup = marked(text);

    return (
      <div className={classes}>
        <span dangerouslySetInnerHTML={{__html: rawMarkup}} />
      </div>
      );
    }
});

module.exports = Parameter;
