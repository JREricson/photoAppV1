/*jshint esversion: 6 */
require('dotenv').config();
const express = require('express');
const app = express();
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const bodyParser = require('body-parser');

const passport = require('passport');
const path = require('path');

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));
//ejs
//app.use(expressLayouts);
app.set('view engine', 'ejs');

// Passport Config
require('./config/passport')(passport);

//bodyParser
app.use(express.urlencoded({ extended: false }));

//Express session
app.use(
   session({
      secret: 'process.env.SECRET',
      resave: true,
      saveUninitialized: true,
   }),
);

app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

//Global vars
app.use((req, res, next) => {
   res.locals.success_msg = req.flash('success_msg');
   res.locals.error_msg = req.flash('error_msg');
   res.locals.error = req.flash('error');
   next();
});

//setting up mongoDB
//setting up mongodb
mongoose
   .connect('mongodb://localhost:27017/photoAppV1', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
   })
   .then(() => console.log('MOngoDB connected'))
   .catch((err) => console.log(err));
mongoose.set('useCreateIndex', true);

//Routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/user'));

const PORT = process.env.PORT || 3001;
var today = new Date();

var date =
   today.getFullYear() +
   '-' +
   (today.getMonth() + 1) +
   '-' +
   today.getDate() +
   ' at ' +
   today.getHours() +
   ':' +
   today.getMinutes();

app.listen(PORT, console.log(`server started on port ${PORT} on ${date}`));
