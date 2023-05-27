const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB Atlas');
}).catch((error) => {
  console.log('Error connecting to MongoDB Atlas:', error);
});

// Define the schema for the data
const schema = new mongoose.Schema({
  username: String,
  otp: Number
});

// Define the model for the data
const Model = mongoose.model('Data', schema);

// Create an instance of Express.js
const app = express();
app.use(express.json());

// Enable CORS
app.use(cors());

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
        user: 'yaduk946@gmail.com',
        pass: 'jjrpaoqeaiwgslbj'
      }
    });

    const mailOptions = {
      from: 'Yadukrishna',
      to: newData.username, // Assuming the email is passed in the request body
      subject: 'OTP Verification',
      text: `Thank you for choosing our service,
      Your OTP is: ${req.body.otp}` // Assuming the OTP is passed in the request body
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

// Start the server
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
