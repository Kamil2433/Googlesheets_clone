const express = require('express');
const router = express.Router();
const Spreadsheet = require('../schema/Spreadsheet');
const Cell = require('../schema/Cell');

router.post('/', async (req, res) => {
  try {
    const spreadsheet = new Spreadsheet({
      name: req.body.name || 'Untitled Spreadsheet',
      cells: []
    });
    await spreadsheet.save();
    res.status(201).json(spreadsheet);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const spreadsheets = await Spreadsheet.find().sort({ createdAt: -1 });
    res.json(spreadsheets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

///fetch all cells






router.post('/cells', async (req, res) => {
  try {
    const { id } = req.body; // Spreadsheet ID from request body

    if (!id) {
      return res.status(400).json({ message: 'Spreadsheet ID is required' });
    }

    const cells = await Cell.find({ spreadsheet: id });

    if (!cells.length) {
      return res.status(404).json({ message: 'No cells found for this spreadsheet' });
    }

    res.json(cells);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.put('/:id', async (req, res) => {
  try {
    const spreadsheet = await Spreadsheet.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          name: req.body.name,
          cells: req.body.cells,
          updatedAt: Date.now()
        }
      },
      { new: true }
    );
    if (!spreadsheet) return res.status(404).json({ message: 'Spreadsheet not found' });
    res.json(spreadsheet);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.patch('/cells', async (req, res) => {
  try {
    const { id, updates } = req.body; // Extract spreadsheet ID from request body

    if (!id) {
      return res.status(400).json({ message: 'Spreadsheet ID is required' });
    }

    const spreadsheet = await Spreadsheet.findById(id);
    if (!spreadsheet) {
      return res.status(404).json({ message: 'Spreadsheet not found' });
    }

    for (const update of updates) {
      let cell = await Cell.findOne({ spreadsheet: id, row: update.row, col: update.col });
      if (cell) {
        // Update existing cell

        if (update.content !== undefined) cell.content = update.content;
        if (update.formula !== undefined) cell.formula = update.formula;
        if (update.style) {
          if (update.style.bold !== undefined) cell.style.bold = update.style.bold;
          if (update.style.italic !== undefined) cell.style.italic = update.style.italic;
          if (update.style.underline !== undefined) cell.style.underline = update.style.underline;
          if (update.style.fontsize !== undefined) cell.style.fontsize = update.style.fontsize;
          if (update.style.textColor !== undefined) cell.style.textColor = update.style.textColor;
          if (update.style.bgColor !== undefined) cell.style.bgColor = update.style.bgColor;
        }
        await cell.save();
      } else {
        // Create a new cell and add its reference to the spreadsheet
        cell = new Cell({
          spreadsheet: id,
          row: update.row,
          col: update.col,
          content: update.content || '',
          style: {
            bold: update.style?.bold || false,
            italic: update.style?.italic || false,
            underline: update.style?.underline || false,
            fontsize: update.style?.fontsize || 12,
            textColor: update.style?.textColor || '#000000',
            bgColor: update.style?.bgColor || '#ffffff',
          },
          formula: update.formula || ''
        });
      
        await cell.save();
        spreadsheet.cells.push(cell._id); // Add cell reference to the spreadsheet
      }
      
    }

    await spreadsheet.save();
    res.json({ message: 'Cells updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Update rows (add/delete)
router.patch('/:id/rows', async (req, res) => {
  try {
    const spreadsheet = await Spreadsheet.findById(req.params.id);
    if (!spreadsheet) return res.status(404).json({ message: 'Spreadsheet not found' });

    const { action, index, count = 1 } = req.body;
    
    if (action === 'add') {
      // Shift rows down
      spreadsheet.cells.forEach(cell => {
        if (cell.row >= index) cell.row += count;
      });
    } else if (action === 'delete') {
      // Remove cells in deleted rows and shift up
      spreadsheet.cells = spreadsheet.cells.filter(cell => 
        !(cell.row >= index && cell.row < index + count)
      );
      spreadsheet.cells.forEach(cell => {
        if (cell.row >= index + count) cell.row -= count;
      });
    }

    const updatedSpreadsheet = await spreadsheet.save();
    res.json(updatedSpreadsheet);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update columns (add/delete)
router.patch('/:id/columns', async (req, res) => {
  try {
    const spreadsheet = await Spreadsheet.findById(req.params.id);
    if (!spreadsheet) return res.status(404).json({ message: 'Spreadsheet not found' });

    const { action, index, count = 1 } = req.body;
    
    if (action === 'add') {
      spreadsheet.cells.forEach(cell => {
        if (cell.col >= index) cell.col += count;
      });
    } else if (action === 'delete') {
      spreadsheet.cells = spreadsheet.cells.filter(cell => 
        !(cell.col >= index && cell.col < index + count)
      );
      spreadsheet.cells.forEach(cell => {
        if (cell.col >= index + count) cell.col -= count;
      });
    }

    const updatedSpreadsheet = await spreadsheet.save();
    res.json(updatedSpreadsheet);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update metadata (name)
router.patch('/:id/metadata', async (req, res) => {
  try {
    const spreadsheet = await Spreadsheet.findByIdAndUpdate(
      req.params.id,
      { $set: { name: req.body.name } },
      { new: true }
    );
    if (!spreadsheet) return res.status(404).json({ message: 'Spreadsheet not found' });
    res.json(spreadsheet);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});




module.exports = router;