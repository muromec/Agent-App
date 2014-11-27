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
var loadCrypto = function () {
    if (box !== undefined) {
        return box;
    }
    var em_gost = require('em-gost');
    box = new jk.Box({
        keys: [],
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
                var box = loadCrypto();
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
                });
            return;
        }
        try {
            p = keycoder.parse(data);
        } catch (e) {
            event.sender.send('rcert', {error: "Oops.."});
            return;
        }
        if (p.format === 'x509') {
            event.sender.send('rcert', {subject: p.subject});
        }
        if (p.format === 'IIT' || p.format === 'PBES2') {
            event.sender.send('store', {need: 'password', path: arg});
        }
        if (p.format === 'privkeys') {
            event.sender.send('store', {ready: true});
        }
    });
};

module.exports = {
    start: function () {
        ipc.on('guess', rguess);
    },
};
