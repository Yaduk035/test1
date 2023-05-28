const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config();

// Connect to MongoDB Atlas
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB Atlas');
  } catch (error) {
    console.log('Error connecting to MongoDB Atlas:', error);
    process.exit(1);
  }
};

// Define the schema for the data
const schema = new mongoose.Schema({
  username: String,
  otp: Number,
});

// Define the model for the data
const Model = mongoose.model('Data', schema);

// Create an instance of Express.js
const app = express();
app.use(express.json());

// Enable CORS
app.use(cors());

// Serve static files from the build directory
app.use(express.static(path.join(__dirname, 'src', 'build')));

// GET request handler
app.get('/data', async (req, res) => {
  try {
    // Retrieve all data from the database
    const data = await Model.find({});
    res.json(data);
  } catch (error) {
    console.log('Error retrieving data:', error);
    res.status(500).json({ error: 'Error retrieving data' });
  }
});

// POST request handler
app.post('/data', async (req, res) => {
  try {
    // Create a new data instance based on the JSON payload
    const newData = new Model(req.body);

    // Save the new data to the database
    await newData.save();

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PWD,
      },
    });

    const mailOptions = {
      from: 'Yadukrishna',
      to: newData.username, // Assuming the email is passed in the request body
      subject: 'OTP Verification',
      text: `Thank you for choosing our service,\nYour OTP is: ${req.body.otp}`, // Assuming the OTP is passed in the request body
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });

    res.json(newData);
  } catch (error) {
    console.log('Error saving data:', error);
    res.status(500).json({ error: 'Error saving data' });
  }
});

// Serve the React app for any other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'build', 'index.html'));
});

// Connect to the database before starting the server
connectDB()
  .then(() => {
    // Start the server
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.log('Error connecting to the database:', error);
  });
