# Neural Networks, Genetic Algorithms, and Horses

![Horse Race](https://media.giphy.com/media/WQdj0OFrMEl8TkzZZ6/giphy.gif)

[Click here to view on GitHub Pages](https://zackleaman.github.io/)

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 13.0.3. It is created as a demonstration of Genetic Algorithms and Neural Networks. A horse race is the theme where the top 3 fittest horses birth the next generation with the chance of mutations. The top 3 fittest horses also participate in the next race for fitness comparison with their children. This project uses the Angular Framework in unison with [Phaser 3](https://phaser.io/) to create game states as well as a visual representation of the horses learning to be better racers. Currently, there is no traditional means of saving horses for future use, but one can get the current horses' in JSON form (typically I CTRL+A and then CTRL+C to copy and paste to a text document). One can then paste in JSON, and upload their own custom horse data. There is also expert horses that come built into the web app, which one can use by pressing the "Upload Expert Horses" and then "Play" buttons. At the end of the race, the top 3 horses in the RESULTS display are the fittest/winners.

## Video Demo

- [Video Overview of Project](https://youtu.be/RDkQ4zJIOIs)

## Requirements

- [Node.js](https://nodejs.org/en/) (~14.0.0)

## Initial Setup

After cloning the repository, you will need to run `npm install` from the command line in the root folder of the project.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## How it works

Each horse has 8 equidistant rays that shoot out from it's current position. These rays hit the walls of the track and return the distance of the current horse to the point of collision. If at any point the distance goes below a certain value the horse has been considered 'crashed' and will no longer update in the current race. The 8 distances created by the raycasts are the 8 inputs to the neural network for each horse. Each neural network has 8 inputs, 2 hidden layers of 8 neurons, and 3 output values corresponding to "move forward", "turn left", and "turn right". If any of the outputs are > 0.5 that action is taken on the horse. The horses' parameters are randomized at the start, and then determined by the parents and mutations in the future generations.

The next step is training the neural network to get to more ideal parameters. Fittness is determined by how many checkpoints and laps the horse hit. If there is a tie the victory is given to the lowest time value and lowest distance to next checkpoint. These determinations are also used to determine the results of the race. The 3 fittest horses are then used to create 7 more horses by randomly mixing 2 fit horses' parameters with a chance of evolutionary mutation. The 3 fittest horses from the previous generation race again to compare to their children with the hope that performance will gradually increase.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

### Art

[Horse Spritesheet](https://www.deviantart.com/eriegrass/art/Horse-Spritesheet-673987667)
Published: Apr 9, 2017
by ErieGrass

### References for Neural Networks and Genetic Algorithms

- [3Blue1Brown](https://www.youtube.com/channel/UCYO_jab_esuFRV4b17AJtAw) - Youtube Series on what a neural network is and how they learn [S3 \* E1](https://www.youtube.com/watch?v=aircAruvnKk)
- [Ready Set Python - Neural Network Cars and Genetic Algorithms](https://www.youtube.com/watch?v=-sg-GgoFCP0) with link to [GitHub](https://github.com/ReadySetPython/Neural-Network-Cars)
- [Applying Evolutionary Artificial Neural Networks](https://github.com/ArztSamuel/Applying_EANNs)
- [AutoFlappy](https://github.com/johnBuffer/AutoFlappy)
