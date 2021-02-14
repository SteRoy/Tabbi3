const env = require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const ttlib = require("ttlib");
const models = require("./models");
const socketIo = require("socket.io");
const http = require('http').Server(app);
const passportSocketIo = require("passport.socketio");



// Use JSON
app.use(express.json());

// SSL for non-development
if (process.env.DEVELOPMENT !== "TRUE") {
    const enforce = require('express-sslify');
    app.use(enforce.HTTPS({ trustProtoHeader: true }));
}

// Passport Local Strategy Setup
// Passport
passport.serializeUser(function(user, done) {
    if (user.status) {
        done(null, user.email);
    } else {
        done(null);
    }
});

passport.deserializeUser(function(email, done) {
    models.Account.findOne({
        where: {
            email
        },
        include: [
            {
                model: models.Person,
                attributes: ["name", "id"]
            }
        ]
    }).then(account => {
        if (account) {
            done(null, account);
        }
    });
});
passport.use(new LocalStrategy(
    {usernameField: 'email'},
    function(email, password, done) {
        if (!email || !password) {
            return done(null, false);
        } else {
            models.Account.findOne({
                where: {
                    email
                }
            }).then(account => {
                if (account) {
                    const salt = account.salt;
                    const candidateHash = ttlib.auth.saltHashString(password, salt);
                    if (candidateHash === account.password) {
                        return done(null, {
                            status: true,
                            message: "Login successful.",
                            email: account.email
                        })
                    } else {
                        return done(null, false);
                    }
                } else {
                    return done(null, false);
                }

            })
        }
    }
));

// TODO: Update storage strategy to use postgresql
const sessionStore = new (require('connect-pg-simple')(session))({
    conObject: {
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    }
});
const expressSession = session({
    store: sessionStore,
    secret: process.env.SECRET_TOKEN,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days
});
app.use(expressSession);
app.use(passport.initialize());
app.use(passport.session());

// Serve static files from the React frontend
app.use(express.static(path.join(__dirname, 'frontend/build')));

// Serverside API
app.use(`/api`, require("./api"));

// Catchall to render react frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'build', 'index.html'));
});

const port = process.env.PORT || 5000;
http.listen(port);

console.log(`Tabbi3 Running on ${port}`);

// Test SQL
try {
    require("./models").sequelize.authenticate().then(authed => {
        console.log(`Tabbi3 DB Connection Established`);
    });
} catch (error) {
    console.error(`Unable to connect to database: `, error);
}

// SOCKET Setup
const io = socketIo(http);
io.use(passportSocketIo.authorize({
    key:          'connect.sid',
    secret:       process.env.SECRET_TOKEN,
    store:        sessionStore,
    success:      onAuthorizeSuccess,
    fail:         onAuthorizeFail,
}));

function onAuthorizeSuccess(data, accept) {
    accept(null, true);
}

function onAuthorizeFail(data, message, error, accept) {
    accept(null, false);
}

require("./api/socket").listen(io);