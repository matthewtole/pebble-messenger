var express = require('express');
var stylus = require('stylus');
var path = require('path');
var nib = require('nib');
var gcm = require('node-gcm');
var _ = require('underscore');

var app = module.exports = express();
var server = require('http').createServer(app);

var DB = require('./db');
DB.init(process.env.DB_STRING || 'mongodb://localhost/pebble-messenger');

var io = require('socket.io').listen(server);

var gcmSender = new gcm.Sender(/**/);
var gcm_registrations = []

app.configure(function () {

  app.set('port', process.env.PORT || 7000);
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());

  app.use(stylus.middleware({
    src: path.join(__dirname, 'public'),
    compile: function (str, path) {
      return stylus(str).set('filename', path).set('compress', true).use(nib());
    }
  }));

  app.use(express.static(__dirname + '/public'));

  app.use(app.router);

});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

app.get('/partials/:name', function (req, res) {
  res.render('partials/' + req.params.name);
});

app.post('/gcm/register', function (req, res) {
  addDevice(req.body.regId, function (err) {
    res.json(true);
  });
})

app.post('/gcm/ping', function (req, res) {
  DB.Models.Device.findOne({ gcmId: req.body.regId }).exec(function (err, device) {
    if (err) {
      return;
    }
    if (device) {
      device.lastPinged = new Date();
      device.save(function (err) {
        res.json(true);
      })
      return;
    }
    addDevice(req.body.regId, function (err) {
      res.json(true);
    });
  });
});

function addDevice(id, callback) {
  var device = new DB.Models.Device({
    gcmId: id
  });
  device.save(callback);
}

function createThenSendMessage(msg, callback) {
  var message = new DB.Models.Message(msg);
  message.save(function (err, dbMessage) {
    if (err) {
      return callback(err);
    }

    DB.Models.Device.random(function (err, device) {
      if (err) {
        return callback(err);
      }
      if (! device) {
        return callback('No available devices!');
      }
      device.messages.push(message._id);
      device.save(function (err) {
        if (err) {
          return callback(err);
        }
        var gcmMessage = new gcm.Message({
          collapseKey: 'demo',
          delayWhileIdle: true,
          timeToLive: 3,
          data: {
            title: dbMessage.title,
            body: dbMessage.body
          }
        });
        gcmSender.send(gcmMessage, [ device.gcmId ], 4, callback);
      });
    });
  });
}

app.get('*', function (req, res){
  res.render('index', {});
});

io.sockets.on('connection', function (socket) {

  socket.on('message', function (message, callback) {
    createThenSendMessage(message, callback);
  });

});

server.listen(app.get('port'), function(){
  console.log('Express server listening on port %d in %s mode', this.address().port, app.settings.env);
});
