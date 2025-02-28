const mongoose = require('mongoose');
const CellSchema = require('./Cell');

const SpreadsheetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cells: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Cell' }], // References to Cell documents
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

SpreadsheetSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Spreadsheet', SpreadsheetSchema);