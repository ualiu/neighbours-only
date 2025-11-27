require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const flash = require('express-flash');
const path = require('path');
const connectDB = require('./config/database');

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Passport config
require('./config/passport')(passport);

// Body parser middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static folder
app.use(express.static(path.join(__dirname, 'public')));

// EJS view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    },
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Flash messages middleware
app.use(flash());

// Global variables middleware
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  res.locals.messages = req.flash();
  next();
});

// Routes
app.use('/', require('./routes/authRoutes'));
app.use('/neighborhood', require('./routes/neighborhoodRoutes'));
app.use('/posts', require('./routes/postRoutes'));
app.use('/comments', require('./routes/commentRoutes'));

// 404 Handler
app.use((req, res) => {
  res.status(404).render('404', {
    title: '404 - Page Not Found',
    user: req.user
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).render('error', {
    title: 'Error',
    user: req.user,
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
