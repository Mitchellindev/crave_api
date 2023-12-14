const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv').config();
const session = require('express-session')
const flash = require('connect-flash')
const userRoute = require('./routes/userRoute');
const dbConnect = require('./config/database');


dbConnect();
const app = express();

const port = process.env.PORT || 3500

app.use(express.static('public'));
app.use('/css', express.static(__dirname + 'public/css'));
app.use('/images', express.static(__dirname + 'public/images'));

app.set('views', './views');
app.set('view engine', 'ejs');



//Session and flash middleware
app.use(session({
    secret: 'your-secret-key',
    resave: true,
    saveUninitialized: true
  }));
  
  app.use(flash());
  
  app.use((req, res, next) => {
    res.locals.messages = {
      success: req.flash('success'),
      error: req.flash('error'),
      formData: req.flash('formData')[0] || {}
    };
    next();
  });

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors({ origin: true }))
app.use('/user', userRoute)


app.listen(port, () => {
    console.log(`Server listen on port: ${port}`)
})