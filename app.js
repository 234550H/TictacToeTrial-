const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize the game state
let board = Array(9).fill('');
let currentPlayer = 'X';  // X starts first

// Reset the game state (to be called when a new game starts)
function resetGameState() {
  board = Array(9).fill('');
  currentPlayer = 'X';
}

// Endpoint to get the current board state
app.get('/board', (req, res) => {
  res.json({ board, currentPlayer });
});

// Endpoint to make a move on the board
app.post('/move', (req, res) => {
  const { index } = req.body;

  // Ensure the move is valid (empty cell and within bounds)
  if (board[index] === '' && index >= 0 && index < 9) {
    board[index] = currentPlayer;
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  }
  
  res.json({ board, currentPlayer });
});

// Endpoint to reset the board and start a new game
app.post('/reset', (req, res) => {
  resetGameState();
  res.json({ board, currentPlayer });
});

// Create a new game on first visit (ensuring fresh board on app startup)
app.get('/', (req, res) => {
  resetGameState();  // Start with a fresh game
  res.sendFile(__dirname + '/Frontend/index.html');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
