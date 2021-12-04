import { HorseInterface, HorseModel } from 'src/app/models/horse.model';
import { HorseConstants } from 'src/app/models/horseConstants.model';
import { TrackModel } from 'src/app/models/track.model';
import { TrackService } from '../track/track.service';
import { UtilsService } from '../utils/utils.service';

export class HorseService {
  private static instance: HorseService;
  horses: HorseModel[] = [];
  accel = 40;
  turnRot = 0.01;
  maxSpeed = 200;
  maxRot = 0.1;
  decel = this.accel / 4;
  centerRot = this.turnRot / 2;
  track = TrackService.getInstance().track;
  horseTimeout = 500;

  private constructor() {}

  public static getInstance(): HorseService {
    if (!HorseService.instance) {
      HorseService.instance = new HorseService();
    }

    return HorseService.instance;
  }

  resetHorse(horse: HorseModel) {
    horse.crashed = false;
    horse.finishedRace = false;
    horse.distTraveled = 0;
    horse.speed = 0;
    horse.timer = 0;
    horse.lapTimer = 0;
    horse.lap = -1;
    horse.checkpointIndex = -1;
    horse.distances = [];
    horse.sprite.x = this.track.startPos.x;
    horse.sprite.y = this.track.startPos.y;
    horse.sprite.rotation = 0;
    horse.sprite.setScale(0.8);
    horse.sprite.setDepth(100);
    horse.rotation = Math.PI / 2;
    horse.turnRotation = 0;
    horse.sprite.setVelocity(0, 0);
    horse.distances = [];
    horse.checkpointCounter = 0;
    horse.sprite.flipX = false;
    horse.sprite.flipY = false;
    horse.sprite.setDisplayOrigin(35, 70);
    if (horse.numberGroup) {
      horse.numberGroup.setXY(horse.sprite.x, horse.sprite.y - 70);
    }
  }

  resetHorses() {
    this.horses.forEach((horse) => {
      this.resetHorse(horse);
    });
  }

  driveHorse(id: number) {
    this.moveHorse(id, 1);
  }

  reverseHorse(id: number) {
    this.moveHorse(id, -1);
  }

  turnHorseLeft(id: number) {
    this.turnHorse(id, -1);
  }

  turnHorseRight(id: number) {
    this.turnHorse(id, 1);
  }

  moveHorse(id: number, dir: number) {
    const horse = this.horses[id];
    horse.speed += this.accel * dir;
    const maxCheck =
      dir != 1 ? horse.speed < -this.maxSpeed : horse.speed > this.maxSpeed;
    if (maxCheck) {
      horse.speed = this.maxSpeed * dir;
    }
  }

  turnHorse(id: number, dir: number) {
    const horse = this.horses[id];
    horse.turnRotation += this.turnRot * dir;
    const maxCheck =
      dir != 1
        ? horse.turnRotation < -this.turnRot
        : horse.turnRotation > this.turnRot;
    if (maxCheck) {
      horse.turnRotation = this.turnRot * dir;
    }
  }

  decelHorse(id: number) {
    const horse = this.horses[id];
    if (horse.speed != 0) {
      let decel = horse.speed > 0 ? this.decel : -this.decel;
      horse.speed -= decel;
    }
    if (horse.turnRotation != 0) {
      let centerRot = horse.turnRotation > 0 ? this.centerRot : -this.centerRot;
      horse.turnRotation -= centerRot;
    }
  }

  updateHorses(): number {
    let maxEval = 0;
    let maxDist = 0;
    let firstPlaceIndex = -1;
    const halfPI = Math.PI / 2;

    for (let i = 0; i < this.horses.length; i++) {
      const horse = this.horses[i];
      const sprite = horse.sprite;

      // animate horse
      if (sprite.rotation >= -halfPI && sprite.rotation <= halfPI) {
        horse.sprite.anims.play('right'.concat(horse.type.toString()), true);
        horse.sprite.flipX = false;
        horse.sprite.flipY = false;
        horse.sprite.setDisplayOrigin(35, 70);
      } else {
        horse.sprite.anims.play('left'.concat(horse.type.toString()), true);
        horse.sprite.flipX = true;
        horse.sprite.flipY = true;
        horse.sprite.setDisplayOrigin(35, 0);
      }

      // move num group
      horse.numberGroup.setXY(horse.sprite.x, horse.sprite.y - 70);

      // only move if not crashed or did not finish
      if (!horse.crashed && !horse.finishedRace) {
        // increment horse time
        horse.timer += 1;

        // has horse timed out cause did not hit checkpoint in time?
        if (horse.checkpointCounter++ >= this.horseTimeout) {
          horse.crashed = true;
          continue;
        }

        horse.rotation += horse.turnRotation;
        sprite.rotation = horse.rotation - Math.PI / 2;
        if (sprite.rotation <= -Math.PI) {
          sprite.rotation = Math.PI;
        }

        sprite.setVelocityX(Math.sin(horse.rotation) * horse.speed);
        sprite.setVelocityY(-Math.cos(horse.rotation) * horse.speed);

        if (horse.speed > 0) {
          // add to horse distance
          horse.distTraveled += Math.abs(horse.speed);
          let nextCheckpointIndex = horse.checkpointIndex + 1;
          if (this.track.checkPoints.length <= nextCheckpointIndex) {
            nextCheckpointIndex = 0;
          }
          if (
            nextCheckpointIndex >= 0 &&
            nextCheckpointIndex < this.track.checkPoints.length
          ) {
            horse.distToNextCheckpoint = Phaser.Math.Distance.Between(
              horse.sprite.x,
              horse.sprite.y,
              this.track.checkPoints[nextCheckpointIndex].x,
              this.track.checkPoints[nextCheckpointIndex].y
            );
          }

          // decrease lap timer that's used to prohibit laps occuring too soon
          // ai might get smart and go back and forth over finish line
          if (horse.lapTimer > 0) {
            horse.lapTimer -= 1;
          }

          // is this the max distance horse?
          let horseEval = horse.lap * (horse.checkpointIndex + 1);
          if (horseEval > maxEval) {
            maxEval = horseEval;
            maxDist = horse.distTraveled;
            firstPlaceIndex = i;
          } else if (
            horseEval == maxEval &&
            horse.distToNextCheckpoint < maxDist
          ) {
            maxDist = horse.distToNextCheckpoint;
            firstPlaceIndex = i;
          }

          this.decelHorse(horse.id);

          this.setRays(horse);
        }

        // check if hit checkpoint
        this.checkHorseCheckpoint(horse, this.track);
        // check if crashed
        this.checkHorseCrash(horse, this.track);
        // check if finished
        this.checkHorseFinishes(horse, this.track);
      } else {
        sprite.setVelocity(0, 0);
        horse.speed = 0;
      }
    }

    return firstPlaceIndex;
  }

  checkHorseFinishes(horse: HorseModel, track: TrackModel) {
    // is this horse in bounding box of finish line and
    // lap timer has finished allowing them to execute a lap?
    if (
      UtilsService.isHorseCollidingFinish(track, horse) &&
      horse.lapTimer <= 0
    ) {
      horse.lap += 1;
      horse.lapTimer = 200;

      // TODO check if this breaks eval
      horse.checkpointIndex = -1;

      if (horse.lap >= track.trackLaps) {
        horse.finishedRace = true;
      }
    }
  }

  checkHorseCheckpoint(horse: HorseModel, track: TrackModel) {
    let nextCheckpointIndex = horse.checkpointIndex + 1;
    if (track.checkPoints.length <= nextCheckpointIndex) {
      nextCheckpointIndex = 0;
    }
    if (
      UtilsService.isCheckPointIntersect(
        horse.sprite.x,
        horse.sprite.y,
        nextCheckpointIndex,
        track
      )
    ) {
      horse.checkpointCounter = 0;
      horse.distToNextCheckpoint = 10000;
      horse.checkpointIndex = nextCheckpointIndex;
    }
  }

  checkHorseCrash(horse: HorseModel, track: TrackModel) {
    for (let i = 0; i < horse.rays.length; i++) {
      const ray = horse.rays[i];
      let dist = UtilsService.getRailingIntersect(
        ray,
        track.outerRailing,
        track.innerRailing
      );
      if (dist) {
        horse.distances[i] = dist;
        // did the horse crash?
        if (Math.abs(dist) < track.crashDist) {
          horse.crashed = true;
        }
      }
    }
  }

  setRays(horse: HorseModel) {
    for (let i = 0; i < horse.rays.length; i++) {
      const ray = horse.rays[i];
      ray.x1 = horse.sprite.x;
      ray.y1 = horse.sprite.y;
      const ang = horse.sprite.rotation - (Math.PI / 4) * i;
      ray.x2 = horse.sprite.x + Math.cos(ang) * 1000;
      ray.y2 = horse.sprite.y + Math.sin(ang) * 1000;
    }
  }

  changeMarkerColor(horse: HorseModel) {
    horse.numberGroup.getChildren().forEach((element) => {
      if (element instanceof Phaser.GameObjects.Rectangle) {
        element.fillColor = horse.color;
        return;
      }
    });
  }

  getRandomName(): string {
    let index = Math.floor(
      Math.random() * (HorseConstants.HORSE_NAMES.length - 1)
    );

    return HorseConstants.HORSE_NAMES[index];
  }

  getRandomColor(): number {
    let index = Math.floor(
      Math.random() * (HorseConstants.HORSE_COLORS.length - 1)
    );
    return HorseConstants.HORSE_COLORS[index];
  }

  getRandomType(): number {
    let index = Math.floor(
      Math.random() * (HorseConstants.HORSE_TYPE_LENGTH - 1)
    );
    return index;
  }

  setHorsesFromJSON(json: string) {
    let jsonObj: HorseInterface[] = JSON.parse(json);

    console.log('Uploading Horses:');
    jsonObj.forEach((obj) => {
      console.log(obj);

      if (obj.id < this.horses.length && obj.id >= 0) {
        const horse = this.horses[obj.id];
        horse.color = obj.color;
        horse.type = obj.type;
        horse.name = obj.name;
        horse.dna.dnaParams = obj.dnaParams;

        horse.neuralNetwork.load(horse.dna.dnaParams);
        this.changeMarkerColor(horse);
      }
    });
  }
}
