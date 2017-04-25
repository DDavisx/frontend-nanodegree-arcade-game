/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine is available globally via the Engine variable and it also makes
 * the canvas' context (ctx) object globally available to make writing app.js
 * a little simpler to work with.
 */
var Engine = (function(global) {
  /* Predefine the variables we'll be using within this scope,
   * create the canvas element, grab the 2D context for that canvas
   * set the canvas elements height/width and add it to the DOM.
   */
  var doc = global.document,
    win = global.window,
    canvas = doc.createElement('canvas'),
    ctx = canvas.getContext('2d'),
    gameIsOver,
    lastTime;

  canvas.width = 505;
  canvas.height = 606;
  doc.body.appendChild(canvas);

  /* This function serves as the kickoff point for the game loop itself
   * and handles properly calling the update and render methods.
   */
  function main() {
    /* Get our time delta information which is required if your game
     * requires smooth animation. Because everyone's computer processes
     * instructions at different speeds we need a constant value that
     * would be the same for everyone (regardless of how fast their
     * computer is) - hurray time!
     */
    var now = Date.now(),
      dt = (now - lastTime) / 1000.0;

    /* Call our update/render functions, pass along the time delta to
     * our update function since it may be used for smooth animation.
     */
    update(dt);
    render();

    /* Set our lastTime variable which is used to determine the time delta
     * for the next time this function is called.
     */
    lastTime = now;

    /* Use the browser's requestAnimationFrame function to call this
     * function again as soon as the browser is able to draw another frame.
     */
    win.requestAnimationFrame(main);
  }

  /* This function does some initial setup that should only occur once,
   * particularly setting the lastTime variable that is required for the
   * game loop.
   */
  function init() {
    reset();
    lastTime = Date.now();
    gameIsOver = false;
    main();
  }

  /* This function is called by main (our game loop) and itself calls all
   * of the functions which may need to update entity's data. Based on how
   * you implement your collision detection (when two entities occupy the
   * same space, for instance when your character should die), you may find
   * the need to add an additional function call here. For now, we've left
   * it commented out - you may or may not want to implement this
   * functionality this way (you could just implement collision detection
   * on the entities themselves within your app.js file).
   */
  function update(dt) {
    if (gameIsOver === false) {
      updateEntities(dt);
    }
  }

  /* This is called by the update function and loops through all of the
   * objects within your allEnemies array as defined in app.js and calls
   * their update() methods. It will then call the update function for your
   * player object. These update methods should focus purely on updating
   * the data/properties related to the object. Do your drawing in your
   * render methods.
   */
  function updateEntities(dt) {
    allEnemies.forEach(function(enemy) {
      enemy.update(dt);
      // here we check for collisions with the player. if a collision has
      // occurred then we reset the game.
      if (enemy.collisionCheck(enemy.collisionRect, player.collisionRect)) {
        reset();
      }
    });
    player.update();
    // if player reaches the water the game is over.
    if (player.y <= -35) {
      gameOver();
    }
  }

  /* This function initially draws the "game level", it will then call
   * the renderEntities function. Remember, this function is called every
   * game tick (or loop of the game engine) because that's how games work -
   * they are flipbooks creating the illusion of animation but in reality
   * they are just drawing the entire screen over and over.
   */
  function render() {
    /* This array holds the relative URL to the image used
     * for that particular row of the game level.
     */

    var rowImages = [
        'images/water-block.png', // Top row is water
        'images/water-block.png', // Top row is water
        'images/stone-block.png', // Row 1 of 3 of stone
        'images/stone-block.png', // Row 2 of 3 of stone
        'images/stone-block.png', // Row 3 of 3 of stone
        'images/grass-block.png', // Row 1 of 2 of grass
        'images/grass-block.png' // Row 2 of 2 of grass
      ],
      numRows = 7,
      numCols = 5,
      row, col;

    /* Loop through the number of rows and columns we've defined above
     * and, using the rowImages array, draw the correct image for that
     * portion of the "grid"
     */
    for (row = 0; row < numRows; row++) {
      for (col = 0; col < numCols; col++) {
        /* The drawImage function of the canvas' context element
         * requires 3 parameters: the image to draw, the x coordinate
         * to start drawing and the y coordinate to start drawing.
         * We're using our Resources helpers to refer to our images
         * so that we get the benefits of caching these images, since
         * we're using them over and over.
         */
        ctx.drawImage(Resources.get(rowImages[row]), (col * 101), (row * 83) - 83);
      }
    }

    renderEntities();

    // If the game is Over render the Game Over Screen.
    if (gameIsOver) {
      renderGameOverScreen();
      player.render();
      return;
    }
  }

  /* This function is called by the render function and is called on each game
   * tick. Its purpose is to then call the render functions you have defined
   * on your enemy and player entities within app.js
   */
  function renderEntities() {
    /* Loop through all of the objects within the allEnemies array and call
     * the render function you have defined.
     */
    allEnemies.forEach(function(enemy) {
      enemy.render();
    });

    player.render();
  }

  /* This will reset the player and enemies to the initial state
   *  if the game has ended it will remove and destroy event listeners,
   *  references to the game over screen, and set alpha and player values.
   */
  function reset() {
    player.x = 200;
    player.y = 380;
    player.sprite = randomcharSprite();
    allEnemies.length = 0;
    allEnemies.push(new ReverseEnemyBug(1), new EnemyBug(2), new EnemyBug(3));
    if (gameIsOver) {
      canvas.removeEventListener('click', replayHandler);
      gameOverBGInstance = null;
      GameOverMSGInstance = null;
      GameOverReplayBtn = null;
      ctx.globalAlpha = 1;
      player.disabled = false;
      gameIsOver = false;
    }
  }

  /**
    Draws two Lines of Text on to the canvas to congratulate the Player.
   * @param {string} font  the font size and Family. Defaults to "52px Comic Sans MS"
   * @param {string} color the color of the Text. Defaults to 'black'.
   **/
  var gameOverMessage = function(font, color) {
    this.font = font;
    this.color = color;
    if (typeof this.font == "undefined") {
      this.font = "52px Comic Sans MS";
    }
    if (typeof this.color === "undefined") {
      this.color = "black";
    }
    this.draw = function() {
      ctx.font = this.font;
      ctx.fillStyle = this.color;
      ctx.textAlign = "center";
      ctx.fillText("Congratulations!", canvas.width / 2, 200);
      ctx.fillText("You Won!", canvas.width / 2, 280);
    };
  };

  /**
    Draws a rectangle over top of the canvas.
   * @param {string} color the color of the background. Defaults to 'white'.
   **/
  var gameoverBackground = function(color) {
    if (typeof color === "undefined") {
      this.color = "white";
    }
    this.draw = function() {
      ctx.fillStyle = this.color;
      ctx.globalAlpha = 0.8;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };
  };

  /**
   *  This functon calls the Draw function on each part
   *  of the Game Over screen.
   **/
  var renderGameOverScreen = function() {
    gameOverBGInstance.draw();
    GameOverMSGInstance.draw();
    GameOverReplayBtn.draw();
  };

  // determine the Coordinates of the mouse relative to canvas
  // this seems to be the best way to determine XY coordinates cross-browser.
  function mouseXY(e) {
    var rect = canvas.getBoundingClientRect();
    return {
      clientX: (e.clientX - rect.left),
      clientY: (e.clientY - rect.top)
    };
  }

  // a click handler that is attached to canvas on Gameover.
  var replayHandler = function(event) {
    var evt = mouseXY(event);
    console.log('mouseclik im Edgey x:' + evt.clientX + " >= " + GameOverReplayBtn.x);
    if (evt.clientX >= GameOverReplayBtn.x && evt.clientX <= GameOverReplayBtn.x + GameOverReplayBtn.width && evt.clientY >= GameOverReplayBtn.y && evt.clientY <= GameOverReplayBtn.y + GameOverReplayBtn.height) {
      reset();
    }
  };

  /* the player has achieved the Goal and the game has ended
   * Set the GameOver flag,  disable the player and create the
   * Game over screen elements before Rendering.
   */
  function gameOver() {
    gameIsOver = true;
    player.disabled = true;
    gameOverBGInstance = new gameoverBackground();
    GameOverMSGInstance = new gameOverMessage();
    GameOverReplayBtn = new roundRect(ctx, (canvas.width / 2) - ((canvas.width / 3) / 2), 350, canvas.width / 3, 50, 20, true, false, 'green', 'black', "play again!");
    canvas.addEventListener('click', replayHandler);
    renderGameOverScreen();
  }

  /* Go ahead and load all of the images we know we're going to need to
   * draw our game level. Then set init as the callback method, so that when
   * all of these images are properly loaded our game will start.
   */
  Resources.load([
    'images/stone-block.png',
    'images/water-block.png',
    'images/grass-block.png',
    'images/enemy-bug.png',
    'images/enemy-bug-reverse.png',
    'images/char-boy.png',
    'images/char-cat-girl.png',
    'images/char-horn-girl.png',
    'images/char-pink-girl.png',
    'images/char-princess-girl.png'
  ]);
  Resources.onReady(init);

  /* Assign the canvas' context object to the global variable (the window
   * object when run in a browser) so that developers can use it more easily
   * from within their app.js files.
   */
  global.ctx = ctx;
})(this);
