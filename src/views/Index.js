/**
* @jsx React.DOM
*/
'use strict';

var React = require('react');

var Index = React.createClass({
  render: function() {
    return (
      <html>
        <head>
          <title>Pure React</title>
        </head>
        <body>
        <div>Hi!</div>
        </body>
      </html>
    );
  }
});

module.exports = Index;
