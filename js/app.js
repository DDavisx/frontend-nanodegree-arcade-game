// Enemies our player must avoid
var Enemy = function(x, y, speed) {
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
  this.collisionRect = {
    x: this.x,
    y: this.y,
    width: 73,
    height: 64
  };
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
  if (this.x >= 600) {
    this.x = this.initX;
  }

  this.x += this.speed * dt;
  this.y = this.y;

  this.collisionRect.y = this.y + 78;
  this.collisionRect.x = this.x + 12;
};

//update the ememy position and draw in on the canvas
Enemy.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Detect when an enemy has collided with Player.
// Algorithm taken from the Mozilla 2D collision detection example.
// https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
Enemy.prototype.collisionCheck = function(rect1, rect2) {
  if (rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.height + rect1.y > rect2.y) {
    return true;
  }
};

/**
 * This creates a bug that continues across the screen and restarts
 * once it has reached the end of the screen.
 * @param {Number} row a valjue 1 - 3 that determines the y position of the bug;
 */
var EnemyBug = function(row) {
  var initX = -200;
  var initY = row;
  var speed = Math.random() * (240 - 80) + 80;
  Enemy.call(this, initX, initY, speed);
};

EnemyBug.prototype = Object.create(Enemy.prototype);
EnemyBug.constructor = EnemyBug;

/**
 *This creates a bug that travels across the screen and will turn
 * around and travel back
 * @param {Number} row a valjue 1 - 3 that determines the y position of the bug;
 */
var ReverseEnemyBug = function(row) {
  var initX = -200;
  var initY = row;
  var speed = Math.random() * (340 - 160) + 160;
  this.flippedsprite = 'images/enemy-bug-reverse.png';
  Enemy.call(this, initX, initY, speed);
};
ReverseEnemyBug.prototype = Object.create(Enemy.prototype);
ReverseEnemyBug.constructor = ReverseEnemyBug;

// this overides the enemy superclass update function.
ReverseEnemyBug.prototype.update = function(dt) {
  if (this.reverse) {
    if (this.x <= -200) {
      this.initX = -200;
      this.x = this.initX;
      this.reverse = false;
    }
    this.x -= this.speed * dt;
    this.y = this.y;
  } else {

    if (this.x >= 600) {
      this.reverse = true;
      this.initX = 600;
      this.x = this.initX;
      this.reverse = true;
    }
    this.x += this.speed * dt;
    this.y = this.y;
  }
  this.collisionRect.y = this.y + 78;
  this.collisionRect.x = this.x + 12;
};

// render the reverse bug using two different graphical assets
// this is more performant than manipulating sprites.
ReverseEnemyBug.prototype.render = function() {
  if (this.reverse) {
    ctx.drawImage(Resources.get(this.flippedsprite), this.x, this.y);
  } else {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
  }
};

// randomly select the sprite for the player.
function randomcharSprite() {
  var randomInt = Math.floor(Math.random() * 5) + 1;
  var sprite;
  switch (randomInt) {
    case 1:
      sprite = 'images/char-boy.png';
      break;
    case 2:
      sprite = 'images/char-cat-girl.png';
      break;
    case 3:
      sprite = 'images/char-horn-girl.png';
      break;
    case 4:
      sprite = 'images/char-pink-girl.png';
      break;
    case 5:
      sprite = 'images/char-princess-girl.png';
      break;
  }
  return sprite;
}

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function() {
  this.x = 200;
  this.y = 380;
  this.disabled = false;
  this.sprite = randomcharSprite(); //'images/char-boy.png';

  //initialize the collision Detection Rectangle
  this.collisionRect = {
    x: this.x + 22,
    y: this.y + 90,
    width: 58,
    height: 50
  };
};

//update the position of the player
//and the collision rectangle for the player.
Player.prototype.update = function(dt) {
  this.x = this.x;
  this.y = this.y;
  this.collisionRect.x = this.x + 22;
  this.collisionRect.y = this.y + 90;
};

Player.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Player.prototype.handleInput = function(key) {
  if (this.disabled) {
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
      this.x += xdistance;
  }
  //check that the player stays within the canvas bounds
  if (this.x > 402 || this.y > 380 || this.x < -2 || this.y < -35) {
    this.x = prevx;
    this.y = prevy;
  }
};

/**
  A modified function for rounded rectangles. the original can be found here:
  http://js-bits.blogspot.com/2010/07/canvas-rounded-corner-rectangles.html
 * Draws a rounded rectangle using the current state of the canvas.
 * @param {CanvasRenderingContext2D} ctx
 * @param {Number} x The top left x coordinate
 * @param {Number} y The top left y coordinate
 * @param {Number} width The width of the rectangle
 * @param {Number} height The height of the rectangle
 * @param {Number} radius The corner radius. Defaults to 5;
 * @param {Boolean} fill Whether to fill the rectangle. Defaults to false.
 * @param {Boolean} stroke Whether to stroke the rectangle. Defaults to true.
 * @param {string} fillcolor the color of the Rectangle.  Defaults to 'green'.
 * @param {string} textColor the color of the Rectangle.  Defaults to 'black'.
 * @param {string} displayText the text to be displayed.  Defaults to no text.
 */
var roundRect = function(ctx, x, y, width, height, radius, fill, stroke, fillcolor, textColor, displayText) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.radius = radius;
  this.fill = fill;
  this.stroke = stroke;
  this.fillcolor = fillcolor;
  this.textColor = textColor;
  this.displayText = displayText;

  if (typeof stroke == "undefined") {
    this.stroke = true;
  }
  if (typeof radius === "undefined") {
    this.radius = 5;
  }

  if (typeof fillcolor == "undefined") {
    this.fillcolor = "green";
  }
  if (typeof textColor === "undefined") {
    this.textColor = "black";
  }

  this.draw = function() {
    ctx.fillStyle = this.fillcolor;
    ctx.beginPath();
    ctx.moveTo(this.x + this.radius, this.y);
    ctx.lineTo(this.x + this.width - this.radius, this.y);
    ctx.quadraticCurveTo(this.x + this.width, this.y, this.x + this.width, this.y + this.radius);
    ctx.lineTo(this.x + this.width, this.y + this.height - this.radius);
    ctx.quadraticCurveTo(this.x + this.width, this.y + this.height, this.x + this.width - this.radius, this.y + this.height);
    ctx.lineTo(this.x + this.radius, this.y + this.height);
    ctx.quadraticCurveTo(this.x, this.y + this.height, this.x, this.y + this.height - this.radius);
    ctx.lineTo(this.x, this.y + this.radius);
    ctx.quadraticCurveTo(this.x, this.y, this.x + this.radius, this.y);
    ctx.closePath();
    if (this.stroke) {
      ctx.stroke();
    }
    if (this.fill) {
      ctx.fill();
    }

    // add text to rectangle
    if (displayText) {
      ctx.font = "24px Arial";
      ctx.fillStyle = this.textColor;
      ctx.fillText(displayText, this.x + (this.width / 2), this.y + (this.height / 2) + 8);
    }
  };
};

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var allEnemies = [new ReverseEnemyBug(1), new EnemyBug(2), new EnemyBug(3)];
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
