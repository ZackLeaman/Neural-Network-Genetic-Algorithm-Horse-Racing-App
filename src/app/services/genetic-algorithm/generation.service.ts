import { OutputTypes } from 'src/app/enums/output-types.enums';
import { HorseModel } from 'src/app/models/horse.model';
import { NeuralNetwork } from '../deep-learning/neural-network.service';
import { TrackService } from '../track/track.service';
import { HorseService } from './horse.service';

export class GenerationService {
  horseService: HorseService = HorseService.getInstance();
  curGeneration = 1;
  paramDefault = 1;
  paramSwapProb = 0.5;
  mutateProb = 0.4;
  mutateAmount = 2;
  defaultNetworkStructure = [8, 8, 8, 3]; // 8 inputs angular ray distances and 4 outputs drive, brake, turn left/right
  fitHorses: HorseModel[] = [];

  constructor() {}

  createFirstGeneration() {
    for (let i = 0; i < this.horseService.horses.length; i++) {
      const horse = this.horseService.horses[i];
      horse.id = i;
      this.horseService.resetHorse(horse);

      horse.neuralNetwork = new NeuralNetwork(this.defaultNetworkStructure);
      let params: number[] = horse.neuralNetwork.setRandomWeights(
        -this.paramDefault,
        this.paramDefault
      );
      horse.dna.dnaParams = params;
      horse.dna.fitness = 0;
    }
  }

  processHorses(): boolean {
    let hasActiveHorse = false;
    this.horseService.horses.forEach((horse) => {
      if (!horse.finishedRace && !horse.crashed) {
        hasActiveHorse = true;
        if (horse.distances != undefined && horse.neuralNetwork != undefined) {
          let outputs: number[] = horse.neuralNetwork.calculateInputs(
            horse.distances
          );
          this.executeHorseActions(horse.id, outputs);
        }
      }
    });

    return hasActiveHorse;
  }

  executeHorseActions(horseId: number, outputs: number[]) {
    if (outputs == undefined) {
      return;
    }

    for (let i = 0; i < outputs.length; i++) {
      const output = outputs[i];
      if (output >= 0.5) {
        switch (i) {
          case OutputTypes.Drive:
            this.horseService.driveHorse(horseId);
            break;
          case OutputTypes.TurnLeft:
            this.horseService.turnHorseLeft(horseId);
            break;
          case OutputTypes.TurnRight:
            this.horseService.turnHorseRight(horseId);
            break;
          case OutputTypes.Reverse:
            this.horseService.reverseHorse(horseId);
            break;
          default:
            break;
        }
      }
    }
  }

  raceFinished() {
    // Evaluate horses
    const track = TrackService.getInstance().track;
    const totalLaps = track.trackLaps;
    const totalCheckpoints = track.checkPoints.length;

    // make evaluations
    let horseEvals = [];
    const evalOffset = totalCheckpoints + 1;
    const totalEval = totalLaps * totalCheckpoints + evalOffset;
    this.horseService.horses.forEach((horse) => {
      let horseEval =
        horse.lap * totalCheckpoints + horse.checkpointIndex + evalOffset; // +lap so not negative

      horseEval = horseEval / totalEval; // put eval in range of 0-1 with 1 being completed track
      horseEvals.push(horseEval);
    });

    // make fitnesses and find highest fit horses to breed
    const avgFit = this.calculateAvgFitness(horseEvals);
    for (let i = 0; i < horseEvals.length; i++) {
      const e = horseEvals[i];
      const fit = e / avgFit;
      const horse = this.horseService.horses[i];
      horse.dna.fitness = fit;
    }

    this.fitHorses = this.getFittestHorses(3);

    // evolve to next gen
    this.evolveToNextGeneration(this.fitHorses);

    // reset horses
    this.horseService.horses.forEach((horse) => {
      this.horseService.resetHorse(horse);
    });
  }

  getFittestHorses(amount: number): HorseModel[] {
    let horses = this.horseService.horses.slice();
    horses.sort((a, b) => {
      if (
        a.dna.fitness > b.dna.fitness ||
        (a.finishedRace && !b.finishedRace) ||
        (a.finishedRace && b.finishedRace && a.timer < b.timer)
      ) {
        return -1;
      } else if (
        a.dna.fitness < b.dna.fitness ||
        (!a.finishedRace && b.finishedRace) ||
        (a.finishedRace && b.finishedRace && a.timer > b.timer)
      ) {
        return 1;
      }

      return 0;
    });

    // only return the fittest horses asked for
    horses = horses.splice(0, amount);

    return horses;
  }

  calculateAvgFitness(evals: number[]): number {
    let totalEval = 0;
    evals.forEach((e) => {
      totalEval += e;
    });

    let average = totalEval / evals.length;

    return average;
  }

  evolveToNextGeneration(parentHorses: HorseModel[]) {
    this.horseService.horses.forEach((horse) => {
      // make sure this is not a parent we want to keep
      let isHorseParent = false;
      parentHorses.forEach((parentHorse) => {
        if (horse.id == parentHorse.id) {
          isHorseParent = true;
        }
      });

      // not a parent so make new child
      if (!isHorseParent) {
        let dadIndex = 0;
        let momIndex = 1;

        // if more parents then randomly pick two different ones
        if (parentHorses.length > 2) {
          dadIndex = Math.floor(Math.random() * (parentHorses.length - 1));
          momIndex = dadIndex;
          while (dadIndex == momIndex) {
            momIndex = Math.floor(Math.random() * (parentHorses.length - 1));
          }
        }

        const dad: HorseModel = parentHorses[dadIndex];
        const mom: HorseModel = parentHorses[momIndex];

        horse.dna.dnaParams = this.createChild(dad, mom);
        this.setMutations(horse);
        horse.dna.fitness = 0;
        horse.neuralNetwork.load(horse.dna.dnaParams);

        // Set random sprite look params for new child
        horse.name = this.horseService.getRandomName();
        horse.color = this.horseService.getRandomColor();
        horse.type = this.horseService.getRandomType();
        this.horseService.changeMarkerColor(horse);
      }
    });
  }

  createChild(parent1: HorseModel, parent2: HorseModel): number[] {
    let newParams = [];

    for (let i = 0; i < parent1.dna.dnaParams.length; i++) {
      const p1Param = parent1.dna.dnaParams[i];
      const p2Param = parent2.dna.dnaParams[i];

      if (Math.random() >= this.paramSwapProb) {
        newParams.push(p2Param);
      } else {
        newParams.push(p1Param);
      }
    }

    return newParams;
  }

  setMutations(horse: HorseModel) {
    for (let i = 0; i < horse.dna.dnaParams.length; i++) {
      if (Math.random() <= this.mutateProb) {
        horse.dna.dnaParams[i] =
          Math.random() * (this.mutateAmount * 2) - this.mutateAmount;
      }
    }

    return;
  }
}
