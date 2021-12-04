export class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene' });
  }

  preload() {
    this.load.image('results', 'assets/results.png');
  }

  create() {
    this.add.sprite(150, 112, 'results');
    const resultsTitle = this.add.text(25, 21, 'RESULTS', {
      font: '16px Arial',
      color: '#000',
    });
    const results = this.add.text(12, 55, '', {
      font: '14px Arial',
      color: '#000',
    });

    const mainGame = this.scene.get('MainScene');
    mainGame.events.on('updateResults', (resultsStr: string[]) => {
      results.text = '';
      for (let i = 0; i < resultsStr.length; i++) {
        const str = resultsStr[i];
        results.text = results.text
          .concat((i + 1).toString())
          .concat(' - ')
          .concat(str)
          .concat('\n');
      }
    });
  }
}
