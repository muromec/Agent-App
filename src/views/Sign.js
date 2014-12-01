/**
* @jsx React.DOM
*/
'use strict';

var ipc = require('ipc');
var fs = require('fs');
var React = require('react');
var Dropspot = require('../mixins/Dropspot');

var Sign = React.createClass({
  mixins: [Dropspot],
  getInitialState: function () {
    return {
      file: undefined,
      content: undefined,
      signed: false,
      signPath: undefined,
    };
  },
  componentDidMount: function () {
    ipc.on('rsign', this.signed);
  },
  componentWillUnmount: function () {
    ipc.removeListener('rsign', this.signed);
  },
  signed: function(result) {
    this.setState({signed: result.result, signPath: result.path});
  },
  dropFile: function (f) {
    this.setState({file: f});
    fs.readFile(f.path, (function (error, data) {
      this.setState({content: data});
    }).bind(this));
  },
  doSign: function () {
    ipc.send('sign', this.state.file.path);
  },
  render: function () {
    var label, text, btn;
    if (this.state.file === undefined) {
      label = (<h2>Drop something to sign</h2>);
    } else {
      label = (<h2>File {this.state.file.path}</h2>);
      btn = (<button onClick={this.doSign}>Sign file</button>);
    }
    if (this.state.content) {
      text = this.state.content.toString('binary');
    }
    return (<div>
      {label}
      {btn}
      {this.state.signPath}
      {this.state.signed}
      <pre>
        {text}
      </pre>
    </div>);
  }
});

module.exports = Sign;

