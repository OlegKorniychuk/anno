if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}


const async = require("async");
const express = require("express");
const passport = require('passport');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const db = require('./db.js');

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
  id: 2,
  username: 'w',
  email: 'w@w',
  password: '$2b$10$rybsfRfY71DWvv61jAWsbOdtjVIi61oGN8DxTsJQuT0ir.NJkG3dm'
}];

const files = [ 
  {
    id: 19074981,
    name: 'file-1',
    authorId: 12970519581, //links to author`s ID
    statusNer: 64,
    statusSentiment: 38,
    statusIntention: 74,
    content: 'amogus',
    markdownNer: 'something',
    markdownSentiment: 'something else',
    markdownIntention: 'whatever',
    editor1: 6798174609,
    editor2: null,
  },
  {
    id: 41245981,
    name: 'file-1',
    authorId: 75928620, //links to author`s ID
    statusNer: 21,
    statusSentiment: 38,
    statusIntention: 74,
    content: 'imposter',
    markdownNer: 'something',
    markdownSentiment: 'something else',
    markdownIntention: 'whatever',
    editor1: 6798174609,
    editor2: null,
  },
  {
    id: 19050950,
    name: 'file-1',
    authorId: 75928620, //links to author`s ID
    statusNer: 97,
    statusSentiment: 38,
    statusIntention: 74,
    content: 'sus',
    markdownNer: 'something',
    markdownSentiment: 'something else',
    markdownIntention: 'whatever',
    editor1: 6798174609,
    editor2: null,
  },
  {
    id: 83570981,
    name: 'file-1',
    authorId: 12970519581, //links to author`s ID
    status: 50,
    content: 'aboba',
    markdownNer: 'something',
    markdownSentiment: 'something else',
    markdownIntention: 'whatever',
    editor1: 6798174609,
    editor2: null,
  },
]

const textFilePath = 'data/aboba.txt';


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
  // let fileHeaders;

  // db.query(`SELECT files.file_id, files.file_name, users.user_name AS admin_name FROM files, users WHERE users.user_id = files.admin_id`, (err, result) => {
  //   if (err) {
  //     console.log(err);
  //   } else {
  //     fileHeaders = result;
  //     console.log(fileHeaders);
  //     const userId = req.user.id;
  //     db.query(`SELECT files.file_id, files.file_name FROM files JOIN branch WHERE branch.editor_id = ${userId}`, (err, edited) => {
  //       if (err) {
  //         console.log(err);
  //       } else {
  //         editedFiles = edited;
  //         console.log(edited);
  //         res.render('index.ejs', { headers: fileHeaders, edited: editedFiles, slider: "on" });
  //       }  
  //     })
  //   }  
  // })

  let finalData = {};

  async.parallel([
    function(paralel_done) {
      let query1 = `SELECT files.file_id, files.file_name, users.user_name AS admin_name FROM files, users WHERE users.user_id = files.admin_id`
      if (req.query.slider == 'on') {
        query1 +=` AND files.isReady = 0`
      } else {
        query1 +=` AND files.isReady = 1`
      };
      if (req.query.category) query1 +=` AND files.category = '${req.query.category.toLowerCase().trim()}'`;
      if (req.query.style) query1 +=` AND files.style = '${req.query.style}'`;
      db.query(query1, (err, result) => {
        if (err) {
          console.log(err);
          return paralel_done(err);
        }
        finalData.fileHeaders = result;
        //console.log(result);
        paralel_done();
      })
    },
    function(paralel_done) {
      const userId = req.user.id;
      db.query(`SELECT files.file_id, files.file_name FROM files JOIN branch WHERE branch.editor_id = ${userId}`, (err, edited) => {
        if (err) {
          console.log(err);
          return paralel_done(err);
        }
        finalData.editedFiles = edited;
        //console.log(edited);
        paralel_done();
      })
    },
    function(paralel_done) {
      db.query('SELECT category from files', (err, categories) => {
        if (err) {
          console.log(err);
          return paralel_done(err);
        }
        finalData.categoriesList = categories;
        //console.log(finalData.categoriesList);
        paralel_done();
      })
    }
  ], function(err) {
    if (err) console.log(err);
    //db.end();
    finalData.sliderValue = req.query.slider;
    finalData.category = req.query.category;
    finalData.style = req.query.style; 
    console.log(finalData.sliderValue);
    res.render('index.ejs', finalData)
  })
})

app.delete('/index', (req, res) => {
  req.logOut((err) => {
    if (err) return next(err);
    res.redirect('/login');
  });
})

app.post('/index', (req, res) => {
  //Editing request to be added
  res.redirect('/index');
})

//---viewfile

app.get('/viewfile/:id', (req, res) => {
  const {id} = req.params;
  db.query('SELECT ',(err, file) => {
    res.render('viewfile', { file: files[0] });
  })
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