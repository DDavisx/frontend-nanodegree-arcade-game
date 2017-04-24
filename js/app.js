
/ Enemies our player must avoid
var Enemy = function( x, y, speed) {
    this.initX = x;
    this.x = this.initX;
    switch (y) {
      case 1:
        this.y = 60;
        break;
      case 2:
        this.y = 144;
        break;
      case 3:
        this.y = 230;
        break;
    }
    this.speed = speed;
    this.sprite = 'images/enemy-bug.png';
    this.collisionRect = {x:this.x, y:this.y, width: 73, height:64};
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    if ( this.x >= 600) {
      this.x =  this.initX;
    }

    this.x += this.speed * dt;
    this.y = this.y;

    this.collisionRect.y = this.y + 78;
    this.collisionRect.x = this.x + 12;
   // this.collisionCheck( this.collisionRect , player.collisionRect );
};

Enemy.prototype.drawCollisionRect = function (rect , color) {
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.width, rect.height);
  ctx.lineWidth = 1;
  ctx.strokeStyle = color;
  ctx.stroke();
};

Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    //this.drawCollisionRect(this.collisionRect, "green");
};

// Detect when an enemy has collided with Player.
// Algorithm taken from the Mozilla 2D collision detection example.
// https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
Enemy.prototype.collisionCheck = function( rect1 , rect2 ) {
  if (rect1.x < rect2.x + rect2.width &&
   rect1.x + rect1.width > rect2.x &&
   rect1.y < rect2.y + rect2.height &&
   rect1.height + rect1.y > rect2.y) {
     return true;
   }
};


var EnemyBug = function( row ) {
   var initX = -200;
   var initY = row;
   var speed = Math.random() * (240 - 80) + 80;
   Enemy.call(this,initX,initY,speed);
};

EnemyBug.prototype = Object.create(Enemy.prototype);
EnemyBug.constructor = EnemyBug;

var ReverseEnemyBug = function( row ) {
   var initX = -200;
   var initY =  row;
   var speed =  Math.random() * (340 - 160) + 160;
   this.flippedsprite = 'images/enemy-bug-reverse.png';
   Enemy.call(this,initX,initY,speed);
};
ReverseEnemyBug.prototype = Object.create(Enemy.prototype);
ReverseEnemyBug.constructor = ReverseEnemyBug;
ReverseEnemyBug.prototype.update = function(dt) {

   if ( this.reverse) {
      if ( this.x <= -200) {
        this.initX = -200;
        this.x = this.initX;
        this.reverse = false;
      }
      this.x -= this.speed * dt;
      this.y = this.y;
    } else {

    if ( this.x >= 600) {
        this.reverse = true;
        this.initX = 600;
        this.x =  this.initX;
        this.reverse = true;
    }
      this.x += this.speed * dt;
      this.y = this.y;
  }
  this.collisionRect.y = this.y + 78;
  this.collisionRect.x = this.x + 12;
};

ReverseEnemyBug.prototype.render = function() {
  if ( this.reverse ) {
    ctx.drawImage(Resources.get(this.flippedsprite), this.x, this.y);
  } else {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
  }
    //this.drawCollisionRect(this.collisionRect, "green");
};


// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function() {
  this.x = 200;
  this.y = 380;
  this.disabled = false;
  this.sprite = 'images/char-boy.png';

  //initialize the collision Detection Rectangle
  this.collisionRect = {x: this.x + 22, y: this.y + 90, width: 58, height:50};
};

Player.prototype.update = function(dt) {
  this.x = this.x;
  this.y = this.y;

  this.collisionRect.x = this.x + 22;
  this.collisionRect.y = this.y + 90;
};

Player.prototype.drawCollisionRect = function ( rect, color ) {
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.width, rect.height);
    ctx.lineWidth = 1;
    ctx.strokeStyle = color;
    ctx.stroke();
};

Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    //this.drawCollisionRect(this.collisionRect, "yellow");
};

Player.prototype.handleInput = function( key ) {
    if ( this.disabled ) {
      return;
    }
    var ydistance = 83;
    var xdistance = 101;
    prevx = this.x;
    prevy = this.y;
    switch (key) {
      case 'up':
          this.y += -ydistance;
          break;
      case 'down':
          this.y += ydistance;
          break;
      case 'left':
          this.x += -xdistance;
          break;
      case 'right':
          this.x +=  xdistance;
    }
    //check that player is within the canvas bounds
    if ( this.x > 402 || this.y > 380 || this.x < -2 || this.y < -35) {
      this.x = prevx;
      this.y = prevy;
    }
};


// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player

var allEnemies = [ new ReverseEnemyBug(1), new EnemyBug(2), new EnemyBug(3) ];
var player = new Player();

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
