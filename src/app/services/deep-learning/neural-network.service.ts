import { LayerService } from './layer.service';

export class NeuralNetwork {
  layers: LayerService[] = [];
  weightAmt: number = 0;

  constructor(public nodeAmts: number[]) {
    this.createNetwork();
  }

  createNetwork() {
    for (let i = 0; i < this.nodeAmts.length - 1; i++) {
      this.weightAmt += (this.nodeAmts[i] + 1) * this.nodeAmts[i + 1];
      this.layers[i] = new LayerService(this.nodeAmts[i], this.nodeAmts[i + 1]);
    }
  }

  calculateInputs(inputs: number[]): number[] {
    if (inputs.length != this.layers[0].nodeAmt) {
      return [];
    }

    let outputs: number[] = inputs;
    this.layers.forEach((layer) => {
      outputs = layer.takeInputs(outputs);
    });

    return outputs;
  }

  setRandomWeights(min: number, max: number): number[] {
    let params: number[] = [];
    this.layers.forEach((layer) => {
      let layerParams: number[] = layer.randomizeWeights(min, max);
      layerParams.forEach((param) => {
        params.push(param);
      });
    });

    return params;
  }

  copyNeuralNetwork(): NeuralNetwork {
    let copyNet = new NeuralNetwork(this.nodeAmts);
    for (let i = 0; i < copyNet.layers.length; i++) {
      const layer = copyNet.layers[i];
      layer.setWeights(this.layers[i].weights);
    }

    return copyNet;
  }

  getParams(): number[] {
    let params: number[] = [];
    for (let l = 0; l < this.layers.length; l++) {
      const layer = this.layers[l];
      for (let i = 0; i < layer.weights.length; i++) {
        const layerPrevWeights = layer.weights[i];
        for (let j = 0; j < layerPrevWeights.length; j++) {
          params.push(layer.weights[i][j]);
        }
      }
    }

    return params;
  }

  load(params: number[]) {
    this.layers = [];
    this.weightAmt = 0;

    this.createNetwork();

    let paramCounter = 0;
    for (let l = 0; l < this.layers.length; l++) {
      const layer = this.layers[l];
      for (let i = 0; i < layer.weights.length; i++) {
        const layerPrevWeights = layer.weights[i];
        for (let j = 0; j < layerPrevWeights.length; j++) {
          layer.weights[i][j] = params[paramCounter++];
        }
      }
    }
  }
}
