const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');


public_users.post("/register", (req, res) => {
  // Extract user details from the request body
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
  }

  // Check if the username already exists
  if (users[username]) {
      return res.status(400).json({ message: "Username already exists" });
  }

  // Create a new user object
  const newUser = {
      username,
      password
  };

  // Save the new user to your users database or storage
  // For example, you can store it in a users object for now
  users[username] = newUser;

  // Send a success response
  res.status(200).json({ message: "User registered successfully" });
});


// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  res.send(JSON.stringify(books,null,5));
  return res.status(300).json({message: "Yet to be implemented"});
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  let isbn = req.params.isbn;
  let book = books[isbn];
  if (book) {
      res.send(JSON.stringify(book, null, 4));
  } else {
      res.status(404).json({ message: "Book not found" });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
  const isbn = req.params.isbn;

  try {
      // Make a GET request to fetch the book details based on ISBN
      const response = await axios.get(`http://localhost:5000/books/isbn/${isbn}`);

      // Extract the book data from the response
      const book = response.data;

      // Send the book data as the response
      res.json(book);
  } catch (error) {
      // Handle errors
      console.error("Error fetching book details:", error);
      res.status(500).json({ message: "Internal server error" });
  }
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  let author = req.params.author;
  let matchingBooks = [];

  // Iterate through each book in the books object
  for (let isbn in books) {
      if (books.hasOwnProperty(isbn)) {
          let book = books[isbn];
          // Check if the author of the current book matches the provided author
          if (book.author === author) {
              matchingBooks.push(book);
          }
      }
  }

  if (matchingBooks.length > 0) {
      // Send the matching books as a response
      res.send(JSON.stringify(matchingBooks, null, 4));
  } else {
      // If no matching books found, return a 404 error
      res.status(404).json({ message: "Books by the provided author not found" });
  }
});

// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
  const author = req.params.author;

  try {
      // Make a GET request to fetch the book details based on author
      const response = await axios.get(`http://localhost:5000/books/author/${author}`);

      // Extract the book data from the response
      const books = response.data;

      // Send the book data as the response
      res.json(books);
  } catch (error) {
      // Handle errors
      console.error("Error fetching book details by author:", error);
      res.status(500).json({ message: "Internal server error" });
  }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  let title = req.params.title;
  let matchingBooks = [];

  // Iterate through each book in the books object
  for (let isbn in books) {
      if (books.hasOwnProperty(isbn)) {
          let book = books[isbn];
          // Check if the title of the current book matches the provided title
          if (book.title.toLowerCase().includes(title.toLowerCase())) {
              matchingBooks.push(book);
          }
      }
  }

  if (matchingBooks.length > 0) {
      // Send the matching books as a response
      res.send(JSON.stringify(matchingBooks, null, 4));
  } else {
      // If no matching books found, return a 404 error
      res.status(404).json({ message: "Books with the provided title not found" });
  }
});

public_users.get('/title/:title', async (req, res) => {
  const title = req.params.title;

  try {
      // Make a GET request to fetch the book details based on title
      const response = await axios.get(`http://localhost:5000/books/title/${title}`);

      // Extract the book data from the response
      const books = response.data;

      // Send the book data as the response
      res.json(books);
  } catch (error) {
      // Handle errors
      console.error("Error fetching book details by title:", error);
      res.status(500).json({ message: "Internal server error" });
  }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  let isbn = req.params.isbn;
  let book = books[isbn];

  if (book && book.reviews) {
      // Check if the book with the provided ISBN exists and has reviews
      res.send(JSON.stringify(book.reviews, null, 4));
  } else {
      // If the book doesn't exist or doesn't have reviews, return a 404 error
      res.status(404).json({ message: "Reviews for the provided ISBN not found" });
  }
});


module.exports.general = public_users;
