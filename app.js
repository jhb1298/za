const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql');

// Initialize Express
const app = express();
app.use(cors());
app.use(bodyParser.json());



// Connect to MongoDB
mongoose.connect('mongodb+srv://admin:1234@zillaassociation.u906vbl.mongodb.net/ZA?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Error connecting to MongoDB', err);
});



// Define schemas and models
const adminSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
const Admin = mongoose.model('Admin', adminSchema);

const memberSchema = new mongoose.Schema({
  id: { type: Number },
  name: { type: String },
  dept: { type: String },
  email: { type: String },
  phone: String,
  facebook: String,
  linkedin: String,
  about: String,
  password: { type: String },
  image: String,
  requested: { type: Number, default: 0 },
  borrowed: { type: Number, default: 0 },
});
const Member = mongoose.model('Member', memberSchema);

const bookSchema = new mongoose.Schema({
  id: { type: Number },
  name: { type: String },
  author: { type: String },
  edition: { type: Number },
  image: String,
  total: { type: Number },
  available: { type: Number },
  borrowed: [{ id: String, date: String }],
  requested: [{ id: String, date: String }],
});
const Book = mongoose.model('Book', bookSchema);

const eventSchema = new mongoose.Schema({
  id: { type: Number },
  name: { type: String },
  date: { type: Date },
  location: { type: String },
  image: String,
  details: String,
  organizer: String,
});
const Event = mongoose.model('Event', eventSchema);

const transactionSchema = new mongoose.Schema({
  id: { type: Number },
  reference: { type: String },
  amount: { type: Number },
  type: { type: String, enum: ["Income", "Expense"] },
  date: { type: Date },
  details: String,
});
const Transaction = mongoose.model('Transaction', transactionSchema);

const noticeSchema = new mongoose.Schema({ text: String });
const Notice = mongoose.model('Notice', noticeSchema);



// Define routes for MongoDB models

// Notice routes
app.get('/api/get-notices', async (req, res) => {
  try {
    const notices = await Notice.find({});
    res.status(200).json(notices);
  } catch (error) {
    console.error('Error fetching notices:', error);
    res.status(500).json({ error: 'An error occurred while fetching notices' });
  }
});

app.post('/api/postnotices', async (req, res) => {
  const { notice } = req.body;
  const newNotice = new Notice({ text: notice });
  try {
    await newNotice.save();
    res.status(201).json({ message: 'Notice posted successfully' });
  } catch (error) {
    console.error('Error posting notice:', error);
    res.status(500).json({ error: 'An error occurred while posting notice' });
  }
});

// Transaction routes
app.post('/api/add_transactions', async (req, res) => {
  const newTransaction = new Transaction(req.body);
  try {
    await newTransaction.save();
    res.status(201).json({ message: 'Transaction data saved successfully' });
  } catch (error) {
    console.error('Error saving transaction data:', error);
    res.status(500).json({ error: 'An error occurred while saving transaction data' });
  }
});

app.get('/api/get-all-transactions', async (req, res) => {
  try {
    const transactions = await Transaction.find({}).sort({ id: 1 });
    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'An error occurred while fetching transactions' });
  }
});

// Member routes
app.post('/api/member', async (req, res) => {
  const newMember = new Member(req.body);
  try {
    await newMember.save();
    res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'An error occurred during registration' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const member = await Member.findOne({ email });
    if (member && password === member.password) {
      res.status(200).json({ success: true, message: 'Login successful', id: member.id });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'An error occurred during login' });
  }
});

app.delete('/api/delete-member/:id', async (req, res) => {
  const memberIdToDelete = req.params.id;
  try {
    const deletedMember = await Member.findOneAndDelete({ id: memberIdToDelete });
    if (!deletedMember) {
      res.status(404).json({ error: `ID = ${memberIdToDelete} doesn't exist` });
    } else {
      res.status(200).json({ message: 'Member deleted successfully' });
    }
  } catch (error) {
    console.error('Error deleting member:', error);
    res.status(500).json({ error: 'An error occurred while deleting member' });
  }
});

app.get('/api/get-all-members', async (req, res) => {
  try {
    const members = await Member.find({}).sort({ id: 1 });
    res.status(200).json(members);
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ error: 'An error occurred while fetching members' });
  }
});

app.get('/api/members/:id', async (req, res) => {
  const memberId = parseInt(req.params.id);
  try {
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

// Book routes
app.post('/api/add-book', async (req, res) => {
  const newBook = new Book(req.body);
  try {
    await newBook.save();
    res.status(201).json({ message: 'Book data saved successfully' });
  } catch (error) {
    console.error('Error saving book data:', error);
    res.status(500).json({ error: 'An error occurred while saving book data' });
  }
});


//may be unnacecery
app.post('/api/add-requested/:bookId/:userId', async (req, res) => {
  const { bookId, userId } = req.params;
  try {
    const book = await Book.findOne({ id: bookId });
    const member = await Member.findOne({ id: userId });

    if (!book || !member) {
      return res.status(404).json({ message: 'Book or Member not found' });
    }

    const isAlreadyRequested = book.requested.some((req) => req.id === userId);
    const isAlreadyBorrowed = book.borrowed.some((br) => br.id === userId);

    if (isAlreadyRequested || isAlreadyBorrowed || member.requested >= 3 || member.borrowed >= 3) {
      return res.status(400).json({ message: 'Request limit exceeded or already requested/borrowed' });
    }

    book.requested.push({ id: userId, date: new Date() });
    member.requested += 1;

    await book.save();
    await member.save();

    res.status(200).json({ message: 'Book requested successfully' });
  } catch (error) {
    console.error('Error requesting book:', error);
    res.status(500).json({ error: 'An error occurred while requesting book' });
  }
});

//may be unnacecery
app.post('/api/add-borrowed/:bookId/:userId', async (req, res) => {
  const { bookId, userId } = req.params;
  try {
    const book = await Book.findOne({ id: bookId });
    const member = await Member.findOne({ id: userId });

    if (!book || !member) {
      return res.status(404).json({ message: 'Book or Member not found' });
    }

    const isAlreadyBorrowed = book.borrowed.some((br) => br.id === userId);

    if (isAlreadyBorrowed || book.available === 0 || member.borrowed >= 3) {
      return res.status(400).json({ message: 'Borrow limit exceeded or book not available' });
    }

    book.borrowed.push({ id: userId, date: new Date() });
    book.available -= 1;
    member.borrowed += 1;

    await book.save();
    await member.save();

    res.status(200).json({ message: 'Book borrowed successfully' });
  } catch (error) {
    console.error('Error borrowing book:', error);
    res.status(500).json({ error: 'An error occurred while borrowing book' });
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
  
  
  
  



app.get('/api/get-all-books', async (req, res) => {
  try {
    const books = await Book.find({}).sort({ id: 1 });
    res.status(200).json(books);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ error: 'An error occurred while fetching books' });
  }
});

// Event routes
app.post('/api/add-event', async (req, res) => {
  const newEvent = new Event(req.body);
  try {
    await newEvent.save();
    res.status(201).json({ message: 'Event data saved successfully' });
  } catch (error) {
    console.error('Error saving event data:', error);
    res.status(500).json({ error: 'An error occurred while saving event data' });
  }
});

app.get('/api/get-all-events', async (req, res) => {
  try {
    const events = await Event.find({}).sort({ id: 1 });
    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'An error occurred while fetching events' });
  }
});

// Transaction routes
app.post('/api/add-transactions', async (req, res) => {
  const newTransaction = new Transaction(req.body);
  try {
    await newTransaction.save();
    res.status(201).json({ message: 'Transaction data saved successfully' });
  } catch (error) {
    console.error('Error saving transaction data:', error);
    res.status(500).json({ error: 'An error occurred while saving transaction data' });
  }
});

app.get('/api/get-all-transactions', async (req, res) => {
  try {
    const transactions = await Transaction.find({}).sort({ id: 1 });
    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'An error occurred while fetching transactions' });
  }
});

// Notice routes
app.post('/api/add-notices', async (req, res) => {
  const newNotice = new Notice(req.body);
  try {
    await newNotice.save();
    res.status(201).json({ message: 'Notice data saved successfully' });
  } catch (error) {
    console.error('Error saving notice data:', error);
    res.status(500).json({ error: 'An error occurred while saving notice data' });
  }
});

app.get('/api/get-all-notices', async (req, res) => {
  try {
    const notices = await Notice.find({});
    res.status(200).json(notices);
  } catch (error) {
    console.error('Error fetching notices:', error);
    res.status(500).json({ error: 'An error occurred while fetching notices' });
  }
});

// Admin routes
app.post('/api/admin-login', async (req, res) => {
  const { name, password } = req.body;
  try {
    const admin = await Admin.findOne({ name });
    if (admin && password === admin.password) {
      res.status(200).json({ success: true, message: 'Admin login successful' });
    } else {
      res.status(401).json({ error: 'Invalid admin credentials' });
    }
  } catch (error) {
    console.error('Error during admin login:', error);
    res.status(500).json({ error: 'An error occurred during admin login' });
  }
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
