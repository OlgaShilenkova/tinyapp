//
//REQUIREMENTS
//
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const morgan = require("morgan");
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');
const { generateRandomString, findUserByEmail, getUrlsForUser } = require("./helpers.js");

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

//
// MIDDLEWARE SETTINGS FOR SERVER
//
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cookieSession({
  name: 'session',
  keys: ["like houmus", "miss shuarma"],
  maxAge: 10 * 60 * 1000 // for 10 min
}));

//
//ROUTES
//

//EXAMPLE ROUTES
app.get("/", (req, res) => {
  // validating cookie
  const { user_id } = req.session;
  if (!user_id) {
    return res.redirect("login");
  }
  //validating existing user
  const user = users[user_id];
  if (!user) {
    return res.redirect("login");
  }
  res.redirect("/urls");
});

app.get("/users.json", (req, res) => {
  // validating cookie
  const { user_id } = req.session;
  if (!user_id) {
    return res.redirect("login");
  }
  //validating existing user
  const user = users[user_id];
  if (!user) {
    return res.redirect("login");
  }
  res.json(users);
});

app.get("/urls.json", (req, res) => {
  const { user_id } = req.session;
  if (!user_id) {
    return res.redirect("login");
  }
  const user = users[user_id];
  if (!user) {
    return res.redirect("login");
  }
  res.json(urlDatabase);
});

//VIEWS ROUTES
//(show all the url links) --> urls_index.ejs
// validating cookie
app.get("/urls", (req, res) => {
  const { user_id } = req.session;
  if (!user_id) {
    return res.status(400).send(" You need to register first. ");
  }

  const user = users[user_id];
  //validating existing user
  if (!user) {
    return res.status(400).send(" You need to register first. ");
  }

  const urlsForUser = getUrlsForUser(user.id, urlDatabase);
  const templateVars = {
    user: user,
    urls: urlsForUser
  };

  res.render("urls_index", templateVars);
});

// CREATE new
app.get("/urls/new", (req, res) => {
  const { user_id } = req.session;
  if (!user_id) {
    return res.redirect("/login");
  }

  const user = users[user_id];
  if (!user) {
    return res.redirect("/login");
  }

  const templateVars = { user };
  res.render("urls_new", templateVars);
});

// UPDATE --> urls.show.ejs
app.get("/urls/:shortURL", (req, res) => {

  const { user_id } = req.session;
  if (!user_id) {
    return res.status(400).send(" You need to logg in first. ");
  }

  const user = users[user_id];
  if (!user) {
    return res.status(400).send(" You need to logg in first. ");
  }

  const { shortURL } = req.params;
  const urlObject = urlDatabase[shortURL];
  if (!urlObject) {
    return res.status(400).send(" This shortURL is not exist in data base ");
  }
  //check if URL belongs to user
  const urlBelongsToUser = urlObject.userID === user.id; // true of false
  if (!urlBelongsToUser) {
    return res.status(400).send(" You do not own this url. ");
  }
  const templateVars = {
    user,
    urlObject
  };
  res.render("urls_show", templateVars);
});

//for redirect links from short urls pages
app.get("/u/:shortURL", (req, res) => {
  const { shortURL } = req.params;
  const { longURL } = urlDatabase[shortURL];
  res.redirect(longURL);
});

//CRUD URLS (creat, read, update, delete urls)
//CREATE   --> urls_index
app.post("/urls", (req, res) => {
  const { user_id } = req.session;
  if (!user_id) {
    return res.redirect("/login");
  }

  const user = users[user_id];
  if (!user) {
    return res.redirect("/login");
  }

  const { longURL } = req.body;
  if (!longURL) {
    return res.status(400).send(" You need to pass a longURL to create. ");
  }

  const shortURL = generateRandomString();

  urlDatabase[shortURL] = {
    id: shortURL,
    longURL: longURL,
    userID: user.id,
    createdAt: new Date(Date.now()).toDateString()
  };

  res.redirect("/urls/" + shortURL);
});

//UPDATE
app.post("/urls/:shortURL", (req, res) => {
  const { user_id } = req.session;
  if (!user_id) {
    return res.redirect("/login");
  }

  const user = users[user_id];
  if (!user) {
    return res.redirect("/login");
  }

  const { newLongURL } = req.body;// extract newLongUrl from req.body object
  if (!newLongURL) {
    return res.status(400).send(" You need to pass a newLongURL to update ");
  }

  const { shortURL } = req.params;

  const urlObject = urlDatabase[shortURL];
  if (!urlObject) {
    return res.status(400).send(" This shortURL is not exist in data base ");
  }

  //check if URL belongs to user

  const urlBelongsToUser = urlObject.userID === user.id; // true of false
  if (!urlBelongsToUser) {
    return res.status(400).send(" You do not own this url. ");
  }
  urlDatabase[shortURL] = {
    id: shortURL,
    longURL: newLongURL,
    userID: user.id,
    createdAt: new Date(Date.now()).toDateString()
  };

  res.redirect("/urls");
});

// DELETE
app.post("/urls/:shortURL/delete", (req, res) => {
  const { user_id } = req.session;
  if (!user_id) {
    return res.redirect("/login");
  }

  const user = users[user_id];
  if (!user) {
    return res.redirect("/login");
  }

  const { shortURL } = req.params;

  const urlObject = urlDatabase[shortURL];
  if (!urlObject) {
    return res.status(400).send(" This shortURL is not exist in data base.");
  }

  const urlBelongsToUser = urlObject.userID === user.id; // true of false
  if (!urlBelongsToUser) {
    return res.status(400).send(" You do not own this url. ");
  }
  delete urlDatabase[shortURL];
  res.redirect("/urls");

});

//AUTH ROUTES

//REGISTER
app.get("/register", (req, res) => {
  const { user_id } = req.session;
  if (user_id) {
    return res.redirect("/urls");
  }

  const templateVars = {
    user: null
  };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const { user_id } = req.session;
  if (user_id) {
    return res.redirect("/urls");
  }

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("email and password cannot be blank");
  }

  const emailExist = findUserByEmail(email, users);
  if (emailExist) {
    return res.status(400).send('a user with that email already exists');
  }

  const id = generateRandomString();

  const hashedPassword = bcrypt.hashSync(password, 10);

  users[id] = {
    id: id,
    email: email,
    password: hashedPassword
  };
  req.session.user_id = users[id].id;
  res.redirect("/urls");
});



//LOGIN
app.get("/login", (req, res) => {
  const { user_id } = req.session;
  if (user_id) {
    return res.redirect("/urls");
  }

  const templateVars = {
    user: null
  };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const { user_id } = req.session;
  if (user_id) {
    return res.redirect("/urls");
  }

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("Email and password cannot be blank");
  }

  const user = findUserByEmail(email, users);

  // check to see if that user exists in our database
  if (!user) {
    return res.status(400).send("A user with that email doesn't exist. You need to register first.");
  }

  //changed this when hashing passwords
  const passwordMatch = bcrypt.compareSync(password, user.password);
  //check if password match
  if (!passwordMatch) {
    return res.status(400).send('Your password doesnt match');
  }

  // happy path
  req.session.user_id = user.id;
  res.redirect("/urls");
});


//LOGOUT
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

//
//LISTENER
//
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

