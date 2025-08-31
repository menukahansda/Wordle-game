import axios from "axios";
const size = Math.floor(Math.random() * 5) + 3;  // 3 to 7
const maxGuesses = 6;
let currentGuess = 0;

const board = document.getElementById("board");
const guessInput = document.getElementById("guess-input");
const submitButton = document.getElementById("submit-button");
const message = document.getElementById("message");

let solution = "";


async function generateSolution() {
    try {
        const response = await axios.get(`https://random-word-api.vercel.app/api?words=1&length=${size}`);
        const result = response.data;
        solution = result[0];
    } catch (error) {
        console.log(error.message);
    }
}

function createBoard() {
    board.style.setProperty("--col", size);
    board.style.gridTemplateColumns = `repeat(${size}, 7vh)`;
    message.textContent = `Enter ${size}-lettered word!`;
    for (let i = 0; i < maxGuesses; i++) {
        for (let j = 0; j < size; j++) {
            const tile = document.createElement("div");
            tile.className = "tile";
            tile.id = `tile-${i}-${j}`;
            board.appendChild(tile);
        }
    }
}

async function checkGuess(guessWord) {
    let remainingSolution = new Map;
    let remainingGuess = new Map();
    for (let i = 0; i < size; i++) {
        const tile = document.getElementById(`tile-${currentGuess}-${i}`);
        tile.textContent = guessWord[i];
        if (guessWord[i] === solution[i]) {
            tile.classList.add("correct");
        }
        else {
            remainingSolution.set(solution[i], i);
            remainingGuess.set(guessWord[i], i);
        }
    }
    for (let [key, idx] of Array.from(remainingGuess)) {
        const tile = document.getElementById(`tile-${currentGuess}-${idx}`);

        if (remainingSolution.has(key)) {
            tile.classList.add("present");
            remainingSolution.delete(key);
            remainingGuess.delete(key);
        }
    }
    for (let [key, idx] of remainingGuess) {
        const tile = document.getElementById(`tile-${currentGuess}-${idx}`);

        tile.classList.add("absent");
    }
}

async function handleGuess() {
    const guess = guessInput.value.toLowerCase().trim();
    message.textContent = "";

    if (guess.length !== size) {
        message.textContent = `Word must be ${size} letters!`;
        return;
    }
    await checkGuess(guess);
    if (guess === solution) {
        message.textContent = "You guessed it! ";
        submitButton.disabled = true;
        return;
    }

    currentGuess++;
    message.textContent = `You have ${maxGuesses - currentGuess} guesses remaining.`;

    if (currentGuess === maxGuesses) {
        message.textContent = `Game Over! The word was ${solution}.`;
        submitButton.disabled = true;
    }

    guessInput.value = "";
    guessInput.focus();
}
async function main() {
    createBoard();
    await generateSolution();
    submitButton.addEventListener("click", handleGuess);
    guessInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") handleGuess();
    });

}

main();


