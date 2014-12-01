'use strict';

var ipc = require('ipc');
var jk = require('jkurwa');
var fs = require('fs');
var gost89 = require('gost89'),
    algos = gost89.compat.algos;

var config = require('./config.js');

var keycoder = new jk.Keycoder(); // TODO: kill this please in jk

global.crypto = require('crypto');
if(global.crypto.getRandomValues === undefined) {
    global.crypto.getRandomValues = function(xb) {
        var i;
        var ret = global.crypto.rng(xb.length);
        if (!xb) {
            return ret;
        }
        for(i=0; i< xb.length; i++) {
            xb[i] = ret[i];
        }
        return xb;
    };
}

var box = new jk.Box({
    keys: [],
    algo: algos()
});

var keyinfo = function (key) {
  var ret = {};
  if (key.priv) {
    ret.pub = new Buffer(key.priv.pub_compress().truncate_buf8()).toString('hex');
  }
  if (key.cert) {
    ret.cert = key.cert.as_dict();
  }
  return ret;
};

var configPath = function () {
    return (__dirname + '/.keys.json');
};

var loadIntoBox = function (data) {
  var p;
  try {
    p = keycoder.parse(keycoder.maybe_pem(data));
  } catch (e) {
    return {"error": "ELOAD"};
  }

  if (p.format === 'x509') {
    box.load({cert: p});
    return true;
  }

  if (p.format === 'privkeys') {
    p.keys.map(function (key) {
      box.load({priv: key});
    });
    return true;
  }
};

var rbox = function (event, arg) {

  var ret;
  var response = function () {
        ret = {keys: box.keys.map(keyinfo)};
        event.sender.send('rbox', ret);
  };
  if (arg.get === 'status') {
    ret = true;
  }
  if (arg.load) {
    fs.readFile(arg.load, function (err, data) {
      if (!err) {
        ret = loadIntoBox(data);
      } else {
        ret = {"error": "EREAD"};
      }
      if (ret === true) {
        config.save(box);
        response();
      }
    });
  }
  if (ret === true) {
    return response();
  }
  if (ret === undefined) {
    return;
  }
  event.sender.send('rbox', ret);
};

var rguess = function (event, arg) {
    fs.readFile(arg, function (err, data) {
        if (err !== null) {
            return event.sender.send('transport', {erro: "EREAD"});
        }
        var meta;
        if (data[0] !== 0x30 && data[0] !== 0x2D) {
            meta = jk.transport.decode(data);
        } else {
            meta = {};
        }
        if (!meta.docs) {
            return event.sender.send('transport', {erro: "EFMT"});
        }
        try {
            meta = box.unwrap(data);
        } catch (e) {
            meta.eror = e;
            meta.docs = meta.docs.map(function (doc) { return doc.type; });
        }
        event.sender.send('transport', {
            header: meta.header,
            docs: meta.docs || meta.pipe,
            error: meta.error,
            content: meta.content.toString('binary'),
        });
    });
};

var rsign = function (event, path) {
    fs.readFile(path, function (err, data) {
        if (err) {
            event.sender.send('rsign', {result: false, error: "EREAD"});
            return;
        }
        try {
            var pipe = ['sign'];
            var ret = box.pipe(data, pipe);
            var signPath = path + '.sign';
            fs.writeFile(signPath, ret, function (err) {
                event.sender.send('rsign', {
                    result: err === null,
                    error: "EWRITE",
                    path: signPath,
                });
            });
        } catch (e) {
            event.sender.send('rsign', {result: false, error: "ESIGN"});
        }
    });
};

module.exports = {
    start: function (opts) {
        opts = opts || {};
        ipc.on('guess', rguess);
        ipc.on('sign', rsign);
        ipc.on('box', rbox);
        if (opts.configPath) {
            config.load(box, opts.configPath);
        }
    },
};
