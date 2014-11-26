/**
* @jsx React.DOM
*/
'use strict';

var React = require('react');
var ipc = require('ipc');

var Index = React.createClass({
  getInitialState: function () {
    return {cert: undefined, promptPassword: false};
  },
  dropped: function (evt) {
    evt.stopPropagation();
    evt.preventDefault();

    var idx, f;
    for (idx = 0; idx < evt.dataTransfer.files.length; idx++ ) {
        f = evt.dataTransfer.files[idx];
        ipc.send('guess', f.path);
    }
  },
  over: function (evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy';
  },
  gotCert: function (cert) {
    if (cert.error) {
      console.log('errr', cert.error);
      return;
    }
    this.setState({cert: cert});
  },
  storeMessage: function (msg) {
    if (msg.need === 'password') {
      this.setState({promptPassword: true});
    }
  },
  componentDidMount: function () {
    var dom = document.body;
    dom.addEventListener('drop', this.dropped, false);
    dom.addEventListener('dragover', this.over, false);

    ipc.on('rcert', this.gotCert);
    ipc.on('store', this.storeMessage);
  },
  render: function() {
    var name, pwprompt;
    if (this.state.cert) {
        name = this.state.cert.subject.commonName;
    }
    if (this.state.promptPassword) {
        pwprompt = (<input type="password" ></input>);
    }
    return (<div>
        <title>Pure React</title>
        <div>Hi!</div>
        <div>{name}</div>
        <div>{pwprompt}</div>
    </div>);
  }
});

module.exports = Index;
