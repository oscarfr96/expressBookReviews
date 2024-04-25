const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
  { username: "john_doe", password: "password123" }
];


const isValid = (username) => {
    // Check if the username is valid
    // For example, you can check if the username meets certain criteria
    // This function can be implemented based on your application's requirements
    return true; // Placeholder implementation
}

const authenticatedUser = (username, password) => {
    // Check if the username and password match the ones in our records
    // This function should verify the username and password against the stored user data
    // For simplicity, let's assume users are stored in the `users` array with username and password properties
    const user = users.find(user => user.username === username && user.password === password);
    return !!user; // Returns true if user is found, false otherwise
}

// Only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    // Check if the username is valid
    if (!isValid(username)) {
        return res.status(400).json({ message: "Invalid username" });
    }

    // Check if the username and password match
    if (authenticatedUser(username, password)) {
        // Generate JWT token for the user
        const token = jwt.sign({ username: username }, 'your_secret_key');

        // Send the JWT token in the response
        res.status(200).json({ message: "Login successful", token: token });
    } else {
        // If the username and password don't match, send an error response
        res.status(401).json({ message: "Invalid username or password" });
    }
});

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  // Check if the user is authenticated (JWT token exists in the session)
  if (req.session.authorization && req.session.authorization.accessToken) {
      // Decode the JWT token to get the username
      jwt.verify(req.session.authorization.accessToken, 'your_secret_key', (err, decoded) => {
          if (err) {
              return res.status(403).json({ message: "Unauthorized" });
          }
          req.user = decoded;
          next();
      });
  } else {
      return res.status(403).json({ message: "Unauthorized" });
  }
};

// Add or modify a book review
regd_users.put("/auth/review/:isbn", isAuthenticated, (req, res) => {
  const username = req.user.username; // Get the username from the JWT token in the session
  const isbn = req.params.isbn; // Get the ISBN from the request params
  const review = req.query.review; // Get the review from the request query

  // Check if the ISBN exists in the books database
  if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
  }

  // Check if the user has already posted a review for the same ISBN
  if (bookReviews[isbn] && bookReviews[isbn][username]) {
      // Modify the existing review for the user
      bookReviews[isbn][username] = review;
      return res.status(200).json({ message: "Review modified successfully" });
  } else {
      // Add a new review for the user
      if (!bookReviews[isbn]) {
          bookReviews[isbn] = {};
      }
      bookReviews[isbn][username] = review;
      return res.status(200).json({ message: "Review added successfully" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
