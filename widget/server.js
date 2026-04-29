const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.WIDGET_PORT || 3002;

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  next();
});

app.use(express.static(path.join(__dirname, 'src')));

app.listen(PORT, () => {
  console.log(`Widget server running on http://localhost:${PORT}`);
});
