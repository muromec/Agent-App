'use strict';
var fs = require('fs');

var loadConfig = function (box, path) {
  fs.readFile(path, function (err, data) {
    if (err !== null) {
      if (err.code === 'ENOENT') {
        console.log('no config found. fresh install?');
        return;
      }
      console.error('Write error', err);
      return;
    }

    var config = JSON.parse(data);
    Object.keys(config.keys).map(function (idx) {
      var keyinfo = config.keys[idx];
      box.load(keyinfo);
    });
  });
};

var saveConfig = function (box, path) {
    var struct = {};
    path = path || box._configPath;

    box.keys.map(function (keyinfo) {
        var priv = keyinfo.priv || {};
        var cert = keyinfo.cert || {};

        var pub = cert.pub || priv.pub();
        var idx = pub.point.toString();
        var section = struct[idx] || {};
        section.privPem = priv.as_pem && priv.as_pem();
        section.certPem = cert.as_pem && cert.as_pem();
        section.identity = cert.as_dict && cert.as_dict();
        section.label = keyinfo.label;
        section.role = keyinfo.role;
        struct[idx] = section;
    });

    fs.writeFile(path, JSON.stringify({keys: struct}), function (err) {
        console.log('config saved', err);
    });
};

module.exports = {
    load: loadConfig,
    save: saveConfig,
};
