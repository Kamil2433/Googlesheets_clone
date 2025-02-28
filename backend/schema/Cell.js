const mongoose = require('mongoose');

const CellSchema = new mongoose.Schema({
  spreadsheet: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Spreadsheet', // Reference to the Spreadsheet model
    required: true 
  },
  row: { type: Number, required: true },
  col: { type: Number, required: true },
  content: { type: String, default: '' },
  style: {
    bold: { type: Boolean, default: false },
    italic: { type: Boolean, default: false },
    underline: { type: Boolean, default: false },
    fontsize: { type: Number, default: 12 },
    textColor: { type: String, default: '#000000' },
    bgColor: { type: String, default: '#ffffff' }
  },
  formula: { type: String, default: '' }
});

module.exports = mongoose.model('Cell', CellSchema);
