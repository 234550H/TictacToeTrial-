const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

let board = Array(9).fill('');
let currentPlayer = 'X'; 

function resetGameState() {
  board = Array(9).fill('');
  currentPlayer = 'X';
}

// Function to check for a winner
function checkWinner() {
  const winPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  
  for (const [a, b, c] of winPatterns) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return board.includes('') ? null : 'draw'; // If full board with no winner
}

app.get('/board', (req, res) => {
  res.json({ board, currentPlayer });
});

app.post('/move', (req, res) => {
  const { index } = req.body;

  if (board[index] === '' && index >= 0 && index < 9) {
    board[index] = currentPlayer;
    const winner = checkWinner();
    if (winner) {
      return res.json({ board, winner });
    }
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  }
  
  res.json({ board, currentPlayer });
});

// New endpoints to check win or lose
app.get('/win', (req, res) => {
  const winner = checkWinner();
  res.json({ winner });
});

app.get('/lose', (req, res) => {
  const winner = checkWinner();
  const lose = winner && winner !== currentPlayer && winner !== 'draw' ? currentPlayer : null;
  res.json({ lose });
});

app.post('/reset', (req, res) => {
  resetGameState();
  res.json({ board, currentPlayer });
});

app.get('/', (req, res) => {
  resetGameState();
  res.sendFile(__dirname + '/Frontend/index.html');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
