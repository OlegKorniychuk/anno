if (process.env.NODE_ENV !== 'production')
  require('dotenv').config();

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

const users = [
  { 
    id: 2,
    username: 'w',
    email: 'w@w',
    password: '$2b$10$rybsfRfY71DWvv61jAWsbOdtjVIi61oGN8DxTsJQuT0ir.NJkG3dm'
  }
];

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
    editor2: null
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
    editor2: null
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
    editor2: null
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
    editor2: null
  }
];

const textFilePath = 'data/aboba.txt';



app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({
  extended: false 
}));
app.use(flash());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));


//--root--

app.get('/', (req, res) => {
  res.redirect('/login');
});

//--login--

app.get('/login', checkNotAuth, (req, res) => {
  res.render('login');
});

app.post('/login', checkNotAuth, passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: true,
  successRedirect: '/index'
}));

//--register--

app.get('/register', checkNotAuth, (req, res) => {
  res.render('register');
});

app.post('/register', checkNotAuth, async (req, res) => {
  try {
    const passwordHashed = await bcrypt.hash(req.body.password, 10);

    users.push({
      id: Date.now().toString(),
      username: req.body.username,
      email: req.body.email,
      password: passwordHashed
    });

    res.redirect('/login');
  } catch {
    res.redirect('/register');
  }

  console.log(users);
});

//--index, index-logOut--

app.get('/index', checkAuth, (req, res) => {
  let finalData = {};

  async.parallel([
    function(parallelDone) {
      const toReq = req.query;

      let initQuery = `SELECT files.file_id, `
      + `files.file_name, users.user_name `
      + `AS admin_name FROM files, users `
      + `WHERE users.user_id = files.admin_id`;

      if (toReq.slider === 'on')
        initQuery += ` AND files.isReady = 0`;
      else
        initQuery += ` AND files.isReady = 1`;

      if (toReq.category)
        initQuery += ` AND files.category = '`
        + toReq.category.toLowerCase().trim()
        + `'`;

      if (toReq.style)
        initQuery +=` AND files.style = '`
        + toReq.style + `'`;

      db.query(initQuery, (err, result) => {
        if (err) {
          console.log(err);

          return parallelDone(err);
        }

        finalData.fileHeaders = result;
        parallelDone();
      });
    },
    function(parallelDone) {
      const initQuery = `SELECT files.file_id, `
      + `files.file_name FROM files JOIN `
      + `branch WHERE branch.editor_id = `
      + req.user.id;

      db.query(initQuery, (err, edited) => {
        if (err) {
          console.log(err);

          return parallelDone(err);
        }

        finalData.editedFiles = edited;
        parallelDone();
      });
    },
    function(parallelDone) {
      db.query('SELECT category from files', (err, categories) => {
        if (err) {
          console.log(err);

          return parallelDone(err);
        }

        finalData.categoriesList = categories;
        parallelDone();
      });
    }
  ], function(err) {
    const ofReq = req.query;

    if (err) console.log(err);

    finalData.sliderValue = ofReq.slider;
    finalData.category = ofReq.category;
    finalData.style = ofReq.style; 

    console.log("Slider position: ",finalData.sliderValue);

    res.render('index.ejs', finalData)
  });
});

app.delete('/index', (req, res) => {
  req.logOut(err => {
    if (err) return next(err);

    res.redirect('/login');
  });
});

app.post('/index', (req, res) => {
  //Editing request to be added
  res.redirect('/index');
});

//---viewfile

app.get('/viewfile/:fileId', checkAuth, (req, res) => {
  const fileId = req.params.fileId,
  userId = req.user.id,
  markdownType = req.query.markdownType || "NER";

  console.log('FileID: ',fileId);

  const initQuery = `SELECT files.file_name, `
  + `markdown_${markdownType}.markdown_status, `
  + `markdown_${markdownType}.partials_ready, `
  + `markdown_${markdownType}.partials_not_ready `
  + `FROM files JOIN branch JOIN markdown_${markdownType} `
  + `WHERE files.file_id = ${fileId} AND `
  + `branch.editor_id = ${userId} AND `
  + `branch.${markdownType} = markdown_${markdownType}.markdown_id`;

  db.query(initQuery, (err, [result]) => {
    if (err) {
      console.log(err);

      res.send('Smth bad happened');
      return err;
    }

    console.log('View query result: ', result);

    const fileName = result.file_name,
    partReadyPath = path.resolve(__dirname + result.partials_ready),
    partNotReadyPath = path.resolve(__dirname + result.partials_not_ready),
    contents = fp.viewFile(partNotReadyPath, partReadyPath),
    firstPartial = fp.getSortedPartials(partNotReadyPath)[0];

    res.render('viewfile.ejs', { 
      file: contents, 
      firstPartial: firstPartial, 
      fileId: fileId, 
      fileName: fileName,
      markdown: markdownType,
    });
  });
});

//---editfile---

app.get('/editfile/:fileId/:markdown/:partName', checkAuth, (req, res) => {
  console.log('Query: ', req.params);

  const userId = req.user.id,
  fileId = req.params.fileId,
  partName = req.params.partName,
  markdownType = req.params.markdown;

  const initQuery = `SELECT markdown_${markdownType}.partials_ready, `
  + `markdown_${markdownType}.partials_not_ready FROM files JOIN branch `
  + `JOIN markdown_${markdownType} WHERE files.file_id = ${fileId} AND `
  + `branch.editor_id = ${userId} AND `
  + `branch.${markdownType} = markdown_${markdownType}.markdown_id`;

  db.query(initQuery, (err, [result]) => {
    if (err) console.log(err);

    console.log(result);

    const tempPath = __dirname + result.partials_not_ready;

    const currentPart = fp.readFile(path.resolve(tempPath + partName)),
    partsArray = fp.getSortedPartials(path.resolve(tempPath)),
    nextPartName = partsArray[partsArray.indexOf(partName) + 1];

    res.render('editfile', { 
      part: currentPart, 
      fileId: fileId, 
      markdown: markdownType, 
      nextPart: nextPartName, 
    });
  });
});

app.post('/editfile/:fileId/:markdown/:partName', checkAuth, (req, res) => {
  const fileId = req.params.fileId,
  markdown = req.params.markdown,
  partName = req.params.partName,
  fileName = req.params.partName,
  userId = req.user.id;

  const initQuery = `SELECT partials_not_ready, partials_ready `
  + `FROM markdown_${markdown} JOIN branch JOIN files `
  + `WHERE files.file_id=${fileId} AND branch.editor_id=${userId} `
  + `AND branch.${markdown}=markdown_${markdown}.markdown_id`;

  db.query(initQuery, (err, [result]) => {
    const oldPath = path.resolve(__dirname + result.partials_not_ready + fileName),
    newPath = path.resolve(__dirname + result.partials_ready + fileName),
    contents = req.body.text;

    console.log(oldPath, newPath, contents);

    fp.completePart(oldPath, newPath, contents);
  });

  res.redirect(`/editfile/${fileId}/${markdown}/${partName}`);
});



function checkAuth(req, res, next) {
  if (req.isAuthenticated())
    return next();
  else res.redirect('/login');
}

function checkNotAuth(req, res, next) {
  if (req.isAuthenticated())
    return res.redirect('/index');
  else return next();
}



app.listen(process.nextTick.PORT || port, () => {
  console.log(`Server now listening on port ${port}`);
});
