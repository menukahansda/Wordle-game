const size = Math.floor(Math.random() * 5) + 3;  // 3 to 7
const maxGuesses = 6;
let currentGuess = 0;

const fallbackWords = ["for", "and", "the", "of", "in", "on", "at", "is", "it"];
const board = document.getElementById("board");
const guessInput = document.getElementById("guess-input");
const submitButton = document.getElementById("submit-button");
const message = document.getElementById("message");

let solution = "";
async function getData() {
    let x = await fetch(`https://random-word-api.herokuapp.com/word?length=${size}`);
    let data = await x.text();
    solution = data.substring(2, data.length - 2);
}

async function checkdata(checkvar) {
    const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${checkvar}`;
    try {
        const response = await fetch(apiUrl);

        if (response.ok) {
            return 1;
        } else if (fallbackWords.includes(checkvar)) {
            return 1; 
        } else {
            return 0;
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        return fallbackWords.includes(checkvar) ? 1 : 0;
    }
}

// check if solution exist
async function solcheck(corsol) {
    if (!(await checkdata(corsol))) {
        await getData();
        await solcheck(solution);
    }
}

async function main() {
    await getData();
    await solcheck(solution);
    console.log(solution);
    board.style.setProperty("--col", size);
    board.style.gridTemplateColumns = `repeat(${size}, 7vh)`;
    message.textContent = `Enter ${size}-lettered word!`;
    // Create the board
    for (let i = 0; i < maxGuesses; i++) {
        for (let j = 0; j < size; j++) {
            const tile = document.createElement("div");
            tile.className = "tile";
            tile.id = `tile-${i}-${j}`;
            board.appendChild(tile);
        }
    }

    async function checkGuess(guess) {
        if (guess.length !== size) {
            message.textContent = `Enter ${size}-lettered word!`;
            return false;
        }
        if (!(await checkdata(guess))) {
            message.textContent = "Not a word!";
            return false;
        }
        return true;
    }

    function updateBoard(guess) {
        for (let i = 0; i < size; i++) {
            const tile = document.getElementById(`tile-${currentGuess}-${i}`);
            tile.textContent = guess[i];
            if (guess[i] === solution[i]) {
                tile.classList.add("correct");
            } else if (solution.includes(guess[i])) {
                tile.classList.add("present");
            } else {
                tile.classList.add("absent");
            }
        }

    }

    async function handleGuess() {
        const guess = guessInput.value.toLowerCase();
        message.textContent = "";
        if (!(await checkGuess(guess))) {
            return;
        }
        updateBoard(guess);
    
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
    }

    
    submitButton.addEventListener("click", handleGuess);
    guessInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") handleGuess();
    });
    
}

main();


