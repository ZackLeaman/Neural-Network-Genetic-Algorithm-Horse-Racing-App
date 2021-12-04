import { HorseModel } from 'src/app/models/horse.model';
import { TrackModel } from 'src/app/models/track.model';
import { MathService } from './math.service';

export class UtilsService {
  static getRailingIntersect(
    line: Phaser.Geom.Line,
    outerRailing: Phaser.Curves.Path,
    innerRailing: Phaser.Curves.Path
  ): number {
    let outerClosestPoint = Phaser.Geom.Intersects.GetLineToPoints(
      line,
      outerRailing.getPoints()
    );
    let innerClosestPoint = Phaser.Geom.Intersects.GetLineToPoints(
      line,
      innerRailing.getPoints()
    );

    if (outerClosestPoint && innerClosestPoint) {
      if (outerClosestPoint.z > innerClosestPoint.z) {
        line.x2 = innerClosestPoint.x;
        line.y2 = innerClosestPoint.y;
        return innerClosestPoint.z;
      } else {
        line.x2 = outerClosestPoint.x;
        line.y2 = outerClosestPoint.y;
        return outerClosestPoint.z;
      }
    } else if (outerClosestPoint) {
      line.x2 = outerClosestPoint.x;
      line.y2 = outerClosestPoint.y;
      return outerClosestPoint.z;
    } else if (innerClosestPoint) {
      line.x2 = innerClosestPoint.x;
      line.y2 = innerClosestPoint.y;
      return innerClosestPoint.z;
    }

    return 1;
  }

  static isCheckPointIntersect(
    x: number,
    y: number,
    checkIndex: number,
    track: TrackModel
  ): boolean {
    if (checkIndex >= 0 && checkIndex < track.checkPoints.length) {
      const distSqr = MathService.getPointDistSqr(
        x,
        y,
        track.checkPoints[checkIndex].x,
        track.checkPoints[checkIndex].y
      );
      if (distSqr <= track.checkPointColDistSqr) {
        return true;
      }
    }

    return false;
  }

  static isHorseCollidingFinish(track: TrackModel, horse: HorseModel): boolean {
    return (
      horse.sprite.x >= track.finishPos.x1 &&
      horse.sprite.x <= track.finishPos.x2 + 20 &&
      horse.sprite.y >= track.finishPos.y1 &&
      horse.sprite.y <= track.finishPos.y2
    );
  }
}
