const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 5000; // Port for the API server
require("dotenv").config();
// Middleware
app.use(cors());
app.use(bodyParser.json());

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
    .then(() => {
      console.log('MongoDB connected');
    })
    .catch((err) => {
      console.error('MongoDB connection error:', err);
    });
// MongoDB Schema & Model
const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  mobile: String
});

const Contact = mongoose.model('Contact', contactSchema);

// API Routes

// Fetch data from MongoDB and JSON (from URL)
app.get('/api/contacts', async (req, res) => {
  try {
    // Fetch contacts from MongoDB
    const contactsFromMongo = await Contact.find();

    // Fetch contacts from the online JSON URL
    axios.get('https://raw.githubusercontent.com/BitcotDev/fresher-machin-test/main/json/sample.json')
      .then(response => {
        const contactsFromJSON = response.data;

        // Merge both sources (optional: you can choose how to handle this)
        const allContacts = [...contactsFromMongo, ...contactsFromJSON];

        res.json(allContacts); // Return combined contacts
      })
      .catch(err => {
        console.log('Error fetching JSON from URL:', err);
        res.status(500).json({ error: 'Error fetching contacts from the URL' });
      });

  } catch (error) {
    console.error('Error fetching contacts from MongoDB:', error);
    res.status(500).json({ error: 'Error fetching contacts from MongoDB' });
  }
});

// Add or update contact
app.post('/api/contacts', async (req, res) => {
  const { id, name, email, mobile } = req.body;

  try {
    if (id) {
      // Update existing contact in MongoDB
      const updatedContact = await Contact.findByIdAndUpdate(id, { name, email, mobile }, { new: true });
      res.json(updatedContact);
    } else {
      // Create new contact in MongoDB
      const newContact = new Contact({ name, email, mobile });
      await newContact.save();
      res.json(newContact);
    }
  } catch (error) {
    console.error('Error saving contact:', error);
    res.status(500).json({ error: 'Error saving contact' });
  }
});

// Delete contact
app.delete('/api/contacts/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await Contact.findByIdAndDelete(id);
    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ error: 'Error deleting contact' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
