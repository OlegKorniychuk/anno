const express = require("express");

const app = express();
const port = 5000;



app.get('/', (req, res) => {
  res.redirect('/login');
})

app.get('/login', (req, res) => {
  res.render('index.html');
})

app.listen(port, () => {
  console.log(`Server now listening on port ${port}`);
});