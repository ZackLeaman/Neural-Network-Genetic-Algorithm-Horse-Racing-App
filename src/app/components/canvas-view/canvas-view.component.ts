import { Component, OnInit } from '@angular/core';
import * as Phaser from 'phaser';
import { SavedHorseModel } from 'src/app/models/savedHorses.model';
import { HorseService } from 'src/app/services/genetic-algorithm/horse.service';
import { MainScene } from 'src/app/services/phaser-scenes/main-scene.service';
import { UIScene } from 'src/app/services/phaser-scenes/ui-scene.service';

@Component({
  selector: 'app-canvas-view',
  templateUrl: './canvas-view.component.html',
  styleUrls: ['./canvas-view.component.css'],
})
export class CanvasViewComponent implements OnInit {
  phaserGame: Phaser.Game;
  config: Phaser.Types.Core.GameConfig;
  jsonHorses = '';
  isPaused = false;
  mainScene: MainScene;

  constructor() {
    this.config = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      scene: [MainScene, UIScene],
      parent: 'gameContainer',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
          debug: false,
        },
      },
      backgroundColor: '#005000',
    };
  }

  ngOnInit() {
    this.phaserGame = new Phaser.Game(this.config);
  }

  getMainScene(): Phaser.Scene {
    this.phaserGame.scene.scenes.forEach((scene) => {
      if (scene instanceof MainScene) {
        this.mainScene = scene;
      }
    });

    return this.mainScene;
  }

  jsonCurrentHorses() {
    this.jsonHorses = '';
    let objs = [];
    HorseService.getInstance().horses.forEach((horse) => {
      objs.push(horse.serialize());
    });
    this.jsonHorses = JSON.stringify(objs);
  }

  uploadJsonHorses() {
    this.isPaused = true;

    if (this.mainScene == undefined) {
      this.getMainScene();
    }

    this.mainScene.setPause(this.isPaused);
    this.mainScene.uploadHorses(this.jsonHorses);
    this.mainScene.restartRace();

    this.jsonHorses = '';
  }

  uploadExpertHorses() {
    this.isPaused = true;

    if (this.mainScene == undefined) {
      this.getMainScene();
    }

    this.mainScene.setPause(this.isPaused);
    this.mainScene.uploadHorses(JSON.stringify(SavedHorseModel.ExpertHorses));
    this.mainScene.restartRace();
  }

  pausePressed() {
    this.isPaused = !this.isPaused;

    if (this.mainScene == undefined) {
      this.getMainScene();
    }

    this.mainScene.setPause(this.isPaused);
  }
}
