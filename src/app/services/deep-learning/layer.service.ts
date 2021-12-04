export class LayerService {
  weights: number[][] = [];

  constructor(public nodeAmt: number, public outputAmt: number) {
    // set weights [nodeAmt+1][outputAmt] +1 for bias
    for (let i = 0; i < nodeAmt + 1; i++) {
      this.weights[i] = [];
      for (let j = 0; j < outputAmt; j++) {
        this.weights[i][j] = 0;
      }
    }
  }

  randomizeWeights(min: number, max: number): number[] {
    let params: number[] = [];
    for (let i = 0; i < this.weights.length; i++) {
      const nextWeights = this.weights[i];
      for (let j = 0; j < nextWeights.length; j++) {
        this.weights[i][j] = min + Math.random() * Math.abs(max - min);
        params.push(this.weights[i][j]);
      }
    }

    return params;
  }

  setWeights(weights: number[][]): boolean {
    if (this.weights.length != weights.length) {
      return false;
    }

    for (let i = 0; i < this.weights.length; i++) {
      const nextWeights: number[] = this.weights[i];

      if (this.weights[i].length != nextWeights.length) {
        return false;
      }
    }

    // if got here we know that all lengths are correct and can set weights
    this.weights = weights;
    return true;
  }
  counter = 0;
  takeInputs(inputs: number[]): number[] {
    if (inputs == undefined) {
      return [];
    }

    let outputs: number[] = [];
    for (let j = 0; j < this.outputAmt; j++) {
      outputs[j] = 0;
    }

    if (inputs.length != this.nodeAmt) {
      return outputs; // FAIL
    }

    let biases: number[] = [];
    for (let i = 0; i < this.nodeAmt; i++) {
      biases.push(inputs[i] == undefined ? 1 : inputs[i]);
    }
    biases.push(1); // push last bias of 1

    // sum up the biases * weights
    for (let i = 0; i < this.weights.length; i++) {
      for (let j = 0; j < this.weights[i].length; j++) {
        outputs[j] += biases[i] * this.weights[i][j];
      }
    }

    // Sigmoid Function
    for (let i = 0; i < outputs.length; i++) {
      outputs[i] = this.sigmoidFunction(outputs[i]);
    }

    this.counter++;

    return outputs;
  }

  sigmoidFunction(input: number) {
    let output = 1 / (1 + Math.exp(-input));

    return output;
  }

  copyLayer(): LayerService {
    let copyLayer: LayerService = new LayerService(
      this.nodeAmt,
      this.outputAmt
    );

    copyLayer.setWeights(this.weights);

    return copyLayer;
  }
}
