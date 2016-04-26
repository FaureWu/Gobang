(function(scope, document) {
  var _private = {
    //棋子角色定义
    role: {
      none: 0,//无子
      kuroko: 1,//黑子
      albino: 2,//白子
    },

    //棋子私有数据对象
    chessman: {
      size: 0,//棋子大小
      data: [],//已落棋子数据
      next: 0,
    },

    //棋盘私有数据对象
    chessboard: {
      unitSize: 30,//棋盘单元大小
      width: 0,//棋盘的宽度
      height: 0,//棋盘的高度
      squareNum: 15,//棋盘的格子数
      margin: 50,//棋盘的边距
    },

    //舞台对象
    stage: {
      canvas: undefined,//画布对象
      context: undefined,//正文对象
    },

    timer: undefined,//计时器

    gameOver: false,

    gameStart: false,

    playCG: false,

    gobangO: null,
  };

  var _inspect = {
    isObject: function(o) {
      return typeof o === 'object' ? true : false;
    },

    isArray: function(o) {
      return o instanceof Array ? true : false;
    },

    isString: function(o) {
      return typeof o === 'string' ? true: false;
    }
  }

  var _parseConfig = function(config) {
    var conf = {};
    if(_inspect.isString(config)) {
      conf.id = config;
    } else if(_inspect.isObject(config)) {
      if(_inspect.isString(config.id)) {
        conf.id = config.id;
      } else {
        conf.id = '';
      }
    }

    return conf;
  };

  var _initPrivate = function() {
    var chessboard = _private.chessboard;
    var chessman = _private.chessman;
    _private.chessboard.width = chessboard.unitSize*
                                chessboard.squareNum+
                                chessboard.margin*2;
    _private.chessboard.height = chessboard.width;

    _private.chessman.size = chessboard.unitSize-parseInt(chessboard.unitSize*0.2);

    for (var x = 0; x <= chessboard.squareNum; x++) {
      if(!_inspect.isArray(_private.chessman.data[x])) _private.chessman.data[x] = [];
      for (var y = 0; y <= chessboard.squareNum; y++) {
        _private.chessman.data[x][y] = _private.role.none;
      }
    }

    _private.chessman.next = _private.role.kuroko;
    _private.gameOver = false;
  };

  var _initStage = function(id) {
    var canvas = document.getElementById(id);
    _private.stage.canvas = canvas;
    _private.stage.context = canvas.getContext('2d');
    var body = document.getElementsByTagName('body')[0];
    _private.stage.canvas.width = body.offsetWidth;
    _private.stage.canvas.height = body.offsetHeight;
  };

  var _clearCanvas = function() {
    var cxt = _private.stage.context,
        canvas = _private.stage.canvas;
    cxt.save();
    cxt.clearRect(0, 0, canvas.width, canvas.height);
    cxt.restore();
  };

  var _degreeToRadian = function(degree) {
    return degree*(Math.PI/180);
  };

  var _rate = 0;
  var _drawLogo = function() {
    var cxt = _private.stage.context,
        canvas = _private.stage.canvas;
    var radius = 100;

    var center = {
      x: parseInt(canvas.width/2),
      y: parseInt(canvas.height/2)
    }

    _rate += _degreeToRadian(2);
    cxt.save();
    cxt.translate(center.x, center.y);
    cxt.rotate(_rate);
    cxt.translate(-center.x, -center.y);
  
    //绘制大圆
    cxt.lineWidth = 1;
    cxt.fillStyle = '#fff';
    cxt.strokeStyle = 'rgba(0,0,0,1)';
    cxt.beginPath();      
    cxt.arc(center.x, center.y, radius, _degreeToRadian(0), _degreeToRadian(360));
    cxt.stroke();
    cxt.fill();

    //绘制黑半球
    cxt.fillStyle = 'rgba(0,0,0,0.5)';
    cxt.strokeStyle = 'rgba(0,0,0,0.5)';
    cxt.beginPath();
    cxt.arc(center.x, center.y, radius, _degreeToRadian(90), _degreeToRadian(270));
    cxt.closePath();
    cxt.fill();

    cxt.beginPath();
    cxt.arc(center.x, center.y-radius/2, radius/2, _degreeToRadian(90), _degreeToRadian(270), true);
    cxt.closePath();
    cxt.fill();

    cxt.fillStyle = '#fff';
    cxt.strokeStyle = '#fff';
    cxt.beginPath();
    cxt.arc(center.x, center.y+radius/2, radius/2, _degreeToRadian(90), _degreeToRadian(270));
    cxt.closePath();
    cxt.fill();        

    //绘制两个阴阳眼
    cxt.fillStyle = '#fff';
    cxt.beginPath();
    cxt.arc(center.x, center.y-radius/2, radius/8, _degreeToRadian(0), _degreeToRadian(360));
    cxt.fill();

    cxt.fillStyle = 'rgba(0,0,0,0.5)';
    cxt.beginPath();
    cxt.arc(center.x, center.y+radius/2, radius/8, _degreeToRadian(0), _degreeToRadian(360));
    cxt.fill();

    cxt.restore();
  };

  var _drawChessboard = function() {
    var cxt = _private.stage.context;
    var canvas = _private.stage.canvas;
    cxt.save();
    cxt.translate(canvas.width/2-_private.chessboard.width/2, canvas.height/2-_private.chessboard.height/2);
    for (var i = 0; i <= _private.chessboard.squareNum; i++) {
      cxt.beginPath();
      cxt.moveTo(
        _private.chessboard.margin, 
        _private.chessboard.margin+i*_private.chessboard.unitSize
      );
      cxt.lineTo(
        _private.chessboard.margin+_private.chessboard.unitSize*_private.chessboard.squareNum, 
        _private.chessboard.margin+i*_private.chessboard.unitSize
      );
      cxt.stroke();

      cxt.beginPath();
      cxt.moveTo(
        _private.chessboard.margin+i*_private.chessboard.unitSize, 
        _private.chessboard.margin
      );
      cxt.lineTo(
        _private.chessboard.margin+i*_private.chessboard.unitSize, 
        _private.chessboard.margin+_private.chessboard.unitSize*_private.chessboard.squareNum
      );
      cxt.stroke();
    }
    cxt.restore();
  };

  var _drawChessman = function(x, y, role) {
    var cxt = _private.stage.context;
    var canvas = _private.stage.canvas;
    var radius = parseInt(_private.chessman.size/2),
        offset = parseInt(radius*0.5);
    cxt.save();
    cxt.translate(canvas.width/2-_private.chessboard.width/2, canvas.height/2-_private.chessboard.height/2);
    var gradient = cxt.createRadialGradient(x, y, radius, x+offset, y-offset, parseInt(radius*0.01));
    if(role == _private.role.kuroko) {
      gradient.addColorStop(0.3, '#000');
      gradient.addColorStop(1, '#fff');       
    } else {
      gradient.addColorStop(0.3, '#d4d4d4');
      gradient.addColorStop(1, '#fff');         
    }

    cxt.fillStyle = gradient;
    cxt.beginPath();
    cxt.arc(x, y, parseInt(_private.chessman.size/2), _degreeToRadian(0), _degreeToRadian(360));
    cxt.fill();
    cxt.restore();
  }

  var _drawAlbino = function(x, y) {
    _drawChessman(x, y, _private.role.albino);
  };

  var _drawKuroko = function(x, y) {
    _drawChessman(x, y, _private.role.kuroko);
  };

  var _drawChessmans = function() {
    for (var x = 0; x <= _private.chessboard.squareNum; x++) {
      for (var y = 0; y <= _private.chessboard.squareNum; y++) {
        if(_private.chessman.data[x][y] == _private.role.kuroko) {
          _drawKuroko(
            _private.chessboard.margin+x*_private.chessboard.unitSize,
            _private.chessboard.margin+y*_private.chessboard.unitSize
          );
        } else if(_private.chessman.data[x][y] == _private.role.albino){
          _drawAlbino(
            _private.chessboard.margin+x*_private.chessboard.unitSize,
            _private.chessboard.margin+y*_private.chessboard.unitSize
          );
        }
      }
    }
  };

  var _checkAvail = function(x, y) {
    if(x >= 0 && y >= 0 && x <= _private.chessboard.squareNum && y <= _private.chessboard.squareNum)
      return true;
    return false;
  };

  var _getChessman = function(x, y) {
    if(_checkAvail(x, y)) 
      return _private.chessman.data[x][y];
  };

  var _checkGameOver = function(x, y, role) {
    var n = 0, i = x, j = y, man;
    var chessmans = _private.chessman.data;

    //水平方向
    man = _getChessman(i, j);
    while(man === role) {
      n++;
      i++;
      man = _getChessman(i, j);
    }

    i = x-1, j = y;
    man = _getChessman(i, j);
    while(man === role) {
      n++;
      i--;
      man = _getChessman(i, j);
    }      

    if(n >= 5) {
      _private.gameOver = true;
      return true;
    }

    //垂直方向
    n = 0, i = x, j = y;
    man = _getChessman(i, j);
    while(man ===  role) {
      n++;
      j++;
      man = _getChessman(i, j);
    }

    i = x, j = y-1;
    man = _getChessman(i, j);
    while(man === role) {
      n++;
      j--;
      man = _getChessman(i, j);
    }      

    if(n >= 5) {
      _private.gameOver = true;
      return true;
    }

    //45°对角线方向
    n = 0, i = x, j = y;
    man = _getChessman(i, j);
    while(man === role) {
      n++;
      i++;
      j--;
      man = _getChessman(i, j);
    }

    i = x-1, j = y+1;
    man = _getChessman(i, j);
    while(man === role) {
      n++;
      i--;
      j++;
      man = _getChessman(i, j);
    }      

    if(n >= 5) {
      _private.gameOver = true;
      return true;
    }

    //135°对角线方向
    n = 0, i = x, j = y;
    man = _getChessman(i, j);
    while(man === role) {
      n++;
      i++;
      j++;
      man = _getChessman(i, j);
    }

    i = x-1, j = y-1;
    man = _getChessman(i, j);
    while(man === role) {
      n++;
      i--;
      j--;
      man = _getChessman(i, j);
    }      

    if(n >= 5) {
      _private.gameOver = true;
      return true;
    }
  };

  var _refreshHandler = function(time) {
    _clearCanvas();
    _drawLogo();
    _drawChessboard();
    _drawChessmans();
    if(_private.gameOver) {
      _private.gobangO.stop();
    } else {
      scope.requestAnimationFrame(_refreshHandler, _private.stage.canvas);
    }
  };  

  var _isLazi = function(x, y) {
    if(!_checkAvail(x, y)) return false; 
    return _private.chessman.data[x][y];
  };

  var _addChessman = function(x, y) {
    if(_isLazi(x, y)) return;
    _private.chessman.data[x][y] = _private.chessman.next;
    _checkGameOver(x, y, _private.chessman.next);
    if(_private.chessman.next == _private.role.kuroko)
      _private.chessman.next = _private.role.albino;
    else 
      _private.chessman.next = _private.role.kuroko;    
  };

  var _clickHandler = function(event) {
    if(!event) event = scope.event;
    var x = event.offsetX-(_private.stage.canvas.width/2-_private.chessboard.width/2)-_private.chessboard.margin,
        y = event.offsetY-(_private.stage.canvas.height/2-_private.chessboard.height/2)-_private.chessboard.margin;
    if(x >= -_private.chessboard.unitSize/2 && x < 0) {
      x = 0;
    }
    if(y >= -_private.chessboard.unitSize/2 && y < 0) {
      y = 0;
    }    
    if(x < 0 || y < 0) return true;

    var remX = x%_private.chessboard.unitSize,
        remY = y%_private.chessboard.unitSize;      

    x = parseInt(x/_private.chessboard.unitSize);
    y = parseInt(y/_private.chessboard.unitSize);

    if(remX > _private.chessboard.unitSize/2) x++;
    if(remY > _private.chessboard.unitSize/2) y++;
    if(!_checkAvail(x, y)) return true;

    _addChessman(x, y);

    return true;    
  };

  var _laziListener = function() {
    var canvas = _private.stage.canvas;
    if(canvas.addEventListener) {
      canvas.addEventListener('click', _clickHandler);
    } else {
      canvas.attachEvent('onclick', _clickHandler);
    }
  };

  var _drawGameOver = function() {
    var cxt = _private.stage.context;
    var canvas = _private.stage.canvas;
    var text = 'GAME OVER';
    cxt.save();
    cxt.font = '40px arial';
    cxt.fillStyle = '#F17A00';
    cxt.shadowOffsetX = 3;
    cxt.shadowOffsetY = 3;
    cxt.shadowBlur = 1;
    cxt.shadowColor = "#D2BD1A";
    cxt.fillText(text, canvas.width/2-120, canvas.height/2);
    cxt.restore();
  };

  var isMousemove = false;
  var _mousemoveHandler = function(event) {
    var canvas = _private.stage.canvas;
    if(!event) event = scope.event;

    var x = event.offsetX,
        y = event.offsetY;

    var tx = Math.abs(x-canvas.width/2);
    var ty = Math.abs(y-canvas.height/2);
    var l = Math.sqrt(tx*tx+ty*ty);

    if(l <= 200) {
      this.style.cursor = 'pointer';
      isMousemove = true;
    }
    else {
      this.style.cursor = 'default';
      isMousemove = false;
    }  
  };

  var _mouseclickHandler = function(event) {
    if(isMousemove) {
      _private.gobangO.closeCG();
      isMousemove = false;
    }
  };

  var _drawLeft = function(mult) {
    var cxt = _private.stage.context;
    var canvas = _private.stage.canvas;

    cxt.beginPath();
    cxt.fillStyle = '#000';
    cxt.fillRect(0, 0, canvas.width/2*mult, canvas.height);

    cxt.beginPath();
    cxt.fillStyle = '#fff';
    cxt.arc(canvas.width/2*mult, canvas.height/2, 200, _degreeToRadian(90), _degreeToRadian(270));
    cxt.fill();        
  };

  var _drawRight = function(mult) {
    var cxt = _private.stage.context;
    var canvas = _private.stage.canvas;

    cxt.beginPath();
    cxt.fillStyle = '#e8e8e8';
    cxt.fillRect(canvas.width/2+canvas.width/2*(1-mult), 0, canvas.width, canvas.height); 

    cxt.beginPath();
    cxt.fillStyle = '#fff';
    cxt.arc(canvas.width/2+canvas.width/2*(1-mult), canvas.height/2, 200, _degreeToRadian(90), _degreeToRadian(270), true);
    cxt.fill();        
  };

  var _drawPlay = function(mult) {
    var cxt = _private.stage.context;
    var canvas = _private.stage.canvas;
        
    cxt.beginPath();
    var radius = 200*mult;
    var gradient = cxt.createRadialGradient(canvas.width/2, canvas.height/2, radius, canvas.width/2+80, canvas.height/2-80, 20);
    gradient.addColorStop(0, '#cecece');
    gradient.addColorStop(0.6, '#fafafa');
    gradient.addColorStop(1, '#fff');          
    cxt.fillStyle = gradient;
    cxt.arc(canvas.width/2, canvas.height/2, radius, _degreeToRadian(0), _degreeToRadian(360));
    cxt.fill();

    if(mult !== 1) return;

    cxt.save();
    var text = 'PLAY GAME';
    cxt.font = '40px arial';
    if(isMousemove) {
      cxt.fillStyle = 'blue';
    } else {
      cxt.fillStyle = '#000';
    }
    cxt.shadowOffsetX = 3;
    cxt.shadowOffsetY = 3;
    cxt.shadowBlur = 1;
    cxt.shadowColor = "#cecece";
    cxt.fillText(text, canvas.width/2-120, canvas.height/2);
    cxt.restore();
  };

  var _playCG = function() {
    _clearCanvas();
    var cxt = _private.stage.context;
    var canvas = _private.stage.canvas;

    _drawLeft(1);
    _drawRight(1);
    _drawPlay(1);

    if(_private.playCG) {
      scope.requestAnimationFrame(_playCG, _private.stage.canvas);
    }
  };
  var r = 1;
  var _rateP = 0;
  var _closeCG = function() {
    r -= 0.05;
    var canvas = _private.stage.canvas;
    var cxt = _private.stage.context;
    _clearCanvas();
    _drawLogo();
    _drawChessboard();
    if(r > -0.01 && r < 0.01) {
      _private.gobangO.start();
    } else {
      _drawLeft(r);
      _drawRight(r);
      cxt.save();
      _rateP += _degreeToRadian(2);
      cxt.translate(canvas.width/2, canvas.height/2);
      cxt.rotate(_rateP);
      cxt.translate(-canvas.width/2, -canvas.height/2);
      _drawPlay(r);
      cxt.restore();      
      scope.requestAnimationFrame(_closeCG, canvas);
    }   
  };

  scope.Gobang = function(config) {
    /*
    * 配置对象描述
    * id: 舞台的id
    */

    var conf = _parseConfig(config);

    //配置用户数据
    this.id = conf.id;

    _private.gobangO = this;

    //初始化舞台
    _initStage(this.id);    
  };

  /*
  * @decription 展示开场动画
  * @return undefined
  */
  Gobang.prototype.openCG = function() {
    if(_private.gameStart) this.stop();
    if(_private.playCG) return;
    this.init();
    var canvas = _private.stage.canvas;
    scope.requestAnimationFrame(_playCG, _private.stage.canvas);
    if(canvas.addEventListener) {
      canvas.addEventListener('mousemove', _mousemoveHandler);
      canvas.addEventListener('click', _mouseclickHandler);
    } else {
      canvas.attachEvent('onmousemove', _mousemoveHandler);
      canvas.attachEvent('onclick', _mouseclickHandler);
    }

    _private.playCG = true;
  };

  /*
  * @decription 关闭开场动画
  * @return undefined
  */ 
  Gobang.prototype.closeCG = function() {
    if(_private.playCG) {
      var canvas = _private.stage.canvas;
      if(canvas.removeEventListener) {
        canvas.removeEventListener('mousemove', _mousemoveHandler);
        canvas.removeEventListener('click', _mouseclickHandler);
      } else {
        canvas.detachEvent('onmousemove', _mousemoveHandler);
        canvas.detachEvent('onclick', _mouseclickHandler);
      }
      _private.playCG = false;

      scope.requestAnimationFrame(_closeCG, _private.stage.canvas);
    }
  };

  /*
  * @decription 初始化函数，解析参数配置，设置棋盘相关参数及初始化舞台元素
  * @param config{object} 配置对象
  * @return undefined
  */
  Gobang.prototype.init = function() {
    //配置棋盘及棋子参数
    _initPrivate();
  };

  /*
  * @decription 启动游戏
  * @return undefined
  */
  Gobang.prototype.start = function() {
    if(_private.playCG) this.closeCG();
    if(_private.gameStart) return;
    this.init();
    _laziListener();
    scope.requestAnimationFrame(_refreshHandler, _private.stage.canvas);
    _private.gameStart = true;
  };

  /*
  * @decription 结束游戏
  * @return undefined
  */
  Gobang.prototype.stop = function() {
    if(_private.gameStart) {
      var canvas = _private.stage.canvas;
      if(canvas.removeEventListener) {
        canvas.removeEventListener('click', _clickHandler);
      } else {
        canvas.detachEvent('onclick', _clickHandler);
      }
      _private.gameStart = false;
      _private.gameOver = false;
    }

    _drawGameOver();
  };

  /*
  * @decription 重新玩游戏
  * @return undefine
  */
  Gobang.prototype.replay = function() {
    this.stop();
    this.start();
  };
})(window || this, document);