/**
* @jsx React.DOM
*/
'use strict';

var ipc = require('ipc');
var React = require('react');
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

var Home = React.createClass({
  getInitialState: function () {
    return {
      cert: undefined,
    };
  },
  componentDidMount: function () {
    var dom = document.body;
    dom.addEventListener('drop', this.dropped, false);
    dom.addEventListener('dragover', this.over, false);

    ipc.on('rcert', this.gotCert);
    ipc.on('transport', this.documents);
  },
  componentWillUnmount: function () {
    var dom = document.body;
    dom.removeEventListener('drop', this.dropped, false);
    dom.removeEventListener('dragover', this.over, false);

    ipc.removeListener('rcert', this.gotCert);
    ipc.removeListener('transport', this.documents);
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
    this.setState({
        cert: cert,
        doc: undefined
    });
  },
  
  documents: function (meta) {
    meta = recode(meta);
    this.setState({
        doc: meta,
        cert: undefined,
    });
  },
  render: function () {
    var name;
    if (this.state.cert) {
        name = this.state.cert.subject.commonName;
    }
    
    var doc = this.state.doc;
    if (doc) {
        doc = (<Doc header={doc.docs[0]} content={doc.content} error={doc.error} />);
    }
    return (<div>
        {doc || name}
    </div>);
  }
});

module.exports = Home;
