const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql');



// Initialize Express
const app = express();

app.use(cors());

// Middleware to parse JSON requests
app.use(bodyParser.json());

//******************************************************************************************************************

// Create a MySQL database connection
const db = mysql.createConnection({
  host: 'sql12.freesqldatabase.com',
  user: 'sql12653349',
  password: 'IHgqAdagty',
  database: 'sql12653349',
});



// Define the 'get-notice' SQL API route to fetch notice data
app.get('/api/get-notices', (req, res) => {
  try {
    // Create an SQL query to select all notices from your SQL database table
    const selectNoticesQuery = 'SELECT * FROM notices';

    // Execute the SQL query to fetch all notices
    db.query(selectNoticesQuery, (err, results) => {
      if (err) {
        console.error('Error fetching notices:', err);
        res.status(500).json({ error: 'An error occurred while fetching notices' });
      } else {
        // Send the fetched notices as a response
        res.status(200).json(results);
      }
    });
  } catch (error) {
    console.error('Error fetching notices:', error);
    res.status(500).json({ error: 'An error occurred while fetching notices' });
  }
});


// Define a route to handle posting a notice
app.post('/api/postnotices', (req, res) => {
  try {
    const { notice } = req.body;

    // Create an SQL query to insert a new notice into the database
    const insertNoticeQuery = 'INSERT INTO notices (text) VALUES (?)';

    // Execute the SQL query to insert the new notice
    db.query(insertNoticeQuery, [notice], (err, result) => {
      if (err) {
        console.error('Error posting notice:', err);
        return res.status(500).json({ error: 'An error occurred while posting notice' });
      }

      res.status(201).json({ message: 'Notice posted successfully' });
    });
  } catch (error) {
    console.error('Error posting notice:', error);
    res.status(500).json({ error: 'An error occurred while posting notice' });
  }
});




//***********************************************************************************************************************




// Connect to MongoDB
mongoose.connect('mongodb+srv://admin:1234@zillaassociation.u906vbl.mongodb.net/ZA?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB', err);
  });




// Define a schema for Admin data ----------------------------------------------
const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

// Create a Mongoose model based on the schema
const Admin = mongoose.model('Admin', adminSchema);






// Define a schema and model for your data----------------------------------------
const memberSchema = new mongoose.Schema({
  id: {
    type: Number,
    
  },
  name: {
    type: String,
    
  },
  dept: {
    type: String,
    
  },
  email: {
    type: String,
   
  },
  phone: String,
  facebook: String,
  linkedin: String,
  about: String,
  password: {
    type: String,
  },
  image: String, 
  requested:{
    type:Number,
  },
  borrowed:{
    type:Number,
  }
});


// Create a Mongoose model based on the schema
const Member = mongoose.model('Member', memberSchema);


// Define a schema and model for your book data-----------------------------
const bookSchema = new mongoose.Schema({
  id: {
    type: Number,
  },
  name: {
    type: String,
  },
  author: {
    type: String,
  },
  edition: {
    type: Number,
  },
  image: String,
  total: {
    type: Number,
  },
  available: {
    type: Number,
  },
  borrowed:[
    {
      id: String,
      date: String
    }
  ],
  requested:[
    {
      id: String,
      date: String
    }
  ],
});

// Create a Mongoose model based on the schema
const Book = mongoose.model('Book', bookSchema);


// Define a schema and model for your event data ----------------------
const eventSchema = new mongoose.Schema({
  id: {
    type: Number,
  },
  name: {
    type: String,
  },
  date: {
    type: Date,
  },
  location: {
    type: String,
  },
  image: String,
  details: String,
  organizer: String,
});

// Create a Mongoose model based on the schema
const Event = mongoose.model('Event', eventSchema);


//transection schema ---------------------------------------------
const transactionSchema = new mongoose.Schema({
  id: {
    type: Number,
  },
  reference: {
    type: String,
  },
  amount: {
    type: Number,
  },
  type: {
    type: String,
    enum: ["Income", "Expense"],
  },
  date: {
    type: Date,
  },
  details: String,
});

// Create a Mongoose model based on the schema
const Transaction = mongoose.model('Transaction', transactionSchema);

// Define a schema for notice data
const noticeSchema = new mongoose.Schema({
  text: String,
});

// Create a Mongoose model based on the schema
const Notice = mongoose.model('Notice', noticeSchema);



// Define a route to handle member registration
app.post('/api/member', async (req, res) => {
  try {
    const {
      id,
      name,
      dept,
      email,
      phone,
      facebook,
      linkedin,
      about,
      password,
      image,
    } = req.body;


    // Create a new member instance with the registration data
    const newMember = new Member({
      id,
      name,
      dept,
      email,
      phone,
      facebook,
      linkedin,
      about,
      password,
      image,
      requested:0,
      borrowed:0
    });

    // Save the new member to the database
    await newMember.save();
    res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'An error occurred during registration' });
  }
});



// Define a route to handle user login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find a member with the provided email address
    const member = await Member.findOne({ email });

    if (!member) {
      // If no member with the provided email exists, send an error response
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Check if the provided password matches the stored password
    if (password === member.password) {
      // Authentication successful
      res.status(200).json({ success: true, message: 'Login successful', id: member.id});
    } else {
      // Authentication failed
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'An error occurred during login' });
  }
});




// Define a route to delete a member by ID
app.delete('/api/delete-member/:id', async (req, res) => {
  try {
    const memberIdToDelete = req.params.id;

    // Find and delete the member by ID
    const deletedMember = await Member.findOneAndDelete({ id: memberIdToDelete });

    if (!deletedMember) {
      // If no member was deleted (i.e., no member with that ID exists), send an error response
      res.status(404).json({ error: `ID = ${memberIdToDelete} doesn't exist` });
    } else {
      res.status(200).json({ message: 'Member deleted successfully' });
    }
  } catch (error) {
    console.error('Error deleting member:', error);
    res.status(500).json({ error: 'An error occurred while deleting member' });
  }
});






// Define a route to get all members from the database sorted by id
app.get('/api/get-all-members', async (req, res) => {
  try {
    // Fetch all members from the MongoDB database and sort by id in ascending order
    const members = await Member.find({}).sort({ id: 1 });

    res.status(200).json(members);
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ error: 'An error occurred while fetching members' });
  }
});


// Define a route to fetch member information by ID
app.get('/api/members/:id', async (req, res) => {
  try {
    const memberId = parseInt(req.params.id); // Convert the string-based ID to a number
    const memberInfo = await Member.findOne({ id: memberId });
    if (!memberInfo) {
      res.status(404).json({ error: 'Member not found' });
    } else {
      res.status(200).json(memberInfo);
    }
  } catch (error) {
    console.error('Error fetching member information:', error);
    res.status(500).json({ error: 'An error occurred while fetching member information' });
  }
});



//--------------------------------------------------------------------------------

// Define a route to add a book to the library
app.post('/api/add-book', async (req, res) => {
  try {
    const newBook = new Book(req.body);
    console.log(newBook)
    await newBook.save();
    res.status(201).json({ message: 'Book data saved successfully' });
  } catch (error) {
    console.error('Error saving book data:', error);
    res.status(500).json({ error: 'An error occurred while saving book data' });
  }
});


// Define the API endpoint to add a user ID and current date to a book's requested array
app.post('/api/add-requested/:bookId/:userId', async (req, res) => {
  try {
    const { bookId, userId } = req.params;

    // Find the book by its ID
    const book = await Book.findOne({ id: bookId });
    const member = await Member.findOne({ id: userId });

    // Check if the user is already in the requested list of the book
    const isAlreadyRequested = book.requested.some((req) => req.id === userId);
    const isAlreadyBorrowed = book.borrowed.some((br) => br.id === userId);

    if (!book) {
      return res.json({ message: 'Book not found' });
    }

    if (isAlreadyRequested) {
      return res.json({ message: 'Already Requested' });
    }
    if (isAlreadyBorrowed) {
      return res.json({ message: 'Already Borrowed' });
    }

    
    if (member.requested>=3) {
      return res.json({ message: 'Request limit exceed' });
    }
    if (member.borrowed>=3) {
      return res.json({ message: 'Borrow limit exceed' });
    }

    // Add the user ID and current date to the requested array
    book.requested.push({ id: userId, date: new Date().toISOString() });
    // Save the updated book document
    await book.save();

    member.requested+=1;
    await member.save();


    return res.json({ message: 'successfully requested' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Define the API endpoint to remove a user ID from a book's requested array
app.post('/api/remove-requested/:bookId/:userId', async (req, res) => {
  try {
    const { bookId, userId } = req.params;

    // Find the book by its ID
    const book = await Book.findOne({ id: bookId });
    const member = await Member.findOne({ id: userId });

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Find the index of the user ID in the requested array
    const index = book.requested.findIndex((request) => request.id === userId);

    if (index === -1) {
      return res.status(404).json({ message: 'User ID not found in the requested array' });
    }

    // Remove the user ID from the requested array
    book.requested.splice(index, 1);

    // Save the updated book document
    await book.save();
    member.requested-=1;
    await member.save();

    return res.json({ message: 'User removed from the requested list' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});




// Define the API endpoint to remove a user ID from a book's requested array
app.post('/api/release-requested/:bookId/:userId', async (req, res) => {
  try {
    const { bookId, userId } = req.params;

    // Find the book by its ID
    const book = await Book.findOne({ id: bookId });
    const member = await Member.findOne({ id: userId });

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Find the index of the user ID in the requested array
    const index = book.borrowed.findIndex((br) => br.id === userId);

    if (index === -1) {
      return res.status(404).json({ message: 'User ID not found in the requested array' });
    }


    // Remove the user ID from the requested array
    book.borrowed.splice(index, 1);
    
    book.available+=1;
    // Save the updated book document
    await book.save();


    member.borrowed-=1
    await member.save();

    return res.json({ message: 'User released successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});




// Define the API endpoint to remove a user ID from a book's requested array and add it to the borrowed list
app.post('/api/accept-requested/:bookId/:userId', async (req, res) => {
  try {
    const { bookId, userId } = req.params;

    // Find the book by its ID
    const book = await Book.findOne({ id: bookId });
    const member = await Member.findOne({ id: userId });


    if (!book || member.borrowed>=3) {
      return res.status(404).json({ message: 'Book not found' });
    }
    if (member.borrowed>=3) {
      return res.status(404).json({ message: 'Borrow limit exceed' });
    }

    // Find the index of the user ID in the requested array
    const requestedIndex = book.requested.findIndex((req) => req.id === userId);

    if (requestedIndex === -1) {
      return res.status(404).json({ message: 'User not found in requested list' });
    }

    // Remove the user ID from the requested array and add it to the borrowed list with the current date
    const removedUser = book.requested.splice(requestedIndex, 1)[0];
    book.borrowed.push({ id: removedUser.id, date: new Date().toISOString() });

    book.available-=1;
    // Save the updated book document
    await book.save();

    member.requested-=1
    member.borrowed+=1

    await member.save();

    return res.json({ message: 'User added to the borrowed list ' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});





// Define a route to delete a book by ID
app.delete('/api/delete-book/:id', async (req, res) => {
  try {
    const bookIdToDelete = req.params.id;

    // Find and delete the book by ID
    const deletedBook = await Book.findOneAndDelete({ id: bookIdToDelete });

    if (!deletedBook) {
      // If no book was deleted (i.e., no book with that ID exists), send an error response
      res.status(404).json({ error: `Book with ID ${bookIdToDelete} doesn't exist` });
    } else {
      res.status(200).json({ message: 'Book deleted successfully' });
    }
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ error: 'An error occurred while deleting book' });
  }
});


// Define a route to get all books from the database sorted by id
app.get('/api/get-all-books', async (req, res) => {
  try {
    // Fetch all books from the MongoDB database and sort by id in ascending order
    const books = await Book.find({}).sort({ id: 1 });

    res.status(200).json(books);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ error: 'An error occurred while fetching books' });
  }
});



// Define a route to add an event ------------------------------
app.post('/api/add-event', async (req, res) => {
  try {
    const newEvent = new Event(req.body);
    console.log(newEvent)
    await newEvent.save();
    res.status(201).json({ message: 'Event data saved successfully' });
  } catch (error) {
    console.error('Error saving event data:', error);
    res.status(500).json({ error: 'An error occurred while saving event data' });
  }
});

// Define a route to delete an event by ID
app.delete('/api/delete-event/:id', async (req, res) => {
  try {
    const eventIdToDelete = req.params.id;

    // Find and delete the event by ID
    const deletedEvent = await Event.findOneAndDelete({ id: eventIdToDelete });

    if (!deletedEvent) {
      // If no event was deleted (i.e., no event with that ID exists), send an error response
      res.status(404).json({ error: `Event with ID ${eventIdToDelete} doesn't exist` });
    } else {
      res.status(200).json({ message: 'Event deleted successfully' });
    }
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'An error occurred while deleting event' });
  }
});

// Define a route to get all events from the database sorted by id
app.get('/api/get-all-events', async (req, res) => {
  try {
    // Fetch all events from the MongoDB database and sort by id in ascending order
    const events = await Event.find({}).sort({ id: 1 });

    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'An error occurred while fetching events' });
  }
});



// Define a route to add a transaction ------------------------------
app.post('/api/add-transaction', async (req, res) => {
  try {
    const newTransaction = new Transaction(req.body);
    await newTransaction.save();
    res.status(201).json({ message: 'Transaction data saved successfully' });
  } catch (error) {
    console.error('Error saving transaction data:', error);
    res.status(500).json({ error: 'An error occurred while saving transaction data' });
  }
});



// Define a route to get all transactions from the database sorted by id
app.get('/api/get-all-transactions', async (req, res) => {
  try {
    // Fetch all transactions from the MongoDB database and sort by id in ascending order
    const transactions = await Transaction.find({}).sort({ id: 1 });

    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'An error occurred while fetching transactions' });
  }
});




// Define a route to handle posting a notice
app.post('/api/postnotice', async (req, res) => {
  try {
    const { notice } = req.body;

    // Create a new Notice instance
    const newNotice = new Notice({
      text: notice,
    });

    // Save the new notice to the database
    await newNotice.save();

    res.status(201).json({ message: 'Notice posted successfully' });
  } catch (error) {
    console.error('Error posting notice:', error);
    res.status(500).json({ error: 'An error occurred while posting notice' });
  }
});


// Define the 'get-notice' API route to fetch notice data
app.get('/api/get-notice', async (req, res) => {
  try {
      const notices = await Notice.find(); // Fetch all notices from the MongoDB database
      res.status(200).json(notices);
  } catch (error) {
      console.error('Error fetching notices:', error);
      res.status(500).json({ error: 'An error occurred while fetching notices' });
  }
});







// Define a route to handle user updates
app.put('/api/update-admin', async (req, res) => {
  try {
    const { name, password, nname, npassword } = req.body;

    // Find a member with the provided old username and old password
    const admin = await Admin.findOne({ name: name, password: password });

    if (!admin) {
      // If no member with the provided old credentials exists, send an error response
      res.status(401).json({ error: 'Invalid old credentials' });
      return;
    }

    // Update the member's username and password
    admin.name = nname;
    admin.password = npassword;

    // Save the updated member to the database
    await admin.save();

    // Send a success response
    res.status(200).json({ success: true, message: 'User information updated successfully' });
  } catch (error) {
    console.error('Error updating user information:', error);

    // Provide a more detailed error response
    res.status(500).json({ error: 'An error occurred while updating user information', details: error.message });
  }
});




// Define a route to handle admin authentication
app.post('/api/login-admin', async (req, res) => {
  try {
    const { name, password } = req.body;
    // Find an admin with the provided username and password
    const admin = await Admin.findOne({ name, password });

    if (!admin) {
      // If no admin with the provided credentials exists, send an error response
      res.status(401).json({ error: 'Invalid admin credentials' });
      return;
    }

    // Authentication successful
    res.status(200).json({ success: true, message: 'Admin authentication successful' });
  } catch (error) {
    console.error('Error during admin authentication:', error);
    res.status(500).json({ error: 'An error occurred during admin authentication' });
  }
});





// Start the Express server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});