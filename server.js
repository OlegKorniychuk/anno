if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}


const async = require("async");
const path = require("path");
const express = require("express");
const passport = require('passport');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const db = require('./db.js');
const fp = require('./utils.js');

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

app.use(express.static(__dirname+'/public'));
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
    console.log("Slider position: ",finalData.sliderValue);
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

app.get('/viewfile/:fileId', checkAuthenticated, (req, res) => {
  const fileId = req.params.fileId;
  console.log('FileID: ',fileId);
  const userId = req.user.id; 
  const markdownType = req.query.markdownType || "NER";
  db.query(`SELECT files.file_name, markdown_${markdownType}.markdown_status ,markdown_${markdownType}.partials_ready, markdown_${markdownType}.partials_not_ready FROM files JOIN branch JOIN markdown_${markdownType} WHERE files.file_id = ${fileId} AND branch.editor_id = ${userId} AND branch.${markdownType} = markdown_${markdownType}.markdown_id`, (err, [result]) => {
    if (err) {
      console.log(err);
      res.send('Shit happened');
      return;
    }
    console.log('View query result: ', result);
    const fileName = result.file_name;
    const partReadyPath = path.resolve(__dirname + result.partials_ready);
    const partNotReadyPath = path.resolve(__dirname + result.partials_not_ready);
    const contents = fp.viewFile(partNotReadyPath, partReadyPath);
    const firstPartial = fp.getSortedPartials(partNotReadyPath)[0];
    res.render('viewfile.ejs', { 
      file: contents, 
      firstPartial: firstPartial, 
      fileId: fileId, 
      fileName: fileName,
      markdown: markdownType,
    });
  })
})

//---editfile---

app.get('/editfile/:fileId/:markdown/:partName', checkAuthenticated, (req, res) => {
  console.log('Query: ', req.params);
  const userId = req.user.id;
  const fileId = req.params.fileId;
  const partName = req.params.partName;
  const markdownType = req.params.markdown;
  db.query(`SELECT markdown_${markdownType}.partials_ready, markdown_${markdownType}.partials_not_ready FROM files JOIN branch JOIN markdown_${markdownType} WHERE files.file_id = ${fileId} AND branch.editor_id = ${userId} AND branch.${markdownType} = markdown_${markdownType}.markdown_id`, (err, [result]) => {
    if (err) {
      console.log(err);
    }
    console.log(result);
    const currentPart = fp.readFile(path.resolve(__dirname+result.partials_not_ready+partName))
    const partsArray = fp.getSortedPartials(path.resolve(__dirname+result.partials_not_ready))
    const nextPartName = partsArray[partsArray.indexOf(partName)+1];
    res.render('editfile', { 
      part: currentPart, 
      fileId: fileId, 
      markdown: markdownType, 
      nextPart: nextPartName, 
    });
  })
})

app.post('/editfile/:fileId/:markdown/:partName', checkAuthenticated, (req, res) => {
  const fileId = req.params.fileId;
  const markdown = req.params.markdown;
  const partName = req.params.partName;
  const fileName = req.params.partName;
  const userId = req.user.id;
  db.query(`SELECT partials_not_ready, partials_ready FROM markdown_${markdown} JOIN branch JOIN files WHERE files.file_id=${fileId} AND branch.editor_id=${userId} AND branch.${markdown}=markdown_${markdown}.markdown_id`, (err, [result]) => {
    const oldPath = path.resolve(__dirname+result.partials_not_ready+fileName);
    const newPath = path.resolve(__dirname+result.partials_ready+fileName);
    const contents = req.body.text;
    console.log(oldPath, newPath, contents);
    fp.completePart(oldPath, newPath, contents);
  });
  res.redirect(`/editfile/${fileId}/${markdown}/${partName}`);
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