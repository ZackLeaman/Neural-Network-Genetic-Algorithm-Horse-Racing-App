import { TrackModel } from 'src/app/models/track.model';
import { MathService } from '../utils/math.service';

export class TrackService {
  private static instance: TrackService;
  track: TrackModel;

  private constructor() {}

  public static getInstance(): TrackService {
    if (!TrackService.instance) {
      TrackService.instance = new TrackService();
    }

    return TrackService.instance;
  }

  createTrack(
    trackPoints?: [{ x: number; y: number }],
    checkPoints?: [{ x: number; y: number }],
    finishPos?: { x1: number; y1: number; x2: number; y2: number },
    trackLaps?: number,
    startPos?: { x: number; y: number }
  ) {
    this.track = new TrackModel(
      trackPoints,
      checkPoints,
      finishPos,
      trackLaps,
      startPos
    );

    this.createTrackPath(this.track);
  }

  createTrackPath(track: TrackModel) {
    // Create Track
    track.trackPath = new Phaser.Curves.Path(
      track.trackPoints[0].x,
      track.trackPoints[0].y
    );
    for (let p = 1; p < track.trackPoints.length; p++) {
      const point = track.trackPoints[p];
      track.trackPath.lineTo(point.x, point.y);
    }
    track.trackPath.lineTo(track.trackPoints[0].x, track.trackPoints[0].y);

    // Create Start Line
    track.finishLine = new Phaser.Geom.Line(
      track.finishPos.x1,
      track.finishPos.y1,
      track.finishPos.x2,
      track.finishPos.y2
    );

    // Add track borders
    let outerPoints = [];
    let innerPoints = [];
    for (let p = 0; p < track.trackPoints.length; p++) {
      const prevPoint =
        p == 0
          ? track.trackPoints[track.trackPoints.length - 1]
          : track.trackPoints[p - 1];
      const point = track.trackPoints[p];
      const nextPoint =
        p == track.trackPoints.length - 1
          ? track.trackPoints[0]
          : track.trackPoints[p + 1];

      const line1: Phaser.Geom.Line = new Phaser.Geom.Line(
        prevPoint.x,
        prevPoint.y,
        point.x,
        point.y
      );
      const line2: Phaser.Geom.Line = new Phaser.Geom.Line(
        point.x,
        point.y,
        nextPoint.x,
        nextPoint.y
      );
      const norm1: Phaser.Geom.Point = Phaser.Geom.Line.GetNormal(line1);
      const norm2: Phaser.Geom.Point = Phaser.Geom.Line.GetNormal(line2);
      const oPoint1 = new Phaser.Geom.Point(
        line1.x2 + norm1.x * (track.trackThickness / 2),
        line1.y2 + norm1.y * (track.trackThickness / 2)
      );
      const iPoint1 = new Phaser.Geom.Point(
        line1.x2 + norm1.x * (-track.trackThickness / 2),
        line1.y2 + norm1.y * (-track.trackThickness / 2)
      );
      const oPoint2 = new Phaser.Geom.Point(
        line2.x1 + norm2.x * (track.trackThickness / 2),
        line2.y1 + norm2.y * (track.trackThickness / 2)
      );
      const iPoint2 = new Phaser.Geom.Point(
        line2.x1 + norm2.x * (-track.trackThickness / 2),
        line2.y1 + norm2.y * (-track.trackThickness / 2)
      );
      // average perp points together cause don't know which order to go in for line creation
      const oPoint = new Phaser.Geom.Point(
        (oPoint1.x + oPoint2.x) / 2,
        (oPoint1.y + oPoint2.y) / 2
      );
      const iPoint = new Phaser.Geom.Point(
        (iPoint1.x + iPoint2.x) / 2,
        (iPoint1.y + iPoint2.y) / 2
      );
      outerPoints.push(oPoint);
      innerPoints.push(iPoint);
    }

    // Create Outer Path Track
    track.outerRailing = new Phaser.Curves.Path(
      outerPoints[0].x,
      outerPoints[0].y
    );
    for (let p = 1; p < outerPoints.length; p++) {
      const point = outerPoints[p];
      track.outerRailing.lineTo(point.x, point.y);
    }
    track.outerRailing.lineTo(outerPoints[0].x, outerPoints[0].y);

    // Create Inner Path Track
    track.innerRailing = new Phaser.Curves.Path(
      innerPoints[0].x,
      innerPoints[0].y
    );
    for (let p = 1; p < innerPoints.length; p++) {
      const point = innerPoints[p];
      track.innerRailing.lineTo(point.x, point.y);
    }
    track.innerRailing.lineTo(innerPoints[0].x, innerPoints[0].y);
  }
}
