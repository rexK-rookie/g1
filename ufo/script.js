// 等待 DOM 加載完成
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded');

  // 初始化 DOM 元素
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const startButton = document.getElementById('startButton');
  const exitButton = document.getElementById('exitButton');
  const scoreDisplay = document.getElementById('score');
  const levelDisplay = document.getElementById('level');
  const upButton = document.getElementById('upButton');
  const downButton = document.getElementById('downButton');
  const leftButton = document.getElementById('leftButton');
  const rightButton = document.getElementById('rightButton');

  // 檢查必要元素
  if (!canvas || !ctx || !startButton || !exitButton || !scoreDisplay || !levelDisplay ||
      !upButton || !downButton || !leftButton || !rightButton) {
    console.error('Missing critical DOM elements:', { canvas, ctx, startButton, exitButton, scoreDisplay, levelDisplay });
    return;
  }

  // 遊戲狀態 (先定義 Game)
  const Game = {
    active: false,
    score: 0,
    level: 1,
    gravity: 0.1,
    friction: 0.99,
    bullets: [],
    targets: [],
    stars: [],
    explosion: null,
    lastShotTime: 0,
    shotInterval: 500,
    scale: 1,
  };

  // 動態調整畫布大小
  function resizeCanvas() {
    const maxWidth = window.innerWidth * 0.9;
    const maxHeight = window.innerHeight * 0.7;
    const aspectRatio = 4 / 3;
    canvas.width = Math.min(maxWidth, maxHeight * aspectRatio);
    canvas.height = canvas.width / aspectRatio;
    Game.scale = canvas.width / 800;
    console.log('Canvas resized to:', canvas.width, 'x', canvas.height);
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // Vector 類
  class Vector {
    constructor(x, y) { this.x = x; this.y = y; }
    add(v) { return new Vector(this.x + v.x, this.y + v.y); }
    multiply(scalar) { return new Vector(this.x * scalar, this.y * scalar); }
    rotate(angle) {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      return new Vector(this.x * cos - this.y * sin, this.x * sin + this.y * cos);
    }
  }

  // Bullet 類
  class Bullet {
    constructor(position, velocity) { this.position = position; this.velocity = velocity; }
    update() {
      this.velocity.y += Game.gravity * Game.scale;
      this.velocity = this.velocity.multiply(Game.friction);
      this.position = this.position.add(this.velocity);
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.position.x, this.position.y, 5 * Game.scale, 0, Math.PI * 2);
      ctx.fillStyle = 'red';
      ctx.fill();
      ctx.closePath();
    }
    checkCollision(target) {
      const dx = this.position.x - target.x;
      const dy = this.position.y - target.y;
      return Math.sqrt(dx * dx + dy * dy) < 20 * Game.scale;
    }
    checkBoundary() {
      return (
        this.position.x < 0 || this.position.x > canvas.width ||
        this.position.y < 0 || this.position.y > canvas.height
      );
    }
    reflect() {
      if (this.position.x <= 0 || this.position.x >= canvas.width) this.velocity.x *= -1;
      if (this.position.y <= 0 || this.position.y >= canvas.height) this.velocity.y *= -1;
      this.position.x = Math.max(0, Math.min(canvas.width, this.position.x));
      this.position.y = Math.max(0, Math.min(canvas.height, this.position.y));
    }
  }

  // Explosion 類
  class Explosion {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.radius = 10 * Game.scale;
      this.maxRadius = 40 * Game.scale;
      this.duration = 1000;
      this.startTime = Date.now();
      this.color = `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, 0.5)`;
    }
    update() {
      const elapsed = Date.now() - this.startTime;
      this.radius = this.maxRadius * (elapsed / this.duration);
      return elapsed < this.duration;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.closePath();
    }
  }

  // 星星
  function createStars() {
    Game.stars = Array.from({ length: 100 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 * Game.scale,
      opacity: Math.random(),
    }));
  }

  function drawStars() {
    Game.stars.forEach(star => {
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
      ctx.fill();
      ctx.closePath();
    });
  }

  // 修改後的發射器（炮台），尺寸縮小 50%
  function drawLauncher() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const bodySize = 20 * Game.scale; // 原 40，縮小 50%
    const armLength = 15 * Game.scale; // 原 30，縮小 50%
    const armWidth = 10 * Game.scale; // 原 20，縮小 50%

    ctx.save();
    ctx.translate(centerX, centerY);

    // 繪製中心主體（方形）
    ctx.beginPath();
    ctx.rect(-bodySize / 2, -bodySize / 2, bodySize, bodySize);
    ctx.fillStyle = '#A9A9A9'; // 深灰色，模擬金屬質感
    ctx.fill();
    ctx.strokeStyle = '#D3D3D3'; // 淺灰色邊框
    ctx.lineWidth = 1 * Game.scale; // 原 2，縮小 50%
    ctx.stroke();
    ctx.closePath();

    // 繪製四個手臂（上下左右）
    const positions = [
      { x: 0, y: -bodySize / 2 - armLength, width: armWidth, height: armLength }, // 上
      { x: 0, y: bodySize / 2, width: armWidth, height: armLength }, // 下
      { x: -bodySize / 2 - armLength, y: 0, width: armLength, height: armWidth }, // 左
      { x: bodySize / 2, y: 0, width: armLength, height: armWidth }, // 右
    ];

    positions.forEach(pos => {
      ctx.beginPath();
      ctx.rect(pos.x, pos.y, pos.width, pos.height);
      ctx.fillStyle = '#C0C0C0'; // 銀色手臂
      ctx.fill();
      ctx.strokeStyle = '#D3D3D3';
      ctx.stroke();
      ctx.closePath();
    });

    ctx.restore();
  }

  // UFO 目標
  function createTarget() {
    return {
      x: Math.random() * (canvas.width - 40 * Game.scale) + 20 * Game.scale,
      y: Math.random() * (canvas.height - 40 * Game.scale) + 20 * Game.scale,
      vx: 2 * (Game.level / 2 + 1) * Game.scale,
      vy: 2 * (Game.level / 2 + 1) * Game.scale,
    };
  }

  function drawUFO(target) {
    ctx.save();
    ctx.translate(target.x, target.y);
    ctx.beginPath();
    ctx.ellipse(0, 0, 30 * Game.scale, 15 * Game.scale, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'gold';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, -10 * Game.scale, 10 * Game.scale, 0, Math.PI * 2);
    ctx.fillStyle = 'gold';
    ctx.fill();
    ctx.restore();
  }

  // 修改後的射擊功能（從炮口射出，尺寸縮小 50%）
  function shootBullet(direction) {
    if (!Game.active || Date.now() - Game.lastShotTime < Game.shotInterval) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const bodySize = 10 * Game.scale; // 原 40，縮小 50%
    const armLength = 5 * Game.scale; // 原 30，縮小 50%
    const speed = 10 * Game.scale;
    const directionMap = { up: -Math.PI / 2, down: Math.PI / 2, left: Math.PI, right: 0 };
    const angle = directionMap[direction] || 0;

    // 計算砲口位置
    let startX = centerX;
    let startY = centerY;
    switch (direction) {
      case 'up':
        startY -= (bodySize / 2 + armLength); // 上方砲口
        break;
      case 'down':
        startY += (bodySize / 2 + armLength); // 下方砲口
        break;
      case 'left':
        startX -= (bodySize / 2 + armLength); // 左方砲口
        break;
      case 'right':
        startX += (bodySize / 2 + armLength); // 右方砲口
        break;
    }

    const velocity = new Vector(speed, 0).rotate(angle);
    Game.bullets.push(new Bullet(new Vector(startX, startY), velocity));
    Game.lastShotTime = Date.now();
    console.log('Bullet shot in direction:', direction, 'from position:', startX, startY);
  }

  // 遊戲開始
  function startGame() {
    console.log('startGame called');
    Game.active = true;
    Game.score = 0;
    Game.level = 1;
    scoreDisplay.textContent = Game.score;
    levelDisplay.textContent = Game.level;
    Game.bullets = [];
    Game.targets = [createTarget()];
    Game.explosion = null;
    Game.lastShotTime = 0;
    Game.scale = canvas.width / 800;
    createStars();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    console.log('Game started, initial state:', { targets: Game.targets.length, stars: Game.stars.length });
    gameLoop();
  }

  // 遊戲結束
  function exitGame() {
    console.log('exitGame called');
    Game.active = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // 遊戲循環
  function gameLoop() {
    if (!Game.active) {
      console.log('Game loop stopped');
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawStars();
    drawLauncher();

    Game.targets.forEach(target => {
      drawUFO(target);
      target.x += target.vx;
      target.y += target.vy;
      if (target.x < 20 * Game.scale || target.x > canvas.width - 20 * Game.scale) target.vx *= -1;
      if (target.y < 20 * Game.scale || target.y > canvas.height - 20 * Game.scale) target.vy *= -1;
    });

    if (Game.explosion) {
      if (Game.explosion.update()) Game.explosion.draw();
      else {
        Game.explosion = null;
        Game.targets = [createTarget(), createTarget()];
        console.log('Explosion ended, new targets created');
      }
    }

    Game.bullets = Game.bullets.filter(bullet => {
      bullet.update();
      bullet.draw();
      const hitTargetIndex = Game.targets.findIndex(t => bullet.checkCollision(t));
      if (hitTargetIndex !== -1) {
        Game.score += 10;
        Game.level++;
        scoreDisplay.textContent = Game.score;
        levelDisplay.textContent = Game.level;
        Game.explosion = new Explosion(Game.targets[hitTargetIndex].x, Game.targets[hitTargetIndex].y);
        Game.targets.splice(hitTargetIndex, 1);
        console.log('Target hit! Score:', Game.score, 'Level:', Game.level);
        return false;
      }
      if (bullet.checkBoundary()) return false;
      bullet.reflect();
      return true;
    });

    requestAnimationFrame(gameLoop);
  }

  // 測試畫布是否可繪製
  function testRender() {
    console.log('Testing initial render');
    ctx.fillStyle = 'red';
    ctx.fillRect(10, 10, 50, 50);
  }
  testRender();

  // 事件監聽
  startButton.addEventListener('click', () => {
    console.log('Start button clicked');
    startGame();
  });
  exitButton.addEventListener('click', () => {
    console.log('Exit button clicked');
    exitGame();
  });

  upButton.addEventListener('click', () => shootBullet('up'));
  downButton.addEventListener('click', () => shootBullet('down'));
  leftButton.addEventListener('click', () => shootBullet('left'));
  rightButton.addEventListener('click', () => shootBullet('right'));

  document.addEventListener('keydown', e => {
    if (!Game.active || !['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    shootBullet(e.key.replace('Arrow', '').toLowerCase());
  });

  // 觸控支持
  const buttons = { upButton, downButton, leftButton, rightButton };
  Object.entries(buttons).forEach(([id, button]) => {
    button.addEventListener('touchstart', e => {
      e.preventDefault();
      shootBullet(id.replace('Button', ''));
    });
  });
});