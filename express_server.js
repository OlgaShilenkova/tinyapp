const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const morgan = require("morgan");

app.set("view engine", "ejs");

//
// MIDDLEWARE
//
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));

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
//ROUTES
//

//
// CREATE new
//
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

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

//
//READ
//
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase); ``
});

//
// (show all the url links)
//
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  let smallUrl = generateRandomString();
  const newLongUrl = req.body.longURL;
  urlDatabase[smallUrl] = newLongUrl;
  res.redirect("/urls/" + smallUrl);
});

// app.post("/urls", (req, res) => {
//   let smallUrl = generateRandomString();
//   const newLongUrl = req.body.longURL;
//   urlDatabase[smallUrl] = newLongUrl;
//   res.redirect("/urls/" + smallUrl);
// });




//
// UPDATE
//

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);
});



//
//for redirect links from short urls pages
//
app.get("/u/:shortURL", (req, res) => {
  console.log(req.params);
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

//
// DELETE
//

app.post("/urls/:shortURL/delete", (req, res) => {
  const idToDelete = req.params.shortURL;
  delete urlDatabase[idToDelete];
  res.redirect("/urls")

});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const newLongURL = req.body.longURL;
  urlDatabase[id] = newLongURL;

  res.redirect("/urls");
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});