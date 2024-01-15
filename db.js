const mongoose = require("mongoose");



const connecton = () => {
    mongoose.connect('mongodb+srv://daksh1or2:test@cluster0.dnlvrf0.mongodb.net/?retryWrites=true&w=majority', {
      
    });
  
    const db = mongoose.connection;
  
    db.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
  
    db.once('open', () => {
      console.log('MongoDB connected successfully');
    });
  };
  
module.exports =connecton
