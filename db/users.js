var datos = require('../data.json');
var json = require('json-update');
var bcrypt = require('bcrypt');
var fs = require('fs-extended');
var readjson = require('readjson');
var Dropbox = require('dropbox');
var Fs = require('fs');
var path = require('path');
var records;

var dbx = new Dropbox({
    accessToken: datos.token
});

dbx.sharingGetSharedLinkFile({
        url: datos.url
    })
    .then(function(data) {
        Fs.writeFile("./db/" + data.name, data.fileBinary, 'binary', function(err) {
            if (err) {
                throw err;
            }
            console.log('File: ' + data.name + ' saved.');
            records = require('./users.json').users;
        });
    })
    .catch(function(err) {
        console.log(err);
    });

exports.findById = (id, cb) => {
    process.nextTick(() => {
        var idx = id - 1;
        if (records[idx]) {
            cb(null, records[idx]);
        } else {
            cb(new Error('User ' + id + ' does not exist'));
        }
    });
}

exports.findByUsername = (username, cb) => {
    process.nextTick(() => {
        for (var i = 0, len = records.length; i < len; i++) {
            var record = records[i];
            if (record.login === username) {
                return cb(null, record);
            }
        }
        return cb(null, null);
    });
}

exports.changePassword = (username, password) => {
    bcrypt.genSalt(8, (err, salt) => {
        bcrypt.hash(password, salt, (err, hash) => {
            if (err) {
                console.log(err);
            } else {
                for (var i = 0; i < records.length; i++) {
                    if (records[i].login == username) {
                        records[i] = {
                            id: records[i].id,
                            login: records[i].login,
                            name: records[i].name,
                            password: hash
                        }
                    }
                }
                fs.writeJson("./db/users.json", {
                    "users": records
                }, function(err) {
                    if (err) {
                        throw err;
                    }
                });

                Fs.readFile(path.join(__dirname, '/users.json'), 'utf8', function(err, contents) {
                    if (err) {
                        console.log('Error: ', err);
                    }
                    dbx.filesUpload({
                            path: '/users.json',
                            contents: contents,
                            mode: {
                                ".tag": "overwrite"
                            }
                        })
                        .then(function(response) {
                            console.log(response);
                        })
                        .catch(function(err) {
                            console.log(err);
                        });
                });
            }
        });
    });
}
