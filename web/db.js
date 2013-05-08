module.exports = (function () {

  var mongoose = require('mongoose');

  var Schemata = {}
  var Models = {}

  Schemata.Device = new mongoose.Schema({
    gcmId: {
      type: String,
      required: true,
      unique: true
    },
    messages: [ { type: mongoose.Schema.Types.ObjectId, ref: 'messages' } ],
    dateAdded: {
      type: Date,
      default: Date.now
    },
    lastPinged: {
      type: Date
    }
  });

  Schemata.Device.statics.random = function (callback) {
    this.count(function(err, count) {
      if (err) {
        return callback(err);
      }
      var rand = Math.floor(Math.random() * count);
      this.findOne().skip(rand).exec(callback);
    }.bind(this));
  };

  Schemata.Message = new mongoose.Schema({
    title: {
      type: String,
      required: true
    },
    body: {
      type: String,
      required: true
    },
    dateCreated: {
      type: Date,
      default: Date.now,
      required: true
    }
  })

  Models.Device = mongoose.model('Device', Schemata.Device, 'devices');
  Models.Message = mongoose.model('Message', Schemata.Message, 'messages');

  function init(config) {
    mongoose.connect(config);
  }

  return {
    Schemata: Schemata,
    Models: Models,
    init: init
  };

}());