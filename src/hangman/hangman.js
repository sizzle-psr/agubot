class Hangman {
  constructor(word) {
    this.word = word.toLowerCase(); // Lowercase to facilitate guessing.
    this.originalWord = word; // Store the original word so we can still show it as intended at the end.
    this.guesses = [];
    this.attempts = 15;
    this.hiddenWord = this.hideWord();
  }

  hideWord() {
    return this.word.split('').map(letter => {
      if (letter === ' ') {
        return '|'; // Replace spaces with "|"
      } else {
        return this.guesses.includes(letter) ? letter : '_';
      }
    }).join(' ');
  }

  guess(letter) {
    // Casing is irrelevant for guessing.
    letter = letter.toLowerCase();

    if (!this.guesses.includes(letter)) {
      this.guesses.push(letter);

      if (!this.word.includes(letter)) {
        this.attempts--;
      }

      this.hiddenWord = this.hideWord();

      return true;
    }
    return false;
  }

  isGameOver() {
    return this.attempts === 0; 
  }
  
  isGameWon() {
    return !this.hiddenWord.includes('_');
  }
}
  
module.exports = Hangman;