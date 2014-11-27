/**
* @jsx React.DOM
*/
'use strict';

var React = require('react');
var ipc = require('ipc');
var Doc = require('./Doc');

var Index = React.createClass({
  getInitialState: function () {
    return {
      cert: undefined,
      promptPassword: false,
      storeReady: false,
    };
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
      this.setState({promptPassword: true, storeReady: false});
    }
    if (msg.ready === true) {
      this.setState({promptPassword: false, storeReady: true});
    }
  },
  documents: function (meta) {
    this.setState({docs: meta.docs});
  },
  componentDidMount: function () {
    var dom = document.body;
    dom.addEventListener('drop', this.dropped, false);
    dom.addEventListener('dragover', this.over, false);

    ipc.on('rcert', this.gotCert);
    ipc.on('store', this.storeMessage);
    ipc.on('transport', this.documents);
  },
  render: function() {
    var name, pwprompt, docs, ready;
    if (this.state.cert) {
        name = this.state.cert.subject.commonName;
    }
    if (this.state.promptPassword) {
        pwprompt = (<input type="password" ></input>);
    }
    if (this.state.storeReady) {
        ready = "Key loaded. Ready to sign, encrypt or decrypt";
    }
    if (this.state.docs) {
        var idx = 0;
        docs = this.state.docs.map(function (el) {
            idx ++;
            return (<li key={idx} ><Doc header={el} /></li>);
        });
    }
    return (<div>
        <title>Pure React</title>
        <div>Hi!</div>
        <div>{name}</div>
        <div>{pwprompt}</div>
        <div>{ready}</div>
        <ul>{docs}</ul>
    </div>);
  }
});

module.exports = Index;
