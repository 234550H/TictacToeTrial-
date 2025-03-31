const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const http = require('http');
const app = express();
const PORT = 3000;

// Set up the HTTP server
const server = http.createServer(app);

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve static files from the 'public' folder

// WebSocket server setup to handle upgrades from HTTP
const wss = new WebSocket.Server({ noServer: true });

// Track players' names, game state, and game status
let players = [];
let board = Array(9).fill('');
let currentPlayer = 'X';
let gameOver = false;
let gameStarted = false;
let winner = null;

// Send current game state to all players
function broadcastGameState() {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ board, currentPlayer, gameOver, gameStarted, winner }));
    }
  });
}

// Send player names to all players
function broadcastPlayers() {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ players }));
    }
  });
}

// Check if there's a winner
function checkWinner() {
  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];

  for (let combo of winningCombinations) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      winner = players[currentPlayer === 'X' ? 0 : 1]; // Set the winner player
      return true;
    }
  }
  return false;
}

// Check if the game is a draw (board is full and no winner)
function checkDraw() {
  if (board.every(cell => cell !== '') && !checkWinner()) {
    winner = null; // Ensure the winner is not set to draw
    return true;
  }
  return false;
}

// Reset the game state to start a new game
function resetGameState() {
  board = Array(9).fill('');
  currentPlayer = 'X';
  gameOver = false;
  gameStarted = false;
  players = [];
  winner = null; // Reset winner on game reset
}

// Handle WebSocket connections
wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const data = JSON.parse(message);

    switch (data.type) {
      case 'setName':
        if (players.length < 2) {
          players.push(data.name);
        }
        broadcastPlayers();
        break;

      case 'startGame':
        if (players.length === 2) {
          gameStarted = true;
          currentPlayer = 'X';
          broadcastGameState();
        }
        break;

      case 'move':
        if (gameStarted && !gameOver && data.index >= 0 && data.index < 9 && board[data.index] === '') {
          board[data.index] = currentPlayer;

          // Check for winner before switching player
          if (checkWinner()) {
            gameOver = true;
            winner = players[currentPlayer === 'X' ? 1 : 0]; // Assign the winner based on current player
            broadcastGameState();  // Notify all players with the updated game state
          } else if (checkDraw()) {
            gameOver = true;
            broadcastGameState();  // Notify everyone that the game is a draw
            sendMessageToPlayers('The game is a draw!');  // Send a draw message to all players
          } else {
            // Switch to the next player only if the game isn't over
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            broadcastGameState();  // Update game state for all players
          }
        }
        break;

      case 'reset':
        resetGameState();
        broadcastGameState();
        break;

      default:
        break;
    }
  });
});

// Send a message to all players
function sendMessageToPlayers(message) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ message }));
    }
  });
}

// Handle WebSocket connection upgrade from HTTP
server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

// Ability to let you know which port you are listening on 
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Important to link it to frontend 
app.get('/', (req, res) => {
  resetGameState();
  res.sendFile(__dirname + '/Frontend/index.html');
});
