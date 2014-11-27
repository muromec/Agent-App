/**
* @jsx React.DOM
*/
'use strict';

var React = require('react');
var ipc = require('ipc');
var Doc = require('./Doc');
var encoding = require("encoding");

var recode = function (meta) {
    var step = meta.docs[0];
    var tr = (step.transport ? step.transport.header : {}) || {};

    if (tr.ENCODING === 'WIN') {

        Object.keys(tr).map(function (key) {
            tr[key] = encoding.convert(tr[key], 'utf8', 'cp1251').toString();
        });

        meta.content = encoding.convert(meta.content, 'utf8', 'cp1251').toString();
    }
    return meta;
};

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
    meta = recode(meta);
    this.setState({
        docs: meta.docs, 
        docContent: meta.content,
        docError: meta.error,
    });
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
    var name, pwprompt, doc, ready;
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
        doc = <Doc header={this.state.docs[0]} content={this.state.docContent} error={this.state.docError} />
    }
    return (<div>
        <title>Pure React</title>
        <div>Hi!</div>
        <div>{name}</div>
        <div>{pwprompt}</div>
        <div>{ready}</div>
        {doc}
    </div>);
  }
});

module.exports = Index;
