import { NeuralNetwork } from '../services/deep-learning/neural-network.service';
import { HorseService } from '../services/genetic-algorithm/horse.service';
import { DNAModel } from './dna.model';

export interface HorseInterface {
  id: number;
  name: string;
  type: number;
  color: number;
  dnaParams: number[];
}

export class HorseModel {
  name = '';
  color = 0xff0000;
  distTraveled = 0;
  lap = -1;
  checkpointIndex = -1;
  checkpointCounter = 0;
  crashed = false;
  lapTimer = 0;
  rotation = 0;
  turnRotation = 0;
  speed = 0;
  timer = 0;
  finishedRace = false;
  dna: DNAModel = new DNAModel();
  neuralNetwork: NeuralNetwork;
  numberGroup: Phaser.GameObjects.Group;
  type = 0;
  distToNextCheckpoint = 0;

  constructor(
    public id: number,
    public sprite: Phaser.Physics.Arcade.Sprite,
    public rays: Phaser.Geom.Line[],
    public distances: number[],
    public _color?: number
  ) {
    if (_color) {
      this.color = _color;
    } else {
      this.color = HorseService.getInstance().getRandomColor();
    }

    this.name = HorseService.getInstance().getRandomName();
    this.type = HorseService.getInstance().getRandomType();
  }

  toJSON() {
    return JSON.stringify(this.serialize());
  }

  serialize(): HorseInterface {
    return {
      id: this.id,
      name: this.name,
      color: this.color,
      type: this.type,
      dnaParams: this.dna.dnaParams,
    };
  }
}
