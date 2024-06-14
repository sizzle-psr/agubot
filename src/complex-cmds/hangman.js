const Hangman = require('../hangman/hangman.js');

const { sanitizeText } = require('../utils/utils.js');

const { Random } = require('random-js');

const INACTIVITY_TIMEOUT_MINUTES = 15; // 15 minutes.
const HANGMAN_COOLDOWN_MINUTES = 5; // 5 minutes.

const hangmanChannels = {};
const hangmanCooldowns = {};

// Starts a new hangman game if possible.
function start(client, target) {
  if (hangmanCooldowns[target] && hangmanCooldowns[target] > Date.now()) {
    client.say(target, 'Hangman is on cooldown.');
    return;
  }

  const hangmanChannel = hangmanChannels[target];

  if (!hangmanChannel) {
    const { runners, items, abilities, moves } = require('../../data/hangmanData.json');

    // Define word lists and corresponding responses
    const modes = [
      {
        words: runners,
        introText: "Hangman game started with Pokémon Speedrunners! Use !guess to guess a letter/number or the full runner's name."
      },
      {
        words: items,
        introText: "Hangman game started with Pokémon Items! Use !guess to guess a letter/symbol or the full item's name."
      },
      {
        words: abilities,
        introText: "Hangman game started with Pokémon Abilities! Use !guess to guess a letter/symbol or the full ability's name."
      },
      {
        words: moves,
        introText: "Hangman game started with Pokémon Moves! Use !guess to guess a letter/symbol or the full move's name."
      }
    ];

    const random = new Random();

    // Choose a mode
    const { words, introText } = modes[random.integer(0, modes.length - 1)];

    // Choose a random word from the selected list
    const randomWord = words[random.integer(0, words.length - 1)];

    hangmanChannels[target] = {
      game: new Hangman(randomWord),
      lastGuessTime: Date.now(),
      cooldown: true,
    };

    // Append hidden word to response
    const introMessage = `${introText} Hidden word: ${hangmanChannels[target].game.hiddenWord}`;

    client.say(target, introMessage);

    const timeoutId = setTimeout(() => {
      endHangman(target, client, 'inactivity');
    }, INACTIVITY_TIMEOUT_MINUTES * 60 * 1000);

    hangmanChannels[target].timeoutId = timeoutId; // Store the timeout ID for this channel
  } else {
    client.say(target, 'Hangman game is already active. Use !guess to play.');
  }
}

function endHangman(target, client, reason) {
  const hangmanChannel = hangmanChannels[target];
  if (!hangmanChannel?.game) return;

  const hangmanGame = hangmanChannel.game;
  const result = hangmanGame.isGameOver() ? 'lost' : 'won';
  const originalWord = hangmanGame.originalWord;

  if (reason === 'inactivity') {
    client.say(target, `Hangman game was running for too long. Next time try to be faster :). The word was: ${originalWord}. Next round can start in ${HANGMAN_COOLDOWN_MINUTES} minutes.`);
  } else {
    client.say(target, `Hangman round over! You ${result}. The word was: ${originalWord}. Next round can start in ${HANGMAN_COOLDOWN_MINUTES} minutes.`);
  }

  clearTimeout(hangmanChannel.timeoutId); // Clear the inactivity timeout for this channel
  hangmanChannel.cooldown = true; // Prevent automatic game start

  hangmanChannels[target].cooldown = true; // Set cooldown after the game ends
  setHangmanCooldown(target, client); // Set the global cooldown for !hangman command

  delete hangmanChannels[target]; // Remove the hangmanChannel entry for this channel
}

function setHangmanCooldown(target, client) {
  let cooldown = HANGMAN_COOLDOWN_MINUTES * 60 * 1000;
  // Set a cooldown for the !hangman command in this channel
  hangmanCooldowns[target] = Date.now() + cooldown;

  // Schedule a message to be sent after the cooldown period is over
  setTimeout(() => {
    client.say(target, 'Hangman is available again. Use !hangman to start a new game.');
  }, cooldown);
}

// Make a guess on the current hangman game, if any.
function guess(message, client, target, user) {
  const hangmanChannel = hangmanChannels[target];
  const sanitizedMessage = sanitizeText(message);

  const guessMatch = sanitizedMessage.toLowerCase().match(/^!guess (.+)/);

  if (!hangmanChannel || !hangmanChannel.game) {
    client.say(target, 'Hangman is currently not active.');
  } else if (guessMatch) {
    hangmanChannel.lastGuessTime = Date.now(); // Update the last guess time

    const guess = guessMatch[1].toLowerCase();
    const hangmanGame = hangmanChannel.game;

    if (guess === hangmanGame.word) {
      client.say(target, `@${user} You guessed the word! Congratulations, you win!`);
      endHangman(target, client, 'win');
    } else if (guess.length === 1) {
      const success = hangmanGame.guess(guess);

      if (success) {
        client.say(target, `@${user} You guessed ${guess} . Hidden name: ${hangmanGame.hiddenWord}`);

        if (hangmanGame.isGameOver()) {
          endHangman(target, client, 'loss');
        } else if (hangmanGame.isGameWon()) {
          client.say(target, `@${user} You guessed the word! Congratulations, you win!`);
          endHangman(target, client, 'win');
        }
      } else {
        client.say(target, `@${user} You already guessed ${guess} .`);
      }
    } else {
      client.say(target, `@${user} Please guess one letter or the correct word.`);
    }
  }
}

module.exports = {
  start,
  guess,
};
