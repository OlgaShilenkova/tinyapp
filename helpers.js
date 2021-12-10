// Function to generate short Url
const generateRandomString = () => {
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

const findUserByEmail = (email, database) => {
  for (const singleUser in database) {
    const user = database[singleUser];
    if (user.email === email) {
      return user;
    }
  }
  return null;
}

module.exports = { generateRandomString, findUserByEmail };
