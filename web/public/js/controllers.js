'use strict';

function AppCtrl($scope, socket) {
}
AppCtrl.$inject = [];

function SendCtrl($scope, socket) {

  $scope.message = {};
  $scope.sendMessage = function (message) {
    if (! $scope.formValid()) {
      return;
    }
    $scope.sendSuccess = false;
    $scope.sendError = null;
    socket.emit('message', message, function (err) {
      $scope.sendError = err;
      if (! err) {
        $scope.sendSuccess = true;
      }
      console.log(err);
    });
    $scope.message = {};
  };

  $scope.formValid = function () {
    if (! $scope.message.title || ! $scope.message.body) {
      return false;
    }
    return $scope.message.title.length && $scope.message.body.length;
  }

}
SendCtrl.$inject = [ '$scope', 'socket' ];


function AboutCtrl() {
}
AboutCtrl.$inject = [];
