//
//REQUIREMENTS
//
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const morgan = require("morgan");
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

//
// MIDDLEWARE SETTINGS FOR SERVER
//
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));


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
  res.json(urlDatabase); ``
});

//VIEWS ROUTES
//(show all the url links)
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// CREATE new
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// UPDATE
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);
});

//for redirect links from short urls pages
app.get("/u/:shortURL", (req, res) => {
  console.log(req.params);
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

//CRUD URLS (creat, read, update, delete urls)
//CREATE 
app.post("/urls", (req, res) => {
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

  const { newLongURL } = req.body;// extract newLongUrl from req.body object
  if (!newLongURL) {
    return res.status(400).send(" You need to pass a newLongURL to update ");
  }

  const { shortURL } = req.params;

  const urlObject = urlDatabase[shortURL];
  if (!urlObject) {
    return res.status(400).send(" This shortURL is not exist in data base ");
  }

  urlDatabase[shortURL] = newLongURL;
  res.redirect("/urls");
});

// DELETE
app.post("/urls/:shortURL/delete", (req, res) => {
  const idToDelete = req.params.shortURL;
  delete urlDatabase[idToDelete];
  res.redirect("/urls")

});

//
//LISTENER
//
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});