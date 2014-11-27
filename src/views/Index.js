/**
* @jsx React.DOM
*/
'use strict';

var ipc = require('ipc');
var React = require('react');
var Router = require('react-router');
var Link = Router.Link;
var RouteHandler = Router.RouteHandler;


var Index = React.createClass({
  getInitialState: function () {
    return {
      promptPassword: false,
      storeReady: false,
    };
  },
  storeMessage: function (msg) {
    if (msg.need === 'password') {
      this.setState({promptPassword: true, storeReady: false});
    }
    if (msg.ready === true) {
      this.setState({promptPassword: false, storeReady: true});
    }
  },
  componentDidMount: function () {
    ipc.on('store', this.storeMessage);
  },
  componentWillUnmount: function () {
    ipc.removeListener('store', this.storeMessage);
  },
  render: function() {
    var pwprompt, ready;
    if (this.state.promptPassword) {
        pwprompt = (<input type="password" ></input>);
    }
    if (this.state.storeReady) {
        ready = "Key loaded. Ready to sign, encrypt or decrypt";
    }

    return (<div>
        <title>Pure React</title>
        <div>{ready || pwprompt || "No key loaded"}</div>
        <div>
            Agent. <Link to="sign">Sign file</Link> <Link to="home">Home</Link>
        </div>
        <RouteHandler />
    </div>);
  }
});

module.exports = Index;
