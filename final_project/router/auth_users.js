const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];
// Verifica se um usuário existe em users array
const isValid = (username) => {
  return users.some(user => user.username === username);
}

// Verifica se o usuário e a senha correspondem a um usuário existente
const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  // Request nos campos do body
  const { username, password } = req.body;
  // Verifica se os campos foram informados
  if (!username || !password) {
    // Retorna erro
    return res.status(404).json({ message: "Error logging in" });
  }
  // Verifica se o usuário e a senha correspondem a um usuário existente
  if (authenticatedUser(username, password)) {
    // Gera o JWT access token, com duração de 1 hora, usando a senha como payload
    let accessToken = jwt.sign({ data: password }, 'access', { expiresIn: 60 * 60 });
    // Cria a sessão do usuário com o token de acesso e o nome de usuário
    req.session.authorization = { accessToken, username }
    //  Retorna uma resposta de sucesso com o status 200 e uma mensagem de login bem-sucedido
    return res.status(200).send("User successfully logged in");
  } else {
    // Retorna uma resposta de erro com o status 208 e uma mensagem de login inválido
    return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  return res.status(300).json({ message: "Yet to be implemented" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
