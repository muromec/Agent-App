'use strict';
var React = require('react');

var Doc = React.createClass({
  render: function () {
    var step = this.props.header;
    var tr = (step.transport ? step.transport.header : {}) || {};
    var doc_type = (step.transport ? step.transport.doc_type : undefined);
    if (typeof step === 'string') {
      doc_type = step;
    }
    var x = step.cert;
    var headers = [];

    if (tr.SUBJECT) {
      headers.push(<li key="subj">Subject: {tr.SUBJECT}</li>);
    }

    if (tr.FILENAME) {
      headers.push(<li key="filename">Filename: {tr.FILENAME}</li>);
    }

    if (tr.EDRPOU) {
      headers.push(<li key="tedrpou">Sent-By-EDRPOU: {tr.EDRPOU}</li>);
    }

    if (step.signed) {
      headers.push(<li key="cn">Signed-By: {x.subject.commonName}</li>);
      headers.push(<li key="edrpou">Signed-By-EDRPOU: {x.extension.ipn.EDRPOU}</li>);
    }
    if (step.enc) {
      headers.push(<li key="enc">Encrypted</li>);
    }

    return (<div>
            {doc_type}
            <ul>{headers}</ul>
    </div>);
  }
});

module.exports = Doc;

