/**
* @jsx React.DOM
*/
'use strict';

var React = require('react');


var Dropspot = {
  componentDidMount: function () {
    var dom = document.body;
    dom.addEventListener('drop', this.dropped, false);
    dom.addEventListener('dragover', this.over, false);
  },
  componentWillUnmount: function () {
    var dom = document.body;
    dom.removeEventListener('drop', this.dropped, false);
    dom.removeEventListener('dragover', this.over, false);
  },
  dropped: function (evt) {
    evt.stopPropagation();
    evt.preventDefault();

    if (!this.dropFile) {
      return;
    }
    var idx = 0;
    var f;
    while (f = evt.dataTransfer.files[idx++]) {
      this.dropFile(f);
    }
  },
  over: function (evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy';
  },

};

module.exports = Dropspot;
