class Vec
{
  constructor(x = 0, y = 0)
  {
    this.x = x;
    this.y = y;
  }
  get len()
  {
      return Math.sqrt(this.x * this.x + this.y * this.y); // Calculates the hypotenuse of a triangle.
  }
  set len(value)
  {
      const fact = value / this.len; 
      this.x *= fact;
      this.y *= fact;
  }
}

class Rect 
{
  constructor(w, h)
  {
      this.pos = new Vec;
      this.size = new Vec(w, h);
  }  
  get left()
  {
      return this.pos.x - this.size.x / 2; 
  }
  get right()
  {
      return this.pos.x + this.size.x / 2; 
  }
  get top()
  {
      return this.pos.y - this.size.y / 2; 
  }
  get bottom()
  {
      return this.pos.y + this.size.y / 2; 
  }
}

class Ball extends Rect
{
    constructor()
    {
      // This determines how big the pong ball is.
      super(10, 10);
      this.vel = new Vec;
    }
}
// Adding a new player
class Player extends Rect 
{
  constructor()
  {
        super(20, 100);
        this.score = 0;
  }
}

class Pong
{
  constructor(canvas)
  {
    this._canvas = canvas;
    this._context = canvas.getContext('2d');

    this.ball = new Ball;

    //adding 2 new players into an array
    this.players = [
      new Player,
      new Player
    ]
     //adding player to the left
     this.players[0].pos.x = 40;
     //adding player to the right
     this.players[1].pos.x = this._canvas.width - 40;
     //adding both players to the middle 
     this.players.forEach(player => { 
       player.pos.y = this._canvas.height / 2
     });
 
 
        let lastTime;
        const callback = (millis) => {
          if (lastTime) {
            this.update((millis - lastTime) / 1000);
          }
          lastTime = millis;
          requestAnimationFrame(callback);
        };
        callback(); 

        this.CHAR_PIXEL = 10
        this.CHARS = [
          '111101101101111', //0
          '010010010010010', //1
          '111001111100111', //2
          '111001111001111', //3
          '101101111001001', //4
          '111100111001111', //5
          '111100111101111', //6
          '111001001001001', //7 
          '111101111101111', //8
          '111101111001111'  //9
        ].map(str => {
          const canvas = document.createElement('canvas');
          canvas.height = this.CHAR_PIXEL * 5;
          canvas.width = this.CHAR_PIXEL * 3;
          const context = canvas.getContext('2d');
          context.fillStyle = '#fff';
          str.split('').forEach((fill, i) => {
            if(fill === '1') {
              context.fillRect(
                (i % 3) * this.CHAR_PIXEL, 
                (i / 3 | 0) * this.CHAR_PIXEL, 
                this.CHAR_PIXEL,
                this.CHAR_PIXEL);
                // for every string in this.CHARS we created a new canvas
                // On each canvas we draw for everyone a white square
                // it should fill the canvas according to the matrix's numbers
            }
          });
          return canvas;
        });

        this.reset();
      }
      collide(player, ball) 
      {
          if (player.left < ball.right && player.right > ball.left &&
            player.top < ball.bottom && player.bottom > ball.top) {
            const len = ball.vel.len; 
            ball.vel.x = -ball.vel.x; 
            ball.vel.y += 300 * (Math.random() - .5);
            ball.vel.len = len * 1.05 // Increases the velocity (speed) of the ball by 5% everytime there's a collison with the paddle.
          }
      }
      draw()
      {
        this._context.fillStyle = '#000';
        this._context.fillRect(0, 0, 
          this._canvas.clientWidth, this._canvas.height);
    
        this.drawRect(this.ball);
        this.players.forEach(player => this.drawRect(player));
    
        this.drawScore();
    
      }
      drawRect(rect)
      {
        this._context.fillStyle = '#fff';
        this._context.fillRect(rect.left, rect.top, 
                               rect.size.x, rect.size.y);
      }
      drawScore() 
      {
          const align = this._canvas.width / 3; 
          const CHAR_W = this.CHAR_PIXEL * 4; 
          this.players.forEach((player, index) => {
              const chars = player.score.toString().split('');
              const offset = align * (index + 1) - (CHAR_W * chars.length / 2) + this.CHAR_PIXEL / 2;
              chars.forEach((char, pos) => {
                this._context.drawImage(this.CHARS[char | 0], offset + pos * CHAR_W, 20);                            
              })
          })
      }
      reset()
      {
          // This sets the ball so it's the middle of the screen after scoring
          this.ball.pos.x = this._canvas.width / 2;
          this.ball.pos.y = this._canvas.height / 2;
          // Ball horizontal and vertical velocity starts at 0 when reset.
          this.ball.vel.x = 0;
          this.ball.vel.y = 0;
      }
      start() // This gets the ball move after a mouse click
      {
          if (this.ball.vel.x === 0 && this.ball.vel.y === 0) {
              this.ball.vel.x = 300 * (Math.random() > .5 ? 1 : -1) // Ball moves in a random position after start
              this.ball.vel.y = 300 * (Math.random() * 2 -1); // balls moves in a random way after starting
              this.ball.vel.len = 300; // this applys constant speed to the ball
          }
      }
      update(dt) 
      {
          this.ball.pos.x += this.ball.vel.x * dt; 
          this.ball.pos.y += this.ball.vel.y * dt; 
          
          // Adding boundaries
          if (this.ball.left < 0 || this.ball.right > this._canvas.width) {
              const playerId = this.ball.vel.x < 0 | 0;
              this.players[playerId].score ++;
              this.reset();
          }
          if (this.ball.top < 0 || this.ball.bottom > this._canvas.height) {
              this.ball.vel.y = -this.ball.vel.y;
          }     
          // This makes the AI follow the position of the ball.
          this.players[1].pos.y = this.ball.pos.y;
          
          this.players.forEach(player => this.collide(player, this.ball));

          this.draw();
    }
}

const canvas = document.getElementById('pong');
const pong = new Pong(canvas);

canvas.addEventListener('mousemove', event => {
  const scale = event.offsetY / event.target.getBoundingClientRect().height;
  pong.players[0].pos.y = canvas.height * scale;
});

// On mouse-click this calls the start method which commences the game and 
// gets the ball moving. 
canvas.addEventListener('click', event => {
  pong.start();
});