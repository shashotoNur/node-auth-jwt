const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const cookieParser = require('cookie-parser');
const { requireAuth, checkUser } = require('./middleware/authMiddleware');
const { databaseURI } = require('./config/creds');

const app = express();

// middleware
app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());

// view engine
app.set('view engine', 'ejs');

// database connection
mongoose.connect(databaseURI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex:true,
    useFindAndModify: false
  })
  .then((_res) =>
  {
    app.listen(3000);
    console.log('Server listening at 127.0.0.1:3000');
  })
  .catch((err) => console.log(err));

// routes
app.get('*', checkUser);
app.get('/', (_req, res) => res.render('home'));
app.get('/protected', requireAuth, (_req, res) => res.render('protected'));

app.use(authRoutes);