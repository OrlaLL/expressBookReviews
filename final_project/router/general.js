const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (isValid(username)) {
    return res.status(409).json({ message: "Username already exists" });
  }
  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });

});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  // Cria uma promessa para buscar a lista de livros
  let bookList = new Promise((resolve, reject) => {
    resolve(books);
  });
  // Quando a promessa for resolvida, envia a lista de livros como resposta
  bookList.then((books) => {
    res.send(JSON.stringify(books, null, 4));
  }).catch((err) => {
    console.error(err);
    res.status(500).json({ message: "Error retrieving book list" });
  });

});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  // Extrai o ISBN dos parâmetros da solicitação
  const isbn = req.params.isbn;
  // Se o ISBN não for fornecido ou não existir no banco de dados, retorna um erro 404
  if (!isbn) {
    return res.status(404).json({ message: "ISBN not provided" });
  }
  // Cria uma promessa para buscar o livro com base no ISBN fornecido
  const bookItem = new Promise((resolve, reject) => {
    // Verifica se o livro existe no banco de dados
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      // Se o livro não for encontrado, rejeita a promessa com um erro
      reject(new Error("Book not found"));
    }
  });
  // Quando a promessa for resolvida, envia os detalhes do livro como resposta
  bookItem.then((book) => {
    res.send(JSON.stringify(book, null, 4));
  }).catch((err) => {
    console.error(err);
    res.status(404).json({ message: "Book not found" });
  });

});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  if (!author) {
    return res.status(404).json({ message: "Author not found" });
  }
  // Cria uma promessa para buscar os livros do autor especificado
  let booksByAuthor = new Promise((resolve, reject) => {
    const filteredBooks = Object.values(books).filter(book => book.author === author);
    // Se nenhum livro for encontrado para o autor, rejeita a promessa com um erro
    if (filteredBooks.length === 0) {
      reject(new Error("No books found for this author"));
    } else {
      resolve(filteredBooks);
    }
  });
  // Quando a promessa for resolvida, envia os livros como resposta
  booksByAuthor.then((books) => {
    res.status(200).send(JSON.stringify(books, null, 2));
  }).catch((err) => {
    console.error(err);
    res.status(404).json({ message: "No books found for this author" });
  });
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  if (!title) {
    return res.status(404).json({ message: "Title not found" });
  }
  // Cria uma promessa para buscar os livros com base no título fornecido
  let booksByTitle = new Promise((resolve, reject) => {
    const filteredBooks = Object.values(books).filter(book => book.title === title);
    // Se nenhum livro for encontrado com o título fornecido, rejeita a promessa com um erro
    if (filteredBooks.length === 0) {
      reject(new Error("No books found with this title"));
    } else {
      resolve(filteredBooks);
    }
  });
  // Quando a promessa for resolvida, envia os livros como resposta
  booksByTitle.then((books) => {
    res.status(200).send(JSON.stringify(books, null, 2));
  }).catch((err) => {
    console.error(err);
    res.status(404).json({ message: "No books found with this title" });
  });
});
  

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (!isbn || !books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }
  res.status(200).send(JSON.stringify(books[isbn].reviews, null, 2));
});

module.exports.general = public_users;
