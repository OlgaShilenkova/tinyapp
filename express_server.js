//
//REQUIREMENTS
//
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const morgan = require("morgan");
var cookieParser = require('cookie-parser');

// Function to generate short Url
function generateRandomString() {
  let nums = [];
  for (let i = 0; i < 3; i++) {
    let num = Math.floor(Math.random() * 9);
    nums.push(num);
  }
  const alphabet = "abcdefghijklmnopqrstuvwxyz"
  for (let i = 0; i < 3; i++) {
    let randomNum = Math.floor(Math.random() * alphabet.length);
    let character = alphabet[randomNum];
    nums.push(character);
  }
  return nums.join("");
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
}

const findUserByEmail = (email) => {
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return user;
    }
  }
  return null;
}



//
// MIDDLEWARE SETTINGS FOR SERVER
//
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cookieParser()); // bring in cookie-parser

//
//ROUTES
//

//EXAMPLE ROUTES
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//VIEWS ROUTES
//(show all the url links) --> urls_index.ejs
app.get("/urls", (req, res) => {
  const { user_id } = req.cookies;
  if (!user_id) {
    return res.redirect("/login");
  }

  const user = users[user_id];
  if (!user) {
    return res.redirect("/login");
  }

  const templateVars = {
    user: user,
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

// CREATE new
app.get("/urls/new", (req, res) => {
  const { user_id } = req.cookies;
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

  const { user_id } = req.cookies;
  if (!user_id) {
    return res.redirect("/login");
  }

  const user = users[user_id];
  if (!user) {
    return res.redirect("/login");
  }

  const { shortURL} = req.params;
  const longURL = urlDatabase[shortURL];

  const templateVars = {
    user,
    shortURL, 
    longURL
  };
  res.render("urls_show", templateVars);
});

//for redirect links from short urls pages
app.get("/u/:shortURL", (req, res) => {
  const {shortURL} = req.params;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

//CRUD URLS (creat, read, update, delete urls)
//CREATE   --> urls_index
app.post("/urls", (req, res) => {
  const { user_id } = req.cookies;
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

  const shortUrl = generateRandomString();

  urlDatabase[shortUrl] = longURL;
  res.redirect("/urls/" + shortUrl);
});

//UPDATE
app.post("/urls/:shortURL", (req, res) => {
  const { user_id } = req.cookies;
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
 // const urlBelongsToUser = urlObject.userID === user.id; // true of false
 //if (!urlBelongsToUser){
 // return res.status(400).send(" You do not own this url. ")
 //  }
  urlDatabase[shortURL] = newLongURL;
  res.redirect("/urls");
});

// DELETE
app.post("/urls/:shortURL/delete", (req, res) => {
  const { user_id } = req.cookies;
  if (!user_id) {
    return res.redirect("/login");
  }

  const user = users[user_id];
  if (!user) {
    return res.redirect("/login");
  }

  const {shortURL} = req.params;

  const urlObject = urlDatabase[shortURL];
  if (!urlObject) {
    return res.status(400).send(" This shortURL is not exist in data base.");
  }

 // const urlBelongsToUser = urlObject.userID === user.id; // true of false
 //if (!urlBelongsToUser){
 // return res.status(400).send(" You do not own this url. ")
 //  }
  delete urlDatabase[shortURL];
  res.redirect("/urls")

});

//AUTH ROUTES

//REGISTER
app.get("/register", (req, res) => {
  const { user_id } = req.cookies;
  if (user_id) {
    return res.redirect("/urls");
  }

  const templateVars = {
    user: null
  };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const { user_id } = req.cookies;
  if (user_id) {
    return res.redirect("/urls");
  }

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("email and password cannot be blank")
  }

  const emailExist = findUserByEmail(email);
  if (emailExist) {
    return res.status(400).send('a user with that email already exists');
  }

  const id = generateRandomString();

  users[id] = {
    id: id,
    email: email,
    password: password
  };
  res.cookie('user_id', users[id].id); 
  res.redirect("/urls");
});



//LOGIN
app.get("/login", (req, res) => {
  const { user_id } = req.cookies;
  if (user_id) {
    return res.redirect("/urls");
  }

  const templateVars = {
    user: null
  };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const { user_id } = req.cookies;
  if (user_id) {
    return res.redirect("/urls");
  }

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("Email and password cannot be blank")
  }

  const user = findUserByEmail(email);
 
  // check to see if that user exists in our database
  if (!user) {
    return res.status(400).send("A user with that email doesn't exist")
  }

  const passwordMatch = user.password === password;//change this when hashing passwords
  //check if password match
  if (!passwordMatch) {
    return res.status(400).send('Your password doesnt match');
  }

  // happy path
  res.cookie('user_id', user.id);
  res.redirect("/urls");
});


//LOGOUT
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

//
//LISTENER
//
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});