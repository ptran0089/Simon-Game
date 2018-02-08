'use strict';

(function() {
  const game = {
    on: false,
    strict: false,
    sequence: [],
    nextIndexToCheck: 0,
    score: null,
    sounds: {
      green: new Audio('https://s3.amazonaws.com/freecodecamp/simonSound1.mp3'),
      red: new Audio('https://s3.amazonaws.com/freecodecamp/simonSound2.mp3'),
      yellow: new Audio('https://s3.amazonaws.com/freecodecamp/simonSound3.mp3'),
      blue: new Audio('https://s3.amazonaws.com/freecodecamp/simonSound4.mp3')
    },
    sequenceTimerId: null,
    timeoutTimerId: null,
    flashTimerId: null
  };

  const program = {
    init() {
      view.init();
      view.lockInput();
    },

    start() {
      view.lockInput();
      program.reset();
      view.flashStart();

      // Wait for flashStart to finish
      game.timeoutTimerId = setTimeout(program.generateSequence, 1500);
    },

    generateSequence() {
      const number = Math.floor(Math.random() * 4);
      const colors = ['green', 'red', 'yellow', 'blue'];

      view.lockInput();
      game.sequence.push(colors[number]);
      program.playSequence();
      program.setScore();
    },

    playSequence() {
      let currentIndexOfSequence = 0;

      game.sequenceTimerId = setInterval(function() {
        const color = game.sequence[currentIndexOfSequence];

        program.playSound(color);
        view.blinkLights(color);
        currentIndexOfSequence++;

        // If at the end of sequence, clear interval
        if (currentIndexOfSequence === game.sequence.length) {
          program.endSequence();
        }
      }, 1250);
    },

    endSequence() {
      clearInterval(game.sequenceTimerId);

      // Allow the last sequence to finish blinking before unlocking the board
      setTimeout(view.unlockInput, 1000);
    },

    inputColor(color) {
      view.blinkLights(color);
      program.playSound(color);

      // Prevent rapid view.inputs
      view.lockInput();

      if (game.sequence[game.nextIndexToCheck] === color) {
        program.correctInput();
      } else {
        program.incorrectInput();
      }
    },

    correctInput() {
      game.nextIndexToCheck++;
      setTimeout(function() {
        view.unlockInput();

        // If guessed the current sequence correctly, generate a new sequence
        if (game.nextIndexToCheck === game.sequence.length) {
          program.generateSequence();
          game.nextIndexToCheck = 0;
        }
      }, 500);
    },

    incorrectInput() {
      view.flashWarning();
      game.nextIndexToCheck = 0;
      if (game.strict) {
        game.sequence = [];
        game.timeoutTimerId = setTimeout(program.generateSequence, 1500);
      } else {
        game.timeoutTimerId = setTimeout(program.playSequence, 1500);
      }
    },

    playSound(color) {
      if (game.sounds[color]) {
        game.sounds[color].play();
      }
    },

    reset() {
      game.nextIndexToCheck = 0;
      game.sequence = [];
      clearInterval(game.sequenceTimerId);
      clearTimeout(game.timeoutTimerId);
      clearTimeout(game.flashTimerId);

      // Clear all the blinking lights
      view.clearLights();
    },

    turnOn() {
      game.on = true;
      view.renderOn();
    },

    turnOff() {
      program.reset();
      view.lockInput();
      game.strict = false;
      game.on = false;
      view.toggleStrictLight();
      view.renderOff();
    },

    setScore() {
      game.score = game.sequence.length;
    },

    toggleStrict() {
      if (game.on) {
        game.strict = !game.strict;
        view.toggleStrictLight();
      }
    }
  };

  const view = {
    init() {
      this.inputs = document.querySelectorAll('.input');
      this.strictLight = document.querySelector('.strict-light');
      this.onOff = document.querySelector('.on-off');
      this.display = document.querySelector('.display');

      document.querySelector('.power-button').addEventListener('click', function(e) {
        if (!game.on) {
          program.turnOn();
        } else {
          program.turnOff();
        }
      });

      document.querySelector('.start-button').addEventListener('click', function() {
        if (game.on) {
          program.start();
        } 
      });

      document.querySelector('.strict-button').addEventListener('click', function() {
        program.toggleStrict();
      });

      for (let i = 0; i < view.inputs.length; i++) {
        view.inputs[i].addEventListener('click', function(e) {
          const color = e.target.id;
          program.inputColor(color);
        });
      }
    },

    blinkLights(color) {
      this.display.innerText = game.score < 10 ? '0' + game.score : game.score;
      document.querySelector(`#${color}`).classList.add('active');

      setTimeout(function() {
        document.querySelector(`#${color}`).classList.remove('active');
      }, 500);
    },

    clearLights() {
      for (let i = 0; i < view.inputs.length; i++) {
        view.inputs[i].classList.remove('active');
      }
    },

    lockInput() {
      for (let i = 0; i < view.inputs.length; i++) {
        view.inputs[i].classList.add('locked');    
      }
    },

    unlockInput() {
      if (game.on) {
        for (let i = 0; i < view.inputs.length; i++) {
          view.inputs[i].classList.remove('locked');
        }
      }
    },

    renderOn() {
      this.onOff.classList.add('on');
      this.display.innerText = '--';
    },

    renderOff() {
      this.onOff.classList.remove('on');
      this.display.innerText = '';
    },

    toggleStrictLight() {
      if (game.strict) {
        this.strictLight.classList.add('on');
      } else {
        this.strictLight.classList.remove('on');
      }
    },

    flashStart() {
      view.flash('--', 2, 200);
    },

    flashWarning() {
      view.flash('!!', 2, 200);
      if (game.strict) setTimeout(view.flashStart, 1000);
    },
    
    flash(message, repeats, interval) {
      for (let i = 0; i < repeats; i++) {
        const increment = i * interval * 2;

        game.flashTimerId = setTimeout(function() {
          document.querySelector('.display').innerText = '';
        }, interval + increment);
        game.flashTimerId = setTimeout(function() {
          document.querySelector('.display').innerText = message;
        }, 2 * interval + increment);
      }
    }
  }

  program.init();

})();
