const app = require("express");
const port = 5000;


app.get('/', (req, res) => {
  res.redirect('/login');
})

app.listen(port, () => {
  console.log(`Server now listening on port ${port}`);
});