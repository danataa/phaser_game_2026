import { pick } from 'pick-random-weighted';
import GamePlay from "./GamePlay";
import PlayerBeat from '../gameComponents/player/Player.Beat';
import EnemyCar from '../gameComponents/enemy/Enemy.Car';
import BulletBeat from '../gameComponents/bullets/Bullet.Beat';
import EnemyCialtrone from '../gameComponents/enemy/Enemy.Cialtrone';
import { GameData } from "../GameData";
import { translations } from "../Translations";
import { language, hitDirection, levelEndState, bonusTypes, bulletDirection, staticObjects, hitTypes } from "../Enums";
import EnergyBar from '../gameComponents/others/EnergyBar';
import Bonus from '../gameComponents/bonus/Bonus';
import BonusHolder from '../gameComponents/bonus/Bonus.Holder';
import BonusBeat from '../gameComponents/bonus/Bonus.Beat';
import BonusDischarger from '../gameComponents/bonus/Bonus.Discharger';
import BulletBasic from '../gameComponents/bullets/Bullet.Basic';
import TextMessage from '../gameComponents/others/TextMessage';


export default class GamePlayBeat extends GamePlay {

  private _mainEnemy: EnemyCialtrone;
  private _cars: Array<EnemyCar> = [];
  private _playerBeatsGroup: Phaser.GameObjects.Group;
  private _parallax: Array<Phaser.GameObjects.TileSprite> = [];
  private _enemyIsBeated: boolean = false;
  private _playerIsBeated: boolean = false;
  private _levelCompleted: boolean = false;
  private _currentLanguage: language = language.english;
  private _isDialogClosed: boolean = false;
  private _viewportWidth: number = GameData.globals.gameWidth;
  private _ground: Phaser.GameObjects.Image;
  private _groupBelowAll: Phaser.GameObjects.Group;
  private _groupAboveAll: Phaser.GameObjects.Group;
  private _groupCars: Phaser.GameObjects.Group;
  private _superPower1Emitter: Phaser.GameObjects.Particles.ParticleEmitter;
  private _superPower2Emitter: Phaser.GameObjects.Particles.ParticleEmitter;
  private _superPower3Emitter: Phaser.GameObjects.Particles.ParticleEmitter;
  private _socksEmitter: Phaser.GameObjects.Particles.ParticleEmitter;

  private _bonus = [
    [bonusTypes.canStrike, 10],
    [bonusTypes.invulnerability, 10],
    [bonusTypes.time, 40],
    [bonusTypes.damage, 40],
    [bonusTypes.health, 50]
  ];


  constructor() {
    super();
  }

  create(): void {



    //richiamo la create dalla classe padre in modo da istanziare le variabili comuni a tutti i possibili gameplay
    super.create();

    this.cameras.main.fadeIn(500, 0, 0, 0);

    this._Audio.playMusic(this._levelData.beat.dialogMusic.key, true, this._levelData.beat.dialogMusic.volume || 0.5);


    this._superPower1Emitter = this.add.particles(0, 0, 'effects', {
      frame: [54,55,59],
      lifespan: 1000,
      speedY: { min: -250, max: -450 },
      speedX: { min: -100, max: 100 },
      scale: { start: 0.75, end: 1 },
      rotate: { start: 0, end: 360, random: true },
      gravityY: 1000,
      emitting: false
    }).setDepth(999);

    this._superPower3Emitter = this.add.particles(0, 0, 'effects', {
      frame: [28, 29, 30, 32, 33, 34, 35, 37, 37, 38, 39],
      lifespan: 1500,
      speedY: { min: -250, max: -450 },
      speedX: { min: -100, max: 100 },
      scale: { start: 1.2, end: 1.5 },
      rotate: { start: 0, end: 360, random: true },
      gravityY: 1000,
      emitting: false
    }).setDepth(999);

     this._socksEmitter = this.add.particles(0, 0, 'effects', {
      frame: [60,61,62],
      lifespan: 1500,
      speedY: { min: -250, max: -450 },
      speedX: { min: -100, max: 100 },
      scale: { start: 1.2, end: 1.5 },
      rotate: { start: 0, end: 360, random: true },
      gravityY: 1000,
      emitting: false
    }).setDepth(999);


    //setto la lingua corrente
    this._currentLanguage = this.registry.get("language") || language.english;

    //creo se non esiste già l'animazione per l'effetto di hit sulle auto
    if (!this.anims.exists("car-hit")) {
      this.anims.create({
        key: "car-hit",
        frames: this.anims.generateFrameNumbers("effects", { frames: [20, 21, 22, 23] }),
        frameRate: 10,
        repeat: 0
      });
    }

    this._levelText = this.add.text(this.game.canvas.width / 2, this.game.canvas.height / 2, this._levelData.title, { color: "#ffffff" }).setFontFamily("PressStart2P").setOrigin(0.5, 0.5).setFontSize(60).setAlpha(0).setDepth(1000).setScrollFactor(0).setStroke("#000000", 6);

    //creo i gruppi che saranno utilizzati per le collisioni
    this._groupBelowAll = this.add.group()
    this._playerBeatsGroup = this.add.group({ runChildUpdate: true })
    this._enemyGroup = this.add.group({ runChildUpdate: true })
    this._bulletGroup = this.add.group({ runChildUpdate: true })
    this._bonusGroup = this.add.group({ runChildUpdate: true })
    this._groupCars = this.add.group({ runChildUpdate: true })
    this._groupAboveAll = this.add.group()

    this.cameras.main.setBackgroundColor(0x000000);
    this.add.tileSprite(-20, -20, 1320, 510, "sky").setOrigin(0, 0).setScrollFactor(0);

    this.physics.world.setBounds(0, 0, this._viewportWidth * 2, 660);
    this.cameras.main.setBounds(0, 0, this._viewportWidth * 2, 720);

    this._parallax = [];
    if (this._levelData.beat.parallax) {
      this._levelData.beat.parallax.forEach(par => {

        this._parallax.push(this.add.tileSprite(par.x, par.y, par.w, par.h, par.key).setOrigin(0, 1));
      });

    }

    this._ground = this.add.image(0, 720, this._levelData.beat.ground).setOrigin(0, 1);

    //recupero le auto dall' oggetto del livello e creo le istanze delle auto
    let _cars: Array<{ x: number }> = this._levelData.beat.cars;
    let _car: EnemyCar;
    _cars.forEach(car => {
      _car = new EnemyCar({ scene: this, x: car.x, y: 580, key: "car", frame: 0, enemyData: {} });
      this._cars.push(_car);
      this._groupCars.add(_car);

    });



    //recupero gli statics dall' oggetto del livello e lo assegno ad una variabile
    let _statics: Array<{ type: number; x: number; y?: number; maxHits?: number, texture?: string, frame?: number, bonusHolded?: any }> = this._levelData.beat.statics;


    //filtro tutti gli static holder da _statics
    let _bonusHolders = _statics.filter(staticObj => staticObj.type === staticObjects.bonusHolder);

    //assegno a tutti gli elementi in _bonusHolders il bonus di tipo time
    _bonusHolders.forEach(bonusHolder => {

      bonusHolder.bonusHolded = pick(this._bonus)
    });
    //scelgo uno random tra gli static holder e gli assegno il bonus strike
    // Phaser.Math.RND.pick(_bonusHolders).bonusHolded = bonusTypes.canStrike;

    //ciclo tutti gli static e li creo
    _statics.forEach(staticObj => {

      //se è uno static che può essere distrutto per rilasciare un bonus
      if (staticObj.type === staticObjects.bonusHolder) {

        //creo la barra di energia per lo static
        let _energyBar = new EnergyBar({ scene: this, x: 0, y: 0, energybarData: { health: 100, width: 50, height: 5, hide: true, name: "", border: true, borderColor: 0x000000 } });
        //e la passo uno static come parametro aggiuntivo

        let _static: BonusHolder = new BonusHolder({ scene: this, x: staticObj.x, y: staticObj.y, key: staticObj.texture, frame: staticObj.frame, type: bonusTypes.holder, bonusData: { energyBar: _energyBar, maxHits: staticObj.maxHits, frame: staticObj.frame, type: staticObj.bonusHolded } });
        this._bonusGroup.add(_static);
        //aggiungo uno static al gruppo dei nemici 

        //se è uno static di tipo discharger nel quale bisogna riportare i bonus raccolti dal player per attivare la rage
      } else if (staticObj.type === staticObjects.bonusDischarger) {

        let _discharger = new BonusDischarger({ scene: this, x: staticObj.x, y: staticObj.y, key: staticObj.texture, frame: staticObj.frame, type: bonusTypes.discharger, bonusData: { texture: staticObj.texture, frame: staticObj.frame } });
        this._bonusGroup.add(_discharger);

        //se è uno static di tipo 2 che non fa nulla ed è solo decorativo
      } else if (staticObj.type === staticObjects.static) {

        this._bonusGroup.add(this.add.image(staticObj.x, staticObj.y, staticObj.texture, staticObj.frame).setOrigin(0.5, 1));

      }



    });

    this._player = new PlayerBeat({
      scene: this,
      x: 300,
      y: 565,
      key: "player-beat",
      frame: 0,

    });
    this._player.enterLevel()

    //recupero i cialtroni dall' oggetto del livello e creo le istanze dei cialtroni
    let _enemies: Array<{ type: number, x: number, main: boolean, speed: number }> = this._levelData.beat.enemies;

    //creo le istanze dei cialtroni ciclando l'array degli enemies
    _enemies.forEach(enemyObj => {

      let _enemy: EnemyCialtrone;
      //se è il nemico principale
      if (enemyObj.main) {
        _enemy = new EnemyCialtrone({ scene: this, x: enemyObj.x, y: 585, key: "player-beat", frame: 0, enemyData: { type: enemyObj.type, main: enemyObj.main, speed: enemyObj.speed } });

        //se è il nemico principale lo memorizzo in una istanza in modo da poterlo richiamare all'occorrenza ad esempio per la rage
        this._mainEnemy = _enemy;

        //se sono gli scagnozzi
      } else {

        //creo la barra di energia per lo scagnozzo
        let _energyBar = new EnergyBar({ scene: this, x: 0, y: 0, energybarData: { health: 100, width: 50, height: 5, hide: false, name: "" } });
        //e la passo al cialtrone come parametro aggiuntivo
        _enemy = new EnemyCialtrone({ scene: this, x: enemyObj.x, y: 585, key: "player-beat", frame: 0, enemyData: { type: enemyObj.type, main: enemyObj.main, speed: enemyObj.speed, energyBar: _energyBar } });


      }
      //aggiungo il cialtrone al gruppo dei nemici
      this._enemyGroup.add(_enemy);
    });
    //se non ci sono nemici il livello è subito vinto ma controllo comunque che tutte le auto siano distrutte
    if (_enemies.length === 0) {
      this._enemyIsBeated = true;
    }

    this.generateTrashBonus();

    //la camera segue il player
    this.cameras.main.startFollow(this._player, true, 0.1, 0.1);

    //collider tra player e cars
    this.physics.add.collider(this._player, this._cars, (player: any, car: any) => {

      if (this._player.isTouching().down) {
        car.tweenToDown();
      }

    }, undefined, this);


    this.physics.add.overlap(this._playerBeatsGroup, this._enemyGroup, this.playerBeatHitEnemy, undefined, this);
    this.physics.add.overlap(this._playerBeatsGroup, this._cars, this.playerBeatHitCar, undefined, this);
    this.physics.add.overlap(this._playerBeatsGroup, this._bonusGroup, this.playerBeatHitBonus, undefined, this);
    this.physics.add.overlap(this._player, this._bulletGroup, this.enemyBeatHitPlayer, undefined, this);
    this.physics.add.overlap(this._player, this._bonusGroup, this.playerGetBonus, undefined, this);


    this.time.addEvent({
      delay: 100,
      callback: () => {

        this.events.emit("start-dialog", [this._level]);
      },
      loop: false,
      callbackScope: this
    });


    //aggiungo un elemnto animato
    this.animateElement();


    this._groupBelowAll.setDepth(1);
    this._groupCars.setDepth(2);
    this._playerBeatsGroup.setDepth(2);
    this._bulletGroup.setDepth(3);
    this._bonusGroup.setDepth(4);
    this._player.setDepth(5);
    this._enemyGroup.setDepth(6);
    this._groupAboveAll.setDepth(7);


    //on key press A,S,D for debug
    //-------------------------------------
/*
    this.input.keyboard.on('keydown-A', () => {
      this.superPower1(1000);
    });

    this.input.keyboard.on('keydown-S', () => {
      this.superPower2(1000);
    });

    this.input.keyboard.on('keydown-D', () => {
      this.superPower3(1000);
    });




    
        this.generateBonus(650, 600, bonusTypes.invulnerability);
    
        this.generateBonus(750, 600, bonusTypes.damage);
    
        this.generateBonus(850, 600, bonusTypes.canStrike);
    
        this.generateBonus(950, 600, bonusTypes.time);
    
        this.generateBonus(1050, 600, bonusTypes.health);
    
  */


  }

  endDialog(): void {
   
    this._isDialogClosed = true;
    this._parallax.forEach((par: Phaser.GameObjects.TileSprite, index: number) => {
      par.setScrollFactor(0);
    });

    this._Audio.playMusic(this._levelData.music.key, this._levelData.music.loop || true, this._levelData.music.volume || 0.4);

  }



  superPower1(enemyX: number): void {

    if (!this.anims.exists("superPower1")) {
      this.anims.create({
        key: "superPower1",
        frames: this.anims.generateFrameNumbers("superPower1", { frames: [0, 1, 2] }),
        frameRate: 10,
        repeat: -1
      });
    }

    for (let i = 0; i < 4; i++) {

      let _x: number = 0;
      this.time.delayedCall(i * 200, () => {

        _x = enemyX - (((i + 1) * 250) * (this.playerPosition().x < enemyX ? 1 : -1));

        this.playSfx("fire", 0.5);
        this.addToBulletGroup(

          new BulletBasic({
            scene: this,
            x: _x,
            y: 600,
            key: "superPower1",
            speed: 0,
            damage: 30,
            body: { shape: "circle", radius: 14, ox: 3, oy: 30 },
            scale: { x: 2, y: 2 },
            name: "superPower1",
            direction: bulletDirection.up,
            bulletData: { animation: "superPower1", from: "cialtrone", parentPosition: { x: _x, y: 600 }, removeAfter: 3500 },

          }))
        this._superPower1Emitter.emitParticleAt(_x, 660, 5);
      });



    }

  }

  superPower2(enemyX: number): void {

    this.addToBulletGroup(

      new BulletBasic({
        scene: this,
        x: enemyX,
        y: 540,
        key: "effects",
        frame: 18,
        name: "superPower2",
        scale: { x: 1.5, y: 1.5 },
        body: { shape: "circle", radius: 15, ox: 10, oy: 10 },
        speed: 600 * (this.playerPosition().x < enemyX ? 1 : -1),
        damage: 30,
        direction: bulletDirection.left,
        bulletData: { from: "cialtrone", parentPosition: { x: enemyX, y: 540 }, rotation: -0.1 },

      }))


  }

  superPower3(enemyX: number): void {




    for (let i = 0; i < 6; i++) {

      this.time.delayedCall(i * 200, () => {

        this.addToBulletGroup(

          new BulletBasic({
            scene: this,
            x: enemyX - (((i + 1) * 150) * (this.playerPosition().x < enemyX ? 1 : -1)),
            y: 0,
            key: "effects",
            frame: 31,
            name: "superPower3",
            speed: 600,
            damage: 30,
            scale: { x: 1.5, y: 1.5 },
            body: { shape: "circle", radius: 15, ox: 10, oy: 20 },
            direction: bulletDirection.down,
            bulletData: { from: "cialtrone", parentPosition: { x: enemyX, y: 0 }, removeAfter: 1050, removeEmitter: this._superPower3Emitter, removeCallback: () => {   
              this.cameras.main.shake(300, 0.01);
              this._Audio.playSfx("hitCar1", 0.5);
            }},

          }))

      });

    }

  }


  playerGetBonus(player: any, bonus: any): void {

    const _bonus: Bonus = bonus as Bonus;
    const _player: PlayerBeat = player as PlayerBeat;

   

    //se il bonus è un discharger lo gestisco a parte
    if (_bonus.getType() === bonusTypes.discharger) {

      //se il playter non è in rage e non può ancora colpire e ha della rage accumulata
      if (!_player.isRage() && !_player.canBeat() && this._hud.getPlayerRage() > 0) {

        this.events.emit("start-player-rage");

        bonus.startDischarge();
      }


    } else if (_bonus.getType() === bonusTypes.holder) {
      //do nothing
      //....
    } else {
      // Gestione degli altri tipi di bonus

      //se il bonus non è ancora collectable non fare nulla
      if (!_bonus.isCollectable()) return;

      //console.log("Player gets bonus: ", _bonus.getType());

      _bonus.getBonus();
      this.playSfx("bonus", 0.5);
      switch (_bonus.getType()) {

        case bonusTypes.time:
          this.events.emit("update-time", 20);
          new TextMessage({ scene: this, x: _player.x, y: _player.y - 100, text: "+5 " + translations[this._currentLanguage].seconds });

          break;

        case bonusTypes.health:

          this._hud.updatePlayerEnergy(+20);

          new TextMessage({ scene: this, x: _player.x, y: _player.y - 100, text: "+20 " + translations[this._currentLanguage].health });

          break;

        case bonusTypes.damage:

          this._player.increaseDamage(5);

          new TextMessage({ scene: this, x: _player.x, y: _player.y - 100, text: "+5 " + translations[this._currentLanguage].damage });

          break;

        case bonusTypes.canStrike:
          _player.setBeat(true, true);
          this._hud.greenLight();
          new TextMessage({ scene: this, x: _player.x, y: _player.y - 100, text: "10 " + translations[this._currentLanguage].seconds + " " + translations[this._currentLanguage].fightStart });

          this.time.delayedCall(10000, () => {
            _player.setBeat(false, false);
            this._hud.redLight();
          }, [], this);


          break;

        case bonusTypes.invulnerability:
          _player.setInvulnerability(10000);
          new TextMessage({ scene: this, x: _player.x, y: _player.y - 100, text: "10 " + translations[this._currentLanguage].seconds + " " + translations[this._currentLanguage].invulnerability });
          break;

        case bonusTypes.trash:
          //se il player non è giàin rage aumenta la rage
          if (!this._player.isRage()) this._hud.updatePlayerRage(20);

          this.events.emit("update-score", 100);
           new TextMessage({ scene: this, x: _player.x, y: _player.y - 100, text: "+100" });
         
          //se il nemico principale è ancora vivo aggiungo tempo quando si raccolgono i bonus trash
          if (this._mainEnemy != null && this._mainEnemy.isAlive()) {

            this.events.emit("update-time", 3);
          }
          this.generateTrashBonus();
          break;
      }
    }

  }





  //il cialtrone colpisce il player
  enemyBeatHitPlayer(player: any, enemyBeat: any): void {

    //console.log(enemyBeat.name);
    const _enemyBeat: BulletBeat = enemyBeat as BulletBeat;
    const _player: PlayerBeat = player as PlayerBeat;
    if (!_player.isInvulnerable() && !_player.isDead()) {

      _enemyBeat.getDamage();
      let _health: number = this._hud.updatePlayerEnergy(-_enemyBeat.getDamage());
      let _hitDirection: hitDirection = null;
      let _parentPosition = _enemyBeat.getParentPosition() != null ? _enemyBeat.getParentPosition() : { x: enemyBeat.x, y: enemyBeat.y };
      if (this._player.x > _enemyBeat.getParentPosition().x) {
        _hitDirection = hitDirection.left;
      } else {
        _hitDirection = hitDirection.right;
      }

      let _hitType: hitTypes;

      switch (_enemyBeat.name) {

        case "beat":
          this.createHitEffect(_enemyBeat.x, _enemyBeat.y);
          _enemyBeat.remove();
          _hitType = hitTypes.punchOrKick;
          break;
        case "superPower1":
          _hitType = hitTypes.superPower1;
          break;
        case "superPower2":
          _hitType = hitTypes.superPower2;
          _enemyBeat.remove();
          this.createHitEffect(_enemyBeat.x, _enemyBeat.y);
          this._superPower2Emitter = this.add.particles(0, 0, 'effects', {
            frame: [18],
            lifespan: 2000,
            speedY: { min: -250, max: -450 },
            speedX: { min: -100, max: 100 },
            scale: { start: 1.5, end: 1.5 },
            rotate: { start: 0, end: 360, random: true },
            gravityY: 1000,
            emitting: false
          }).setDepth(999);
          this._superPower2Emitter.emitParticleAt(_enemyBeat.x, _enemyBeat.y, 1);

          break;
        case "superPower3":
          _hitType = hitTypes.superPower3;
          this.createHitEffect(_enemyBeat.x, _enemyBeat.y);
          _enemyBeat.remove();
          break;

      }



      if (_health <= 0) {
        _player.hitToDeath(_enemyBeat.getDamage(), _hitDirection, _parentPosition.x, _parentPosition.y, _hitType);
      } else {
        _player.hit(_enemyBeat.getDamage(), _hitDirection, _parentPosition.x, _parentPosition.y, _hitType);
      }

    }
  }


  //il player colpisce uno static
  playerBeatHitBonus(playerBeat: any, bonus: any): void {

    if (bonus.getType() === bonusTypes.holder) {
      const _playerBeat: BulletBeat = playerBeat as BulletBeat;
      _playerBeat.remove();
      const _static: BonusHolder = bonus as BonusHolder;

      _static.hit();
      this.createHitEffect(_playerBeat.x, _playerBeat.y);

    }

  }



  createHitEffect(x: number, y: number): void {


    let _hitEffect = this.add.sprite(x, y, "effects", 21).setScale(1.5).setOrigin(0.5, 0.5)
      .setDepth(1000);
    _hitEffect.play("car-hit");
    _hitEffect.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      _hitEffect.destroy();
    }
    );

  }



  //il player colpisce il cialtrone
  playerBeatHitEnemy(playerBeat: any, enemy: any): void {

    const _playerBeat: BulletBeat = playerBeat as BulletBeat;

    this.createHitEffect(_playerBeat.x, _playerBeat.y);

    const _enemy: EnemyCialtrone = enemy as EnemyCialtrone;
    let _hitDirection: hitDirection = null;

    if (this._player.x < _enemy.x) {
      _hitDirection = hitDirection.left;
    } else {
      _hitDirection = hitDirection.right;
    }

    //setto un valore di default per gestire il controllo su _health<=0
    let _health: number = 1;

    //se è il nemico principale
    if (_enemy.isMainEnemy()) {

      //se non è in rage calcolo il danno da applicare
      if (!_enemy.isRage()) {
        //recupero il valore di vita rimanente del nemico dopo aver applicato il danno
        _health = this._hud.updateEnemyEnergy(-_playerBeat.getDamage());
        //aumento la rage del nemico principale in base al danno subito
        let _rage: number = this._hud.updateEnemyRage(_playerBeat.getDamage() * 1.5);
        //se la rage è al 100% attivo la rage
        if (_rage >= 100) {
          // attiva la rage per il nemico principale
          //...
          this.startEnemyRage();
        }
      }

      //se la vita del nemico è <=0 e non è in carica muore
      if (_health <= 0 && !_enemy.isCharging()) {
         //richiamo il metodo hitToDeath del nemico per farlo morire
        _enemy.hitToDeath(_playerBeat.getDamage(), _hitDirection, _playerBeat.x, _playerBeat.y);
        //genera un bonus casuale sopra la testa del nemico
         this.generateBonus(_enemy.x, _enemy.y - 50, pick(this._bonus));

      }
      //se il nemico non è morto e non è in carica subisce il danno
      else if (_health > 0 && !_enemy.isCharging()) {
        //richiamo il metodo hit del nemico per fargli subire il danno
        _enemy.hit(_playerBeat.getDamage(), _hitDirection, _playerBeat.x, _playerBeat.y);
        //genera un bonus casuale sopra la testa del nemico iun maniera random
        this.generateRandomBonus(_enemy.x, _enemy.y - 50);
         this._socksEmitter.emitParticleAt(_enemy.x, _enemy.y - 60, 5);

      }

    } 
    //se è uno scagnozzo e non è il nemico principale del livello
    else if (!_enemy.isMainEnemy()) {
      //recupero il valore di vita rimanente del nemico dopo aver applicato il danno
      _health = _enemy.getEnergyBar().updateValue(-_playerBeat.getDamage());

      //se la vita del nemico è <=0 muore
      if (_health <= 0) {
        //richiamo il metodo hitToDeath del nemico per farlo morire
        _enemy.hitToDeath(_playerBeat.getDamage(), _hitDirection, _playerBeat.x, _playerBeat.y);
        //genera un bonus casuale sopra la testa del nemico
        this.generateBonus(_enemy.x, _enemy.y - 50, pick(this._bonus));
      } else {
        //richiamo il metodo hit del nemico per fargli subire il danno
        _enemy.hit(_playerBeat.getDamage(), _hitDirection, _playerBeat.x, _playerBeat.y);
         this._socksEmitter.emitParticleAt(_enemy.x, _enemy.y - 60, 5);
        //genera un bonus casuale sopra la testa del nemico iun maniera random
        this.generateRandomBonus(_enemy.x, _enemy.y - 50);
      }

    }

  }

  generateRandomBonus(x: number, y: number): void {

    //genera un bonus casuale sopra la testa del nemico in base all'energia del player rimanente in maniera inversamente proporzionale
    //minore è l'energia del player maggiore è la probabilità di generare un bonus
    let playerEnergy: number = this._hud.getPlayerEnergy();
    let probability: number = 100 - playerEnergy;
    let _random: number = Phaser.Math.Between(1, 100);
    if (_random <= probability)
      this.generateBonus(x, y, pick(this._bonus));
  }

  // genera un bonus casuale quando uno static viene distrutto
  generateBonus(x: number, y: number, type: bonusTypes): void {
    

    let _hitDirection: hitDirection = null;
    if (this._player.x < x) {
      _hitDirection = hitDirection.left;
    } else {
      _hitDirection = hitDirection.right;
    }

    this.addToBonusGroup(
      new BonusBeat({ scene: this, x: x, y: y, key: "bonus", bonusData: { score: 0, type: type, hitDirection: _hitDirection }, type: type })
    );
  }

  generateTrashBonus(): void {
    //genera un nuovo bonus trash in una posizione casuale che non sia nella visuale della camera attuale del player

    let _x: number = 0;

    /* Metodo alternativo per generare un punto fuori dalla vista della camera generandio un punto casuale e controllando se è nella vista della camera
     do {
      _x = Phaser.Math.Between(0, this.physics.world.bounds.width);

    } while (_x > this.cameras.main.scrollX && _x < this.cameras.main.scrollX + this.cameras.main.width)
    */

    //se lo scroll della camera è nella prima metà del quadro genera il bonus a destra della camera, altrimenti a sinistra
    _x = this.cameras.main.scrollX > this._viewportWidth / 2
      ? Phaser.Math.Between(250, this.cameras.main.scrollX)
      : Phaser.Math.Between(this.cameras.main.scrollX + this._viewportWidth, (this._viewportWidth * 2) - 250);

    this.addToBonusGroup(
      new BonusBeat({ scene: this, x: _x, y: 600, key: "bonus", bonusData: { score: 0, type: bonusTypes.trash, hitDirection: hitDirection.right }, type: bonusTypes.trash })
    );
  }

  startEnemyRage(): void {

    this.events.emit("start-enemy-rage");
  }

  endEnemyRage(): void {
    if (this._mainEnemy) {
      this.events.emit("stop-enemy-rage");
      this._mainEnemy.setRage(false);
    }

  }

  endPlayerRage(): void {

    this.events.emit("stop-player-rage");
    this._player.endRage();
  }

  playerBeatHitCar(playerBeat: any, car: any): void {

    const _playerBeat: BulletBeat = playerBeat as BulletBeat;
    const _car: EnemyCar = car as EnemyCar;

    let _beatCorrectSide: boolean = false;
    if (_playerBeat.x < _car.x) {
      _car.tweenToRight();
      _beatCorrectSide = _car.hit(_playerBeat.getDamage(), hitDirection.left, _playerBeat.x, _playerBeat.y);
    } else {
      _car.tweenToLeft();
      _beatCorrectSide = _car.hit(_playerBeat.getDamage(), hitDirection.right, _playerBeat.x, _playerBeat.y);
    }

    // console.log(this._mainEnemy != null , this._mainEnemy.isRage() , _beatCorrectSide)
    if (this._mainEnemy != null && !this._mainEnemy.isRage() && _beatCorrectSide && this._mainEnemy.isAlive()) {

      let _rage: number = this._hud.updateEnemyRage(_playerBeat.getDamage() * 3);

      if (_rage >= 100) {
        // attiva la rage per il nemico principale
        this.startEnemyRage();
      }
    }


    let _hitEffect = this.add.sprite(_playerBeat.x, _playerBeat.y, "effects", 21).setScale(1.5).setOrigin(0.5, 0.5)
      .setDepth(1000);
    _hitEffect.play("car-hit");
    _hitEffect.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      _hitEffect.destroy();
    }
    );

    this.removePlayerBeat(_playerBeat);


    this.events.emit("car-hit");

  }

  addPlayerBeat(beat: BulletBeat): void {
    this._playerBeatsGroup.add(beat);
  }

  removePlayerBeat(beat: BulletBeat): void {
    this._playerBeatsGroup.remove(beat, true, true);
  }

  playerPosition(): { x: number, y: number } {
    return { x: this._player.x, y: this._player.y };
  }

  areAllCarsBroken(): boolean {

    return this._cars.every(car => car.isBroken());
  }


  update(time: number, delta: number): void {



    if (!this._levelCompleted) {

      this._player.update(time, delta);
      this._cars.forEach(car => { car.update(time, delta); });

      if (this.areAllCarsBroken() && this.isEnemyBeated()) {
        this.levelEndSequence(levelEndState.levelCompleted);
      }
      else if (this.isPlayerBeated()) {
        this.levelEndSequence(levelEndState.gameOver);

      } else if (this.isTimeOver()) {
        this.levelEndSequence(levelEndState.timeOver);
      }

      // Update parallax effect
      if (this._isDialogClosed) {
        this._parallax.forEach((par: Phaser.GameObjects.TileSprite, index: number) => {
          par.tilePositionX = this.cameras.main.scrollX * this._levelData.beat.parallax[index].scrollFactor;
        });
      }
    }

  }

  isTimeOver(): boolean {
    return this._hud.isTimeOver();
  }


  levelEndSequence(state: levelEndState): void {

    this._levelCompleted = true;
    this._playerIsActivated = false;
    this._player.deactivate();


    let _callback: () => void = () => { };
    switch (state) {
      case levelEndState.gameOver:
        //questo evento ferma tutte le azioni in corso nel gameplay di player e cialtrone
        this.events.emit('stop-action', ["game-over"]);
        this._levelText.setText(translations[this._currentLanguage].gameOver);
        _callback = () => { this.events.emit('game-over', ["game-over"]); };
        break;
      case levelEndState.timeOver:
        //questo evento ferma tutte le azioni in corso nel gameplay di player e cialtrone
        this.events.emit('stop-action', ["time-over"]);
        this._levelText.setText(translations[this._currentLanguage].timeOver);
        _callback = () => { this.events.emit('game-over', ["time-over"]); };
        break;
      case levelEndState.levelCompleted:
        //questo evento ferma tutte le azioni in corso nel gameplay di player e cialtrone
        this.events.emit('stop-action', ["level-completed"]);
        this._levelText.setText(translations[this._currentLanguage].levelCompleted);
        _callback = () => { this.events.emit("level-completed"); };
        break;
    }


    // se è game over o time over mostra il testo e poi salta al game over
    if (state == levelEndState.gameOver || state == levelEndState.timeOver) {
      this._Audio.stopMusic();
      this.playSfx("jingle3", 0.5);
      this._hud.hideAll();
      this.tweens.add({
        targets: [this._levelText],
        alpha: 1,
        duration: 500,
        delay: 250,
        yoyo: false,
        repeat: 0,
        onComplete: () => {

          this.time.delayedCall(2000, () => {
            this.cameras.main.fadeOut(500, 0, 0, 0, (camera: Phaser.Cameras.Scene2D.Camera, progress: number) => {


              if (progress === 1) {
                this._Audio.stopMusic();

                _callback();
              }

            })
          });

        }
      });


    }
    //se il livello è completato mostra il testo, scala il tempo bonus e poi salta alla schermata di livello completato
    else if (state == levelEndState.levelCompleted) {

      this.tweens.add({
        targets: [this._levelText],
        alpha: 1,
        duration: 500,
        delay: 250,
        yoyo: false,
        repeat: 0,

      });

      this._hud.startBonusTimeCount();


    }
  }

  nextLevel(): void {
    this._Audio.stopMusic();
    this.playSfx("jingle2", 0.5);
    this.time.delayedCall(3500, () => {
      this.cameras.main.fadeOut(500, 0, 0, 0, (camera: Phaser.Cameras.Scene2D.Camera, progress: number) => {
        if (progress === 1) {

          this.events.emit("level-completed");
        }

      })

    });
  }


  setEnemyBeated(beated: boolean): void {
    this._enemyIsBeated = beated;
  }

  isEnemyBeated(): boolean {
    return this._enemyIsBeated;
  }

  setPlayerBeated(beated: boolean): void {
    this._playerIsBeated = beated;
  }

  isPlayerBeated(): boolean {
    return this._playerIsBeated;
  }


  animateElement(): void {

    let _flipX: boolean;
    let _texture: string;
    let _scale: number;
    let _duration: number;
    let _delay: number;
    let _frames: Array<number>;
    let _frameRate: number;

    //una cosa molto statica, sulla base del livello aggiungo un elemento dell background che si muove nel background

    if (this._level == 0) {
      _texture = "girl";
      _frames = [0, 1, 2, 3];
      _frameRate = 3;
      _duration = 40000;
      _delay = Phaser.Math.Between(1000, 10000);
      _scale = 1;
      _flipX = true;

    } else if (this._level == 1) {
      _texture = "soccer";
      _frames = [0, 1, 2, 3, 4];
      _frameRate = 5;
      _duration = 35000;
      _delay = Phaser.Math.Between(1000, 10000);
      _scale = .75;
      _flipX = false;

    } else if (this._level == 2) {

      _texture = "couple";
      _frames = [0, 1, 2, 3];
      _frameRate = 3;
      _duration = 40000;
      _delay = Phaser.Math.Between(1000, 10000);
      _scale = 1;
      _flipX = true;

    }

    let _anim = this.add.sprite(-150, 630, _texture).setScale(_scale).setOrigin(.5, 1).setFlipX(_flipX);

    this._groupBelowAll.add(_anim);

    if (!this.anims.exists(_texture)) {
      this.anims.create({
        key: _texture,
        frames: this.anims.generateFrameNumbers(_texture, { frames: _frames }),
        frameRate: _frameRate,
        repeat: -1
      });
    }
    _anim.play(_texture);

    this.tweens.add({
      targets: _anim,
      delay: _delay,
      x: this._viewportWidth * 2 + 200,
      duration: _duration,
      ease: 'linear',
      yoyo: false,
      repeat: 0,

      onComplete: () => {
        this._groupAboveAll.remove(_anim, true, true);
        this.animateElement()
      }
    });


  }









}


