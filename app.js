const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Default route for "/"
app.get('/', (req, res) => {
  res.send('Welcome to Tic Tac Toe Backend! A Trial and build in the process');
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
