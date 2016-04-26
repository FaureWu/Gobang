(function(scope, document) {
  scope.ready = function(fn) {
    if(document.addEventListener) {
      document.addEventListener('DOMContentLoaded', function() {
        document.removeEventListener("DOMContentLoaded", arguments.callee, false);
        fn();
      }, false);
    } else if(document.attachEvent) {
      document.attachEvent('onreadystatechange', function() {
        if(document.readyState === 'complete') {
          document.detachEvent('onreadystatechange', arguments.callee);
          fn();
        }
      });
    }
  };    

  var vendors = ['webkit', 'moz'];
  for (var i = 0; i < vendors.length && !scope.requestAnimationFrame; i++) {
    scope.requestAnimationFrame = scope[vendors[i]+'RequestAnimationFrame'];
    scope.cancelAnimationFrame = scope[vendors[i]+'CancelAnimationFrame'] ||
                                  scope[vendors[i]+'CancelRequestAnimationFrame'];
  }

  var lastTime = 0;
  if(!scope.requestAnimationFrame) {
    scope.requestAnimationFrame = function(callback, element) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16-(currTime-lastTime));
      var timer = scope.setTimeout(function() {
        callback(currTime+timeToCall);
      }, timeToCall);
      lastTime = currTime + timeToCall;
      return timer;
    }
  }

  if(!scope.cancelAnimationFrame) {
    scope.cancelAnimationFrame = function(timer) {
      clearTimeout(timer);
    };
  }
})(window || this, document);