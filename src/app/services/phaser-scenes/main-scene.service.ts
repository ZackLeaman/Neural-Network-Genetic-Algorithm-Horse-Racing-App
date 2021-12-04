import { HorseModel } from 'src/app/models/horse.model';
import { HorseConstants } from 'src/app/models/horseConstants.model';
import { GenerationService } from '../genetic-algorithm/generation.service';
import { HorseService } from '../genetic-algorithm/horse.service';
import { TrackService } from '../track/track.service';

export class MainScene extends Phaser.Scene {
  trackService: TrackService = TrackService.getInstance();
  graphics: Phaser.GameObjects.Graphics;
  horseService: HorseService;
  generationService: GenerationService = new GenerationService();
  winningHorseIndex = 0;

  constructor() {
    super({ key: 'MainScene' });
  }

  create() {
    this.scene.launch('UIScene');

    this.graphics = this.add.graphics();

    this.trackService.createTrack();
    this.horseService = HorseService.getInstance();
    this.horseService.track = this.trackService.track;
    this.createHorses();
    this.startGenOne();
  }

  setPause(pause: boolean) {
    if (!pause) {
      this.scene.resume();
    } else {
      this.scene.pause();
    }
  }

  createHorses() {
    this.horseService.horses = [];
    const startPos = this.trackService.track.startPos;
    for (let i = 0; i < 10; i++) {
      const rays: Phaser.Geom.Line[] = [];
      const distance: number[] = [];
      for (let j = 0; j < 8; j++) {
        const ray = new Phaser.Geom.Line(
          startPos.x,
          startPos.y,
          startPos.x + 1000,
          startPos.y
        );
        rays.push(ray);
        distance.push(1000);
      }
      const horse = new HorseModel(
        i,
        this.physics.add.sprite(startPos.x, startPos.y, 'horse'),
        rays,
        distance
      );
      horse.sprite.setDisplayOrigin(35, 70);
      this.horseService.resetHorse(horse);
      this.createHorseMarker(horse);
      this.horseService.horses.push(horse);
    }

    this.createHorseAnims();
  }

  createHorseMarker(horse: HorseModel) {
    let numBackdrop = this.add.rectangle(0, 0, 20, 30, horse.color);
    let number = this.add.text(0, 0, horse.id.toString());
    let numGroup = this.add.group([numBackdrop, number]);
    numGroup.setXY(horse.sprite.x, horse.sprite.y - 50);
    numGroup.setDepth(1000);
    horse.numberGroup = numGroup;
  }

  createHorseAnims() {
    const horseSpriteAmt = HorseConstants.HORSE_TYPE_LENGTH;
    const leftStartIndex = 12;
    const animFrameAmt = 3;
    const spriteColAmt = 12;
    let start = leftStartIndex;

    for (let i = 0; i < horseSpriteAmt; i++) {
      start = leftStartIndex + (i % (horseSpriteAmt / 2)) * animFrameAmt;
      // Do a sprite jump to horse5 cause sprites dont need
      if (i >= horseSpriteAmt / 2) {
        start += spriteColAmt * 4;
      }
      let end = start + animFrameAmt - 1;

      this.createAnim('left'.concat(i.toString()), 'horse', start, end, 10, -1);

      this.createAnim(
        'right'.concat(i.toString()),
        'horse',
        start + spriteColAmt,
        end + spriteColAmt,
        10,
        -1
      );
    }
  }

  createAnim(
    key: string,
    spriteName: string,
    start: number,
    end: number,
    framerate: number,
    repeat: number
  ) {
    this.anims.create({
      key: key,
      frames: this.anims.generateFrameNumbers(spriteName, {
        start: start,
        end: end,
      }),
      frameRate: framerate,
      repeat: repeat,
    });
  }

  startGenOne() {
    this.generationService.createFirstGeneration();
    this.horseService.updateHorses();
    this.cameras.main.startFollow(this.horseService.horses[0].sprite);
  }

  preload() {
    this.load.spritesheet('horse', 'assets/horse.png', {
      frameWidth: 70,
      frameHeight: 70,
    });
  }

  restartRace() {
    this.horseService.resetHorses();
    this.cameras.main.startFollow(this.horseService.horses[0].sprite);
  }

  uploadHorses(json: string) {
    this.horseService.setHorsesFromJSON(json);
  }

  update() {
    // Draw Track
    this.graphics.clear();
    this.graphics.lineStyle(
      this.trackService.track.trackThickness,
      this.trackService.track.trackColor
    );
    this.trackService.track.trackPath.draw(this.graphics);
    this.graphics.fillStyle(this.trackService.track.trackColor);
    this.trackService.track.trackPoints.forEach((point) => {
      this.graphics.fillCircle(
        point.x,
        point.y,
        this.trackService.track.trackThickness / 2
      );
    });
    if (this.game.config.physics.arcade.debug) {
      this.graphics.fillStyle(0x0000ff);
      this.trackService.track.checkPoints.forEach((point) => {
        this.graphics.fillCircle(point.x, point.y, 50);
      });

      this.graphics.fillRect(
        this.trackService.track.finishPos.x1,
        this.trackService.track.finishPos.y1,
        20,
        this.trackService.track.finishPos.y2 -
          this.trackService.track.finishPos.y1
      );
    }

    // Draw outer/inner railings paths
    this.graphics.lineStyle(
      this.trackService.track.railingThickness,
      this.trackService.track.outerRailingColor
    );
    this.trackService.track.outerRailing.draw(this.graphics);
    this.graphics.lineStyle(
      this.trackService.track.railingThickness,
      this.trackService.track.innerRailingColor
    );
    this.trackService.track.innerRailing.draw(this.graphics);

    // draw finish line
    this.graphics.lineStyle(
      this.trackService.track.finishLineThickness,
      this.trackService.track.finishLineColor
    );
    this.graphics.strokeLineShape(this.trackService.track.finishLine);

    // show debug lines horse railing distances
    this.horseService.horses.forEach((horse) => {
      if (!horse.crashed) {
        if (this.game.config.physics.arcade.debug) {
          for (let i = 0; i < horse.distances.length; i++) {
            const ray = horse.rays[i];
            const dist = horse.distances[i];

            if (dist != undefined) {
              // only draw lines if debug and have dist
              if (Math.abs(dist) < this.trackService.track.crashDist) {
                // hit the wall dist
                this.graphics.lineStyle(1, 0xff0000);
              } else {
                // draw black line cause good dist
                this.graphics.lineStyle(1, 0x000000);
              }
              this.graphics.strokeLineShape(ray);
            }
          }
        }
      }
    });

    // process horse inputs and execute on their outputs
    let hasActiveHorses = this.generationService.processHorses();

    if (hasActiveHorses) {
      // game loop update horses
      this.horseService.updateHorses();

      this.updateResults();
    } else {
      this.generationService.raceFinished();
    }
  }

  updateResults() {
    let horsesOrdered = this.horseService.horses.slice();

    horsesOrdered.sort((a, b) => {
      if (a.lap < b.lap) {
        return 1;
      } else if (a.lap > b.lap) {
        return -1;
      } else if (a.checkpointIndex < b.checkpointIndex) {
        return 1;
      } else if (a.checkpointIndex > b.checkpointIndex) {
        return -1;
      } else if (a.finishedRace && a.timer < b.timer) {
        return -1;
      } else if (a.finishedRace && a.timer > b.timer) {
        return 1;
      } else if (a.distToNextCheckpoint < b.distToNextCheckpoint) {
        return -1;
      } else if (a.distToNextCheckpoint > b.distToNextCheckpoint) {
        return 1;
      }

      return 0;
    });

    // Set camera follow
    if (this.winningHorseIndex != horsesOrdered[0].id) {
      this.winningHorseIndex = horsesOrdered[0].id;
      this.cameras.main.startFollow(
        this.horseService.horses[this.winningHorseIndex].sprite
      );
    }

    let results: string[] = [];

    horsesOrdered.forEach((horse) => {
      let horseStr = horse.name
        .concat(' ')
        .concat(horse.id.toString())
        .concat('  Time: ')
        .concat(Math.floor(horse.timer / 60).toString())
        .concat('  Lap: ')
        .concat(horse.lap < 0 ? '0' : horse.lap.toString());

      if (horse.crashed) {
        horseStr = horseStr.concat(' DNF');
      } else if (horse.finishedRace) {
        horseStr = horseStr.concat(' FINISHED');
      }

      results.push(horseStr);
    });

    this.events.emit('updateResults', results);
  }
}
