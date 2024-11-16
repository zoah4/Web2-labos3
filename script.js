//inicijalizacija canvasa i konteksta za crtanje
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

//postavljanje širine i visine platna
canvas.width = window.innerWidth - 30;
canvas.height = window.innerHeight - 30;

//cigle
//broj redaka za cigle
const brickRowCount = 3;
//broj stupaca za cigle
const brickColumnCount = 6;
//visina cigle
const brickHeight = 20;
//padding cigle
const brickPadding = 10;
//razmak od gornjeg ruba do prvog reda cigli
const brickOffsetTop = 64;
//razmak od lijevog ruba i prve cigle
const brickOffsetLeft = 30;
//širina cigle je responzivna pa ovdje je računamo ovisno o platnu i razmacima
const brickWidth = (canvas.width - brickOffsetLeft * 2 - brickPadding * (brickColumnCount - 1)) / brickColumnCount;

//palica
//visina palice
const paddleHeight = 10;
//širina palice
const paddleWidth = 100;
//početna pozicija palice je centar platna
let paddleX = (canvas.width - paddleWidth) / 2;

//loptica
//radijus loptice
let ballRadius = 10;
//x i y koordinata početne pozicije loptice
let ballX = canvas.width / 2;
let ballY = canvas.height - paddleHeight - 20 - ballRadius; 
//ukupna brzina loptice
const speed = 5; 
//generira se nasumični kut između 30 i 150 stupnjeva
const angleInDegrees = Math.random() * (150 - 30) + 30;
//pretvorba stupnjeva u radijane
const angleInRadians = angleInDegrees * (Math.PI / 180); 

//pomaci po x i y za brzinu loptice
dx = Math.cos(angleInRadians) * speed;
//- jer ide prvo prema gore
dy = -Math.sin(angleInRadians) * speed;

//praćenje jesu li kliknute lijeva ili desna tipka
let rightPressed = false;
let leftPressed = false;
//praćenje rezultata
let score = 0;
//najbolji rezultat iz localstorage
let highScore = localStorage.getItem("highScore") || 0;
//praćenje da li je igra završila gubitkom ili pobijedom
let isGameOver = false;
let isWinner = false;

//kreiranje cigli
let bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
  bricks[c] = [];
  for (let r = 0; r < brickRowCount; r++) {
    ///postavljanje početnih pozicija cigli i statusa
    bricks[c][r] = { x: 0, y: 0, status: 1 };
  }
}

//slušanje tipkovnice za pomicanje palice
document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);

//funkcija kada se pritisne tipka za pomicanje udesno ili ulijevo
function keyDownHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") {
    rightPressed = true;
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    leftPressed = true;
  }
}

//funkcija se otpusti tipka za pomicanje udesno ili ulijevo za zaustavljanje pomicanja palice
function keyUpHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") {
    rightPressed = false;
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    leftPressed = false;
  }
}

//funkcija za crtanje loptice
function drawBall() {
  //početak crtanja loptice
  ctx.beginPath();
  //crtanje loptice u obliku kruga
  ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
  //boja loptice
  ctx.fillStyle = "#fff";
  //ispuni lopticu
  ctx.fill();
  //završetak crtanja
  ctx.closePath();
}

//funkcija za crtanje palice
function drawPaddle() {
  //početak crtanja
  ctx.beginPath();
  //oblik palice
  ctx.rect(paddleX, canvas.height - paddleHeight - 20, paddleWidth, paddleHeight);
  //boja sjene i vidljivost
  ctx.shadowColor = "rgba(0, 0, 0, 0.5)"; 
  //kolko je sjena oštra
  ctx.shadowBlur = 10;   
  //pomicanje sjene po x i y osi
  ctx.shadowOffsetX = 3;                
  ctx.shadowOffsetY = 3; 
  //boja palice       
  ctx.fillStyle = "#e80707";
  //ispuni
  ctx.fill();
  //završetak crtanja
  ctx.closePath();
}

//funkcija za crtanje cigli
function drawBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      //za svaku ciglu koja ima status 1, tj nije uništena nacrtaj ju
      if (bricks[c][r].status === 1) {
        //izračunavanje pozicije cigle u x i y osi
        let brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
        let brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
        //spremanje pozicije u polje
        bricks[c][r].x = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
        bricks[c][r].y = (r * (brickHeight + brickPadding)) + brickOffsetTop;
        //početak crtanja
        ctx.beginPath();
        //oblik cigle
        ctx.rect(brickX, brickY, brickWidth, brickHeight);
        //boja sjene i vidljivost
        ctx.shadowColor = "rgba(0, 0, 0, 0.5)"; 
        //kolko je sjena oštra
        ctx.shadowBlur = 10;   
        //pomicanje sjene po x i y osi            
        ctx.shadowOffsetX = 4;                
        ctx.shadowOffsetY = 4;   
        //boja cigle
        ctx.fillStyle = "#BC4A3C";
        //ispuni
        ctx.fill();
        //završetak crtanja
        ctx.closePath();
      }
    }
  }
}

//funkcija za crtanje rezultata
function drawScore() {
  const padding = 12;
  //širina teksta High score: 
  const textWidthHighScore = ctx.measureText("High Score: " + highScore).width;

  //pozadina za rezultate
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(canvas.width - padding - 156, 13 - padding, textWidthHighScore + padding * 2, 35 + padding * 2);

  //font teksta
  ctx.font = "22px Arial";
  //boja teksta
  ctx.fillStyle = "#FFF";
  //tekst i pozicije
  ctx.fillText("Score: " + score, canvas.width - 103, 50);
  ctx.fillText("High Score: " + highScore, canvas.width - 154, 25);
}

//detekcija sudara
function collisionDetection() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      let b = bricks[c][r];
      //za svaku ciglu provjeri dal ima status 1
      if (b.status === 1) {
        //provjeri jel cigla pogođena
        if (ballX + ballRadius > b.x && ballX - ballRadius < b.x + brickWidth &&
            ballY + ballRadius > b.y && ballY - ballRadius < b.y + brickHeight) {
              //promijeni smjer loptice prema dolje
              dy = -dy;
              //promijeni status cigle da je pogođena
              b.status = 0;
              //povećaj rezultat
              score++;
              //ako je trenutni rezultat veći od najboljeg rezultata to je novi najbolji rezultat
              if (score > highScore) {
                highScore = score;
                //spremi najbolji rezultat u localstorage
                localStorage.setItem("highScore", highScore);
              }
              //ako su pogođene sve cigle postavi da je igra završila pobjedom
              if (score === brickRowCount * brickColumnCount) {
                isWinner = true;
              }
        }
      }
    }
  }
}
//funkcija za prikaz pobjedničkog ekrana
function showVictoryScreen() {
  //font
  ctx.font = "100px Arial";
  //boja
  ctx.fillStyle = "white";
  //centriranje
  ctx.textAlign = "center";
  //ispisivanje poruke i vertikalno i horizontalno centriranje
  ctx.fillText("WINNER!", canvas.width / 2, canvas.height / 2);
}

//funkcija za prikaz Game over ekrana
function showGameOverScreen() {
  //font
  ctx.font = "100px Arial";
  //boja
  ctx.fillStyle = "white";
  //centriranje
  ctx.textAlign = "center";
  //ispisivanje poruke i vertikalno i horizontalno centriranje
  ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
}

//funkcija za pomicanje loptice
function moveBall() {
  //odbijanje od desne ili lijeve strane ekrana
  if (ballX + dx > canvas.width - ballRadius || ballX + dx < ballRadius) {
    //promjena smjera u lijevo ili desno tj. suprotni smjer
    dx = -dx;
  }
  //odbijanje od gornje strane ekrana
  if (ballY + dy < ballRadius) {
    //promjena smjera u dolje
    dy = -dy;
  } //odbijanje od donje strane ekrana
  else if (ballY + dy + ballRadius > canvas.height - paddleHeight - 20) {
    //odbijanje od palice
    if (ballX + ballRadius > paddleX && ballX - ballRadius < paddleX + paddleWidth) {
      //promjena smjera prema gore
      dy = -dy;
    } //palica je promašena
    else {
      //postavi da je igra završila gubitkom
      isGameOver = true;
    }
  }
  //pomicanje loptice po x i y osi
  ballX += dx;
  ballY += dy;
}

//funkcija za crtanje
function draw() {
  //ako je igra završila gubitkom prikaži Game over ekran
  if (isGameOver) {
    showGameOverScreen();
    return;
  }//ako je igra završila pobjedom sve ponovno na crtaj i prikaži na kraju pobjednički ekran 
  else if (isWinner) {
    //čišćenje ekrana
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //crtanje cigli
    drawBricks();
    //crtanje loptice
    drawBall();
    //crtanje palice
    drawPaddle();
    //crtanje rezultata
    drawScore();
    //detektiraj sudar
    collisionDetection();
    //pomakni lopticu
    moveBall();
    showVictoryScreen();
    return;
  }

  //čišćenje ekrana
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  //crtanje cigli
  drawBricks();
  //crtanje loptice
  drawBall();
  //crtanje palice
  drawPaddle();
  //crtanje rezultata
  drawScore();
  //detektiraj sudar
  collisionDetection();
  //pomakni lopticu
  moveBall();
 
  
  if (rightPressed && paddleX < canvas.width - paddleWidth) {
    //pomicanje palice udesno
    paddleX += 7;
  } else if (leftPressed && paddleX > 0) {
    //pomicanje palice uljevo
    paddleX -= 7;
  }

  //ponovno pozivanje funkcije draw za animaciju
  requestAnimationFrame(draw);
}

//pokretanje igre
draw();
