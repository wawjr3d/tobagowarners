const { MongoClient, ObjectId } = require('mongodb');
const assert = require('assert');
const express = require('express');
const bodyParser = require('body-parser');
const profileFrom = require('./profiles/profileFrom');
const crypto = require('crypto');
const mime = require('mime');
const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './pics/')
  },
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(4, function (err, raw) {
      cb(null, raw.toString('hex') + Date.now() + '.' + mime.extension(file.mimetype));
    });
  }
});
const upload = multer({ storage: storage });

const DB_URL = 'mongodb://localhost:27017/tobagowarners';

const app = express()

  .set('view engine', 'pug')

  .use('/css', express.static(__dirname + '/css'))
  .use('/js', express.static(__dirname + '/js'))
  .use('/pics', express.static(__dirname + '/pics'))

  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))

  .get('/', function(req, res) {
    withProfiles(function(profiles, done) {
      profiles.find({}).toArray()
        .then(function(profiles) {
          res.render('home', { profiles });
        })
        .then(done);
    });
  })

  .get('/profile/:slug', function(req, res) {
    withProfiles(function(profiles, done) {
      profiles
        .findOne(bySlug(req.params.slug))
        .then(function(profile) {
          res.render('profile', { profile });
        })
        .then(done);
    });
  })

  .get('/edit-profile/:slug', function(req, res) {
    withProfiles(function(profiles, done) {
      profiles
        .findOne(bySlug(req.params.slug))
        .then(function(profile) {
          res.render('editProfile', { profile });
        })
        .then(done);
    });
  })

  .post('/edit-profile/:slug', upload.single('pic'), function(req, res) {
    withProfiles(function(profiles, done) {
      const profile = profileFrom(req.body, req.file);

      profiles
        .updateOne(bySlug(req.params.slug), profile)
        .then(function() {
          res.redirect(`/profile/${ profile.slug }`);
        })
        .then(done);
    });
  })

  .get('/create-profile', function(req, res) {
    res.render('createProfile');
  })

  .post('/create-profile', upload.single('pic'), function(req, res) {
    withProfiles(function(profiles, done) {
      const profile = profileFrom(req.body, req.file);

      profiles
        .insertOne(profile)
        .then(function() {
          res.redirect(`/profile/${ profile.slug }`);
        })
        .then(done);
    });
  })

  .get('/delete-profiles/all', function(req, res) {
    withProfiles(function(profiles, done) {
      profiles
        .remove({})
        .then(function(commandResult) {
          res.send(`Donezo, removed ${ commandResult.result.n }`);
        })
        .then(done);
    });
  });
;

function byId(id) {
  return { '_id': ObjectId.createFromHexString(id) };
}

function bySlug(slug) {
  return { slug };
}

function connect(doSomething) {
  MongoClient.connect(DB_URL, function(err, db) {
    assert.equal(null, err);

    console.log('Connected succesfully to server');

    doSomething(db, function() {
      db.close();
    });
  });
}

function withProfiles(doSomething) {
  connect(function(db, done) {
    const profiles = db.collection('profiles');

    doSomething(profiles, done);
  });
}

app.listen(8080);

console.log('Tobago Warners started on 8080');
