/**
* @jsx React.DOM
*/
'use strict';

var React = require('react');
var ipc = require('ipc');

var Index = React.createClass({
  getInitialState: function () {
    return {cert: undefined};
  },
  dropped: function (evt) {
    evt.stopPropagation();
    evt.preventDefault();

    var idx, f;
    for (idx = 0; idx < evt.dataTransfer.files.length; idx++ ) {
        f = evt.dataTransfer.files[idx];
        ipc.send('cert', f.path);
    }
  },
  over: function (evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy';
  },
  gotCert: function (cert) {
    this.setState({cert: cert});
  },
  componentDidMount: function () {
    var dom = document.body;
    dom.addEventListener('drop', this.dropped, false);
    dom.addEventListener('dragover', this.over, false);

    ipc.on('rcert', this.gotCert);
  },
  render: function() {
    var name;
    if (this.state.cert) {
        name = this.state.cert.subject.commonName;
    }
    return (<div>
        <title>Pure React</title>
        <div>Hi!</div>
        <div>{name}</div>
    </div>);
  }
});

module.exports = Index;
