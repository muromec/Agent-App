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

    if (doc_type) {
      headers.push(<li key="type">Type: {doc_type}</li>);
    }

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
      if (step.error) {
        headers.push(<li key="enc">No key to decrypt</li>);
      } else {
        headers.push(<li key="enc">Encrypted</li>);
      }
    }

    return (<div>
            <ul>{headers}</ul>
            <pre>
                {this.props.error || this.props.content}
            </pre>
    </div>);
  }
});

module.exports = Doc;

