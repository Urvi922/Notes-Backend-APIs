const express = require('express');
const rateLimit = require('express-rate-limit');


const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const dotenv = require('dotenv');
const User = require('./models/userModel');


dotenv.config();

//database connection string
const MONGODB_URI_NEW = process.env.MONGODB_URI_NEW;


// start app and connect to database
const app = express();
app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
});


const store = new MongoDBStore({
    uri: MONGODB_URI_NEW,
    collection: 'sessions',
});

store.on('connected', () => {
    console.log('Session store connected!');
});

store.on('error', (error) => {
    console.log('Session store error:', error);
});

//rate limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requestes, please try after few mintues.',
    standardHeaders: true,
    legacyHeaders: false,
});

//handle throttling
const throttle = (req, res, next) => {
    setTimeout(next, 200);
};


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(limiter);
app.use(throttle);

// import routes
const authRoutes = require('./routes/auth');
const noteRoutes = require('./routes/notes');


// Generate session when user is logged in
app.use(session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
}));

app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            req.user = user;
            next(); 
        })
        .catch(err => console.log(err));
});

// Routes 
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);

// display on the page
app.get('/', (req, res) => {
    res.send('Server is running');
});


// setup server
mongoose
    .connect(MONGODB_URI_NEW)
    .then(result => {
        console.log('Connected to MongoDB');
        app.listen(3000,() => console.log('Server running on port 3000'));
    })
    .catch(err => {
        console.log('Unable to connect to mongodb',err);
});

module.exports = app;

