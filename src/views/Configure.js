/**
* @jsx React.DOM
*/
'use strict';

var ipc = require('ipc');
var React = require('react');
var Dropspot = require('../mixins/Dropspot');

var Configure = React.createClass({
  mixins: [Dropspot],
  getInitialState: function () {
    return {
        keys: undefined,
        loading: false,
    };
  },
  dropFile: function (f) {
    ipc.send("box", {load: f.path});
    this.setState({loading: true});
  },
  componentDidMount: function () {
    ipc.on('rbox', this.boxChanged);
    ipc.send('box', {get: 'status'});
  },
  componentWillUnmount: function () {
    ipc.removeListener('rbox', this.boxChanged);
  },
  boxChanged: function (info) {
    this.setState({loading: false, keys: info.keys});
  },
  render: function () {
    var keys;
    if (this.state.keys && this.state.keys.length) {
        keys = this.state.keys.map(function (el) {
            var pub_short = el.pub.substr(0, 8);
            var cert;
            if (el.cert) {
                cert = (<span>{el.cert.subject.commonName} {el.cert.subject.title}</span>);
            } else {
                cert = (<span>Not cert loaded</span>);
            }
            return (<li key={el.pub} >{pub_short} {cert}</li>);
        });
        keys = (<ul>{keys}</ul>);
    }
    return (<div>
        <h2>Configure</h2>
        {keys}
    </div>);
  },
});

module.exports = Configure;
