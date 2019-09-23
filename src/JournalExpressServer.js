const express = require("express");
var app = express();
const moment = require("moment");
const bodyParser = require("body-parser");
const Sequelize = require("sequelize");
const morgan = require("morgan");
const path = require("path");
const cwd = process.cwd();

const bcrypt = require("bcrypt");
const session = require("express-session");
const journal = require("./journalentry");
const db = require("../models");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

app.use(morgan("tiny"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: "keyboard cat",
    cookie: {
      httpOnly: true,
      maxAge: 3600000 // 1 hour
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user.email || user));
passport.deserializeUser((email, done) => done(null, { email }));

passport.use(
  "local",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      session: true,
      passReqToCallback: true
    },
    async (req, email, password, done) => {
      try {
        // Lignende dette:
        const stored = await db.user.findOne({ where: { email } });

        // Bedre nå
        // User does not exist
        // Error: Failed to serialize user into session, det e neste ting nå me må finne ut.

        if (!stored) {
          return done(null, false, { message: "User does not exist." });
        }

        // Get stored bcrypt hash -- this will throw an error if not present.
        //const stored = await req.user.password; // tror problemet er denne linjen i første omgang

        // Asynchronously compare the the hashed password
        const result = await new Promise((resolve, reject) => {
          bcrypt.compare(password, stored.password, (err, success) => {
            if (err) {
              return reject(err);
            }
            // Resolves true or false for comparison of the hash
            resolve(success);
          });
        });

        if (result) {
          const hei = db.user
            .findOne({ where: { email } })
            .then(user => done(null, { user }));
          console.log(hei);
          return hei; // Dette lagrer hele brukeren. Såg ikke det før nå...

          // Gjorde kun dette for å ta console.log på utfallet :))
        } else {
          /**
           * SECURITY WARNING
           *
           * This is for demonstration only and should not be used in a production setting.
           *
           * Letting the user know whether the username was wrong or the password exposes too much
           * information to an adversary. You should always respond with a uniform message along the
           * lines of "username or password invalid" without distinguishing which failed.
           */
          return done(null, false, { message: "Incorrect password." });
        }
      } catch (err) {
        // User doesn't exist
        if (err.notFound) {
          /**
           * SECURITY WARNING
           *
           * This is for demonstration only and should not be used in a production setting.
           *
           * Letting the user know whether the username was wrong or the password exposes too much
           * information to an adversary. You should always respond with a uniform message along the
           * lines of "username or password invalid" without distinguishing which failed.
           */
          return done(null, false, { message: "User does not exist." });
        }

        // Something _really_ bad happened... if you ever get here then you messed up your code.
        return done(err);
      }
    }
  )
);

app.post("/api/v1/login", passport.authenticate("local"), (req, res) => {
  res.status(200).json({
    status: "ok",
    user: req.user
  });
});

app.post("/api/v1/start", (req, res) => {
 if (req.user) {
   res.status(200).json({
     status: "ok",
     user:req.user
   })
 }
});

app.get("/api/v1/signout", (req, res) => {
	req.logout();
	res.status(200).json({ status: "ok" });
});

journal(app, "/api/v1/journalentry");

app.post("/api/v1/signup", async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const existing = await db.user.findOne({ where: { email } });

    if (existing) {
      // Again -- this is not a good idea from a security standpoint.
      return res
        .status(403)
        .json({ status: "error", message: "User already exists." });
    }

    console.log("Registered successfully");

    const saltRoundsString = process.env.SALT_ROUNDS;
    const saltRounds = saltRoundsString ? Number(saltRoundsString) : 10;

    // Create password hash
    // Thou shalt not store your passwords in plaintext.
    const hash = await bcrypt.hash(password, saltRounds);

    // Store in db -- asynchronous operation
    const result = await db.user.create({ email, password: hash });

    // Notify the user of their success. Respond with 201 Created.
    // Note user is not logged in at this point.
    return res
      .status(201)
      .json({ status: "ok", message: "User registered. Please log in." });
  } catch (err) {
    // User not found -- proceed with registration
    if (err.notFound) {
      // Bcrypt config
    }

    // Pass error to default error handler
    return next(err);
  }
});

app.use((err, req, res, next) => {
  if (err) {
    console.error(err);
    return res.status(500).end();
  }

  next();
});

const conn = new Sequelize("development", "sarah_db", "spacehamster", {
	host: "localhost",
	dialect: "postgres"
});

// TEST
conn
	.authenticate()
	.then(() => {
		console.log("Connection has been established successfully.");
	})
	.catch(err => {
		console.error("Unable to connect to the database:", err);
	});

app.get("/api/v1/journal", (req, res) => {
	res.status(200).json(entriesArray);
}); //Get array of items


app.get("/api/v1/journal/:id", (req, res) => {
	var id = req.params.id;
	res.status(200).send(entriesArray[id]);
}); //Get specific item

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}.`));
