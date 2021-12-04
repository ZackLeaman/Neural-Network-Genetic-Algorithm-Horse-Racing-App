export class TrackModel {
  trackPath: Phaser.Curves.Path;
  outerRailing: Phaser.Curves.Path;
  innerRailing: Phaser.Curves.Path;
  finishLine: Phaser.Geom.Line;
  outerRailingColor = 0xffaaaa;
  innerRailingColor = 0xaaaaff;
  railingThickness = 10;
  finishLineColor = 0xffffff;
  finishLineThickness = 5;
  trackThickness = 100;
  trackColor = 0xffddaa;
  trackLaps = 3;
  crashDist = 0.015;
  checkPointColDistSqr = 2500;
  trackPoints = [
    { x: 600, y: 50 },
    { x: 700, y: 100 },
    { x: 750, y: 200 },
    { x: 750, y: 300 },
    { x: 700, y: 400 },
    { x: 600, y: 450 },
    { x: 50, y: 450 },
    { x: -50, y: 400 },
    { x: -100, y: 300 },
    { x: -100, y: 200 },
    { x: -50, y: 100 },
    { x: 50, y: 50 },
  ];
  checkPoints = this.trackPoints;
  finishPos = {
    x1:
      (this.trackPoints[0].x -
        this.trackPoints[this.trackPoints.length - 1].x) *
      0.9,
    y1: this.trackPoints[0].y - this.trackThickness / 2,
    x2:
      (this.trackPoints[0].x -
        this.trackPoints[this.trackPoints.length - 1].x) *
      0.9,
    y2: this.trackPoints[0].y + this.trackThickness / 2,
  };
  startPos = { x: 435, y: 50 };

  constructor(
    _trackPoints?: [{ x: number; y: number }],
    _checkPoints?: [{ x: number; y: number }],
    _finishPos?: { x1: number; y1: number; x2: number; y2: number },
    _trackLaps?: number,
    _startPos?: { x: number; y: number }
  ) {
    if (_trackPoints != undefined) {
      this.trackPoints = _trackPoints;
    }
    if (_checkPoints != undefined) {
      this.checkPoints = _checkPoints;
    }
    if (_finishPos != undefined) {
      this.finishPos = _finishPos;
    }
    if (_trackLaps != undefined) {
      this.trackLaps = _trackLaps;
    }
    if (_startPos != undefined) {
      this.startPos = _startPos;
    }
  }
}
