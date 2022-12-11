if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require("express");
const passport = require('passport');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');

const initPassport = require('./passport-config.js');
initPassport(
  passport, 
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
);



const app = express();
const port = 5000;

//---temporary constants for testing---

const users =[ { 
  id: 12970519581,
  username: 'w',
  email: 'w@w',
  password: '$2b$10$rybsfRfY71DWvv61jAWsbOdtjVIi61oGN8DxTsJQuT0ir.NJkG3dm'
}];

const files = [ 
  {
    id: 19074981,
    name: 'file-1',
    authorId: 12970519581, //links to author`s ID
    status: 64,
    content: 'amogus'
  },
  {
    id: 41245981,
    name: 'file-1',
    authorId: 75928620, //links to author`s ID
    status: 64,
    content: 'imposter'
  },
  {
    id: 19050950,
    name: 'file-1',
    authorId: 75928620, //links to author`s ID
    status: 64,
    content: 'sus'
  },
  {
    id: 83570981,
    name: 'file-1',
    authorId: 12970519581, //links to author`s ID
    status: 64,
    content: 'aboba'
  },
]


app.set('view engine', 'ejs');

app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({
  extended: false 
}));
app.use(flash());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'));


//--root--

app.get('/', (req, res) => {
  res.redirect('/login');
})

//--login--

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login');
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: true,
  successRedirect: '/index',
}))

//--register--

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register');
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
  try {
    const passwordHashed = await bcrypt.hash(req.body.password, 10);
    users.push({
      id: Date.now().toString(),
      username: req.body.username,
      email: req.body.email,
      password: passwordHashed
    })
    res.redirect('/login');
  } catch {
    res.redirect('/register');
  }
  console.log(users);
})

//--index, index-logOut--

app.get('/index', checkAuthenticated, (req, res) => {
  //this code should be replaced by an SQL query
  const userFiles = files.filter(file => file.authorId === req.user.id);
  console.log(userFiles);
  res.render('index.ejs', { files: userFiles });
})

 app.delete('/logout', (req, res) => {
  req.logOut((err) => {
    if (err) return next(err);
    res.redirect('/login');
  });
 })

//---viewfile

app.get('/viewfile', (req, res) => {
  res.render('viewfile');
})

//---editfile---

app.get('/editfile', (req, res) => {
  res.render('editfile');
})


//---functions---

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  } else {
    res.redirect('/login');
  }
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/index');
  } else {
    return next();
  }
}

app.listen(process.nextTick.PORT || port, () => {
  console.log(`Server now listening on port ${port}`);
});