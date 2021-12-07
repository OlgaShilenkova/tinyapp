const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");

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

app.get("/", (req, res) => {
  res.send("Hello!");
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase); ``
});
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

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
   console.log("longURL",longURL);
   res.redirect(longURL);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/urls", (req, res) => {
  let smallUrl = generateRandomString();
  const newLongUrl = req.body.longURL;
  urlDatabase[smallUrl] = newLongUrl;
  res.redirect("/urls/"+ smallUrl);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});