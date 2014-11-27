'use strict';

var ipc = require('ipc');
var jk = require('jkurwa');
var fs = require('fs');

var keycoder = new jk.Keycoder(); // TODO: kill this please in jk

var algos = function (em_gost) {
    return {
        kdf: em_gost.gost_kdf,
        keywrap: em_gost.gost_keywrap,
        keyunwrap: em_gost.gost_unwrap,
        encrypt: em_gost.gost_encrypt_cfb,
        decrypt: em_gost.gost_decrypt_cfb,
        hash: em_gost.compute_hash,
        storeload: em_gost.decode_data,
    };
};

var box;
var loadCrypto = function (path) {
    if (box !== undefined && path === undefined) {
        return box;
    }
    var em_gost = require('em-gost');
    var keys = [];
    if (path) {
        keys.push({
            privPath: path,
        });
    }
    box = new jk.Box({
        keys: keys,
        algo: algos(em_gost)
    });
    return box;
};

var rguess = function (event, arg) {
    fs.readFile(arg, function (err, data) {
        var p;
        var meta;
        if (data[0] !== 0x30 && data[0] !== 0x2D) {
            meta = jk.transport.decode(data);
        } else {
            meta = {};
        }
        if (meta.docs) {
            try {
                loadCrypto();
                meta = box.unwrap(data);
            } catch (e) {
                console.log('uwrap failed', e);
                meta.eror = e;
                meta.docs = meta.docs.map(function (doc) { return doc.type; });
            }
            event.sender.send('transport', {
                header: meta.header,
                docs: meta.docs || meta.pipe,
                error: meta.error,
                content: meta.content.toString('binary'),
                });
            return;
        }
        try {
            p = keycoder.parse(keycoder.maybe_pem(data));
        } catch (e) {
            event.sender.send('rcert', {error: "Oops.."});
            return;
        }
        if (p.format === 'x509') {
            event.sender.send('rcert', p.as_dict());
        }
        if (p.format === 'IIT' || p.format === 'PBES2') {
            event.sender.send('store', {need: 'password', path: arg});
        }
        if (p.format === 'privkeys') {
            loadCrypto(arg);
            event.sender.send('store', {ready: true});
        }
    });
};

var rsign = function (event, path) {
    fs.readFile(path, function (err, data) {
        if (err) {
            event.sender.send('rsign', {result: false, error: "EREAD"});
            return;
        }
        try {
            loadCrypto();
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
    start: function () {
        ipc.on('guess', rguess);
        ipc.on('sign', rsign);
    },
};
