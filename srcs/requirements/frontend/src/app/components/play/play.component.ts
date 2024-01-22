import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, HostListener, OnDestroy } from '@angular/core';
import { SocketService } from '../../services/socket.service';
import { UserInfoService } from 'src/app/services/user-info.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { LogService } from 'src/app/services/log.service';
import { take, pipe } from 'rxjs';

@Component({
  selector: 'app-play',
  templateUrl: './play.component.html',
  styleUrls: ['./play.component.css']
})
export class PlayComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('gameCanvas', { static: true }) gameCanvas!: ElementRef;
  gameState: any;
  context!: CanvasRenderingContext2D;
  player: string | null = null;
  username: string = "";
  curId!: number;
  p1: string = "";
  p2: string = "";
  room: string = "";
  selectedColor: string = '#09570e';
  originalWidth = 600;  // Original canvas width
  originalHeight = 400; // Original canvas height
  scaleFactor = 1;
  finito: boolean = false;

  constructor(
    private socketService: SocketService,
    private uInfoService: UserInfoService,
    private router: Router,
    private logService: LogService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.uInfoService.user$.pipe(take(1)).subscribe( (user) => {
      console.log('Utilisateur connecté:', user.name); // Log de débogage
      this.username = user.name;
      this.curId = user.id;
      let statInfo = {status: "INGAME"};
      console.log("stats ");
      this.logService.updateUser(this.curId, statInfo).pipe(take(1)).subscribe(
        () => {
          console.log("stats done INGAME");
        }
      );
    });
    this.route.queryParams.pipe(take(1)).subscribe(params => {
      this.selectedColor = params['color'] || this.selectedColor;
      this.room = params['room'];
      console.log("Received color:", this.selectedColor);  
    });
    this.socketService.start("UWUUU",this.username);
    console.log("ngOnInit called");  // Debug log
    this.socketService.gameState.subscribe(state => {
      // console.log("Received state:", state);  // Debug log
      this.gameState = state;
      this.drawGame();
    });
    this.socketService.playerAssignment.pipe(take(1)).subscribe(role => {
      // console.log('I have been assigned as', role);
      this.player = role;
      // Update your game logic based on the assigned role
    });
    this.socketService.players.pipe(take(1)).subscribe(role => {
      // console.log('I have been assigned as', role);
      [this.p1, this.p2] = role.split(" ");
      // Update your game logic based on the assigned role
    });
    this.socketService.winner.pipe(take(1)).subscribe(winner => {
      console.log('win message: ', winner);
      this.username = winner;
      this.drawWin();
      // Update your game logic based on the assigned role
    });

  }

  ngAfterViewInit() {
    // console.log("ngAfterViewInit called");  // Debug log
    const context = (<HTMLCanvasElement>this.gameCanvas.nativeElement).getContext('2d');
    if (context !== null) {
      this.context = context;
      // console.log("Context assigned:", context);  // Debug log
    } else {
      console.error('Failed to get 2D rendering context');
      return;
    }
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    this.drawGame();
  }

  resizeCanvas() {
    const canvas = this.gameCanvas.nativeElement;
    const parent = canvas.parentElement;
    const scaleWidth = parent.clientWidth / this.originalWidth;
    const scaleHeight = parent.clientHeight / this.originalHeight;
    const scale = Math.min(scaleWidth, scaleHeight);

    canvas.width = this.originalWidth * scale;
    canvas.height = this.originalHeight * scale;

    this.scaleFactor = scale;  // Store the scale factor for use in drawing functions
    this.drawGame();  // Redraw the game to fit the new size
  }

  drawGame() {
    if (!this.context || !this.gameState || this.finito ) {
      if(this.finito) {
        this.drawWin();
        return;
      }
      console.log("Exiting drawGame because context or gameState is missing");
      const ctx = this.context;
          const scale = this.scaleFactor;

      ctx.fillStyle = this.selectedColor;
      ctx.font = `${40 * scale}px 'Press Start 2P'`;
      ctx.fillText("GAME ?", 70 * scale, 300 * scale);
      return;
    }
  
    const ctx = this.context;
    const scale = this.scaleFactor;
    
    // Clear the canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
    // Scaling and drawing game elements

    // get the couleur
    ctx.fillStyle = this.selectedColor;
  
    // Draw Paddle 1
    ctx.fillRect(10 * scale, this.gameState.paddle1.y * scale, 10 * scale, 100 * scale);
  
    // Draw Paddle 2
    ctx.fillRect((580 * scale), this.gameState.paddle2.y * scale, 10 * scale, 100 * scale);
  
    // Draw Ball
    ctx.fillRect((this.gameState.ball.x - 5) * scale, (this.gameState.ball.y - 5) * scale, 10 * scale, 10 * scale);
  
    // Display player names before the scores
    ctx.font = `${20 * scale}px 'Press Start 2P'`;
    ctx.fillText(this.p1, 60 * scale, 30 * scale); 
    ctx.fillText(this.p2, 460 * scale, 30 * scale);
  
    // Draw Scores
    ctx.font = `${32 * scale}px 'Press Start 2P'`;
    ctx.fillText(this.gameState.score1.toString(), 100 * scale, 70 * scale);
    ctx.fillText(this.gameState.score2.toString(), 500 * scale, 70 * scale);
  }
  
  drawWin() {
    if (!this.username) {
      console.log("Exiting drawWin because username is missing");
      this.router.navigate(['/play-menu']);
      return;
    }
    
    this.finito = true;
    const ctx = this.context;
    const scale = this.scaleFactor;
  
    // Clear the canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
    // Draw WINNER TEXT
    ctx.fillStyle = this.selectedColor;
    ctx.font = `${60 * scale}px 'Press Start 2P'`;
    ctx.fillText(this.username, 70 * scale, 200 * scale);
  
    ctx.font = `${40 * scale}px 'Press Start 2P'`;
    ctx.fillText("Won the game", 70 * scale, 300 * scale);

    let statInfo = {status: "ONLINE"};
    console.log("stats ");
    this.logService.updateUser(this.curId, statInfo).pipe(take(1)).subscribe(
      () => {
        console.log("stats of "+ this.username + " done ONLINE");
      }
    );
    this.socketService.leaveRoom(this.room, this.username);
  }
  
  
  moveUp(paddle: string) {
    if (!this.context || !this.gameState) {
      return;
    }
    this.socketService.move(paddle, this.gameState[paddle].y - 10);
  }

  moveDown(paddle: string) {
    if (!this.context || !this.gameState) {
      return;
    }
    this.socketService.move(paddle, this.gameState[paddle].y + 10);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (this.player === null) return;

    switch (event.code) {
      case 'KeyW':  // W key
        this.moveUp(this.player);
        break;
      case 'KeyS':  // S key
        this.moveDown(this.player);
        break;
      default:
        break;
    }
  }

  onQuit(): void {
    this.socketService.leaveRoom(this.room, this.username);
  }

  ngOnDestroy() {
    this.socketService.leaveRoom(this.room, this.username);
}
}
