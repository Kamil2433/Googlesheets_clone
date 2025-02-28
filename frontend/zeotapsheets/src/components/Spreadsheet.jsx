import { useState, useRef, useEffect } from "react";
import "./Spreadsheet.css";
import axios from "axios";
import envVariables from "../helper/ApiKey";

const Spreadsheet = ({
  Setunsavedchangesparent,
  currentspreadsheet,
  updateSpreadsheetCells,
  savebuttoncnt,
  redotrigger,
  undotrigger,
  editorState,
  textFormattingState,
  toReplace,
  replaceWith,
  replacecount,
}) => {
  const ROWS = 52;
  const COLS = 26;
  const colHeaders = Array.from({ length: COLS }, (_, i) =>
    String.fromCharCode(65 + i)
  );
  const rowHeaders = Array.from({ length: ROWS }, (_, i) => i + 1);

  const [data, setData] = useState([]);
  const [selectedCells, setSelectedCells] = useState(new Set());
  const [isKeyDownDisabled, setIsKeyDownDisabled] = useState(false);
  const inputRefs = useRef({}); // Store references for inputs
  const [isDragging, setIsDragging] = useState(false);
  const [startCell, setStartCell] = useState(null);
  const [changedCells, setChangedCells] = useState(new Set()); // Track cell keys
  const { API_URL } = envVariables;
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [isOpencalc, setisOpencalc] = useState(false);
  const [selectedmathfunc, setselectedmathfunc] = useState("Sum");
  const [calcans, setcalcans] = useState(0);
  const [formula, setFormula] = useState("");
  const [statenaming, setstatenaming] = useState("");

  useEffect(() => {
    if (selectedCells.size === 1 && formula!=="") {
      insertformulaincell(formula);
    }


    updateDataWithFormulas()
  }, [formula]);




  /////formula evaluation code- 
  const evaluateFormula = (formula, data, prevContent) => {
      console.log("precontent",prevContent)

    if (!formula.startsWith("=")) return prevContent; // Keep previous content if not a formula
  
    const match = formula.match(/=(SUM|AVERAGE|MIN|MAX|PRODUCT|MOD)\(([^)]+)\)/i);
    if (!match) return prevContent; // Invalid formula, retain previous content
  
    const [, operation, range] = match; // Extract function name and cell range
  
    // Convert Excel-like range (A1:A10) to corresponding keys (row-col)
    const extractValues = (range) => {
      const rangeParts = range.split(":");
      if (rangeParts.length === 1) {
        const key = getCellKey(rangeParts[0]);
        return data[key] ? parseFloat(data[key].content) || 0 : 0;
      }
  
      const startKey = getCellKey(rangeParts[0]);
      const endKey = getCellKey(rangeParts[1]);
  
      if (!startKey || !endKey) return []; // Invalid range, return empty
  
      const [startRow, startCol] = startKey.split("-").map(Number);
      const [endRow, endCol] = endKey.split("-").map(Number);
  
      let values = [];
  
      for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
          const key = `${row}-${col}`;
          values.push(data[key] ? parseFloat(data[key].content) || 0 : 0);
        }
      }
      return values;
    };
  
    const getCellKey = (cellName) => {
      const match = cellName.match(/^([A-Z]+)(\d+)$/);
      if (!match) return null;
  
      const [, colLetters, rowNum] = match;
      const col = colLetters.split("").reduce((acc, char) => acc * 26 + (char.charCodeAt(0) - 65), 0);
      return `${parseInt(rowNum) - 1}-${col}`;
    };
  
    let values = extractValues(range);
    if (values.length === 0) return prevContent; // If values extraction fails, retain previous content
  
    switch (operation.toUpperCase()) {
      case "SUM":
        return values.reduce((acc, val) => acc + val, 0);
      case "AVERAGE":
        return values.length ? values.reduce((acc, val) => acc + val, 0) / values.length : 0;
      case "MIN":
        return Math.min(...values);
      case "MAX":
        return Math.max(...values);
      case "PRODUCT":
        return values.reduce((acc, val) => acc * val, 1);
      case "MOD": {
        const [num, divisor] = values;
        return divisor ? num % divisor : prevContent; // Retain previous content if division by zero
      }
      default:
        return prevContent; // Keep original content if operation is unrecognized
    }
  };
  
  
  const updateDataWithFormulas = () => {
    setData((prevData) => {
      const updatedData = { ...prevData };
  
      Object.keys(prevData).forEach((cellKey) => {
        if (prevData[cellKey].formula) {
          updatedData[cellKey] = {
            ...prevData[cellKey],
            content: evaluateFormula(prevData[cellKey].formula, prevData, prevData[cellKey].content),
          };
        }
      });
  
      return updatedData;
    });
  };
/////formula evaluation code ends here  


  const insertformulaincell=(newFormula)=>{
    console.log("Inserting formula into selected cells");

    Setunsavedchangesparent(true)

    setData((prevData) => {
      const updatedData = { ...prevData };
  
      selectedCells.forEach((cellKey) => {
        const existingCell = prevData[cellKey] || {
          row: parseInt(cellKey.split("-")[0]),
          col: parseInt(cellKey.split("-")[1]),
          content: "",
          style: {
            bold: false,
            italic: false,
            underline: false,
            fontsize: 12,
            textColor: "#000000",
            bgColor: "#ffffff",
          },
          formula: "",
        };
  
        console.log(`Updating formula for cell ${cellKey}:`, newFormula);
  
        updatedData[cellKey] = {
          ...existingCell,
          formula: newFormula, // Update formula
        };
      });
  
      console.log("Updated data with formulas:", updatedData);
      return { ...updatedData }; // Return a new object reference for React re-render
    });

    updateDataWithFormulas()
  }




  useEffect(() => {
    applyFormatting();
  }, [textFormattingState]);

  useEffect(() => {
    calculateMathFunction();
  }, [selectedmathfunc, selectedCells]);

  function calculateMathFunction() {
    // Extract numeric values from selectedCells
    console.log(selectedCells);
   

    if (!selectedCells) {
      return;
    }

    if (selectedCells.size === 0) {
      return;
    }

    const numbers = [];
    selectedCells.forEach((cellKey) => {
      const value = Number(data[cellKey]?.content);
      if (!isNaN(value)) numbers.push(value);
    });

    // Return early if no valid numbers found
    if (numbers.length === 0) {
      return;
    }

    let computedValue;
    switch (selectedmathfunc) {
      case "Sum":
        computedValue = numbers.reduce((acc, num) => acc + num, 0);
        break;
      case "Average":
        computedValue =
          numbers.reduce((acc, num) => acc + num, 0) / numbers.length;
        break;
      case "Max":
        computedValue = Math.max(...numbers);
        break;
      case "Min":
        computedValue = Math.min(...numbers);
        break;
      case "Count":
        computedValue = numbers.length;
        break;
      default:
        computedValue = "Invalid Function";
    }

    setcalcans(computedValue);
  }

  

  useEffect(() => {
    replaceValuesInSelectedCells(toReplace, replaceWith);
  }, [replacecount]);

  const replaceValuesInSelectedCells = (toReplace, replaceWith) => {
    if (!toReplace.trim()) return; // Ensure valid input

    let newData = { ...data }; // Clone current data state
    let hasChanges = false; // Track if any change occurs

    setUndoStack((prevStack) => [...prevStack, data]); // Save current state before modifying
    setRedoStack([]); // Clear redo stack on new change

    selectedCells.forEach((cellKey) => {
      if (data[cellKey]?.content === toReplace) {
        newData[cellKey] = {
          ...data[cellKey],
          content: replaceWith,
        };
        hasChanges = true;
      }
    });

    if (hasChanges) {
      setData(newData); // Update state only if changes were made
      Setunsavedchangesparent(true);
      setChangedCells((prev) => new Set([...prev, ...selectedCells]));
    }
  };

  const applyFormatting = () => {
    console.log("Applying formatting to selected cells");

    setData((prevData) => {
      const updatedData = { ...prevData };

      selectedCells.forEach((cellKey) => {
        const existingCell = prevData[cellKey] || {
          row: parseInt(cellKey.split("-")[0]),
          col: parseInt(cellKey.split("-")[1]),
          content: "",
          style: {
            bold: false,
            italic: false,
            underline: false,
            fontsize: 12,
            textColor: "#000000",
            bgColor: "#ffffff",
          },
          formula: "",
        };

        let newValue = existingCell.content ?? "";
        console.log(
          `Processing cell ${cellKey}: Before Formatting ->`,
          newValue
        );

        if (textFormattingState.trim) {
          newValue = newValue.replace(/\s/g, "");
          console.log("Trim applied");
        }
        if (textFormattingState.uppercase) {
          newValue = newValue.toUpperCase();
          console.log("Uppercase applied");
        }
        if (textFormattingState.lowercase) {
          newValue = newValue.toLowerCase();
          console.log("Lowercase applied");
        }
        if (textFormattingState.removeDuplicates) {
          removeDuplicateValuesAndUpdateData();
        }

        console.log(
          `Processing cell ${cellKey}: After Formatting ->`,
          newValue
        );

        // Ensure the content gets updated in a new object to trigger a React re-render
        updatedData[cellKey] = {
          ...existingCell,
          content: newValue, // Update content with formatted text
        };
      });

      console.log("updaed data", updatedData);
      return { ...updatedData }; // Return a completely new object reference
    });
  };

  const removeDuplicateValuesAndUpdateData = () => {
    let seen = new Set();
    let newData = { ...data }; // Clone current data state

    setUndoStack((prevStack) => [...prevStack, data]); // Save state for undo
    setRedoStack([]); // Clear redo stack

    selectedCells.forEach((cellKey) => {
      if (seen.has(data[cellKey]?.content)) {
        // If the value is duplicate, update state with an empty string
        newData[cellKey] = {
          ...data[cellKey],
          content: "",
        };
      } else {
        seen.add(data[cellKey]?.content);
      }
    });

    setData(newData);
    Setunsavedchangesparent(true);
    setChangedCells((prev) => new Set([...prev, ...selectedCells]));
  };

  useEffect(() => {
    getSpreadsheetCells(currentspreadsheet);
  }, [currentspreadsheet]);

  useEffect(() => {
    changeStylingOfCell(editorState);
  }, [editorState]);

  const changeStylingOfCell = (newStyles) => {
    console.log("its calling the func");

    setData((prevData) => {
      const updatedData = { ...prevData };

      selectedCells.forEach((cellKey) => {
        updatedData[cellKey] = {
          ...(prevData[cellKey] || {
            row: parseInt(cellKey.split("-")[0]),
            col: parseInt(cellKey.split("-")[1]),
            content: "",
            style: {
              bold: false,
              italic: false,
              underline: false,
              fontsize: 12,
              textColor: "#000000",
              bgColor: "#ffffff",
            },
            formula: "",
          }),
          style: {
            ...prevData[cellKey]?.style, // Keep previous styles
            ...newStyles, // Update with new styles
          },
        };
      });
      return updatedData;
    });
  };

  const getSpreadsheetCells = async (spreadsheetId) => {
    try {
      const response = await axios.post(`${API_URL}/api/spreadsheet/cells`, {
        id: spreadsheetId,
      });

      if (response.data) {
        if (response.data.length === 0) {
          setData([]);
        }

        let newData = {};
        let newChangedCells = new Set();

        response.data.forEach((cell) => {
          const cellKey = `${cell.row}-${cell.col}`;
          newData[cellKey] = cell;
          newChangedCells.add(cellKey); // Track fetched cells as changed
        });

        setData(newData);
        setChangedCells(newChangedCells);
      }

      console.log("Fetched Cells:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching cells:",
        error.response ? error.response.data : error.message
      );
      throw error;
    }
  };

  useEffect(() => {
    updatebuttonclicked();
  }, [savebuttoncnt]);

  const updatebuttonclicked = async () => {
    const updates = prepareUpdatesBeforeSave(data, changedCells);
    console.log("Updates:", updates);

    try {
      await updateSpreadsheetCells(currentspreadsheet, updates);
      Setunsavedchangesparent(false);
    } catch (error) {
      console.error("Error updating cells:", error);
    }
  };

  const prepareUpdatesBeforeSave = (data, changedCells) => {
    const updates = [];

    changedCells.forEach((cellKey) => {
      const cell = data[cellKey];
      if (cell) {
        updates.push({
          row: cell.row,
          col: cell.col,
          content: cell.content,
          formula: cell.formula,
          style: cell.style,
        });
      }
    });

    console.log(updates);

    return updates;
  };

  useEffect(() => {
    onredo();
  }, [redotrigger]);

  useEffect(() => {
    onundo();
  }, [undotrigger]);

  const onundo = () => {
    if (undoStack.length === 0) return; // Nothing to undo

    const prevState = undoStack.pop(); // Get last state
    setRedoStack((prevStack) => [...prevStack, data]); // Save current state in redo stack
    setData(prevState); // Restore previous state
    setUndoStack([...undoStack]); // Update undo stack
  };

  const onredo = () => {
    if (redoStack.length === 0) return; // Nothing to redo

    const nextState = redoStack.pop(); // Get next state
    setUndoStack((prevStack) => [...prevStack, data]); // Save current state in undo stack
    setData(nextState); // Restore redo state
    setRedoStack([...redoStack]); // Update redo stack
  };

  const handleInputChange = (row, col, value) => {
    const cellKey = `${row}-${col}`;

    setUndoStack((prevStack) => [...prevStack, data]); // Save current state before modifying
    setRedoStack([]); // Clear redo stack on new change

    setData((prevData) => ({
      ...prevData,
      [cellKey]: {
        ...(prevData[cellKey] || {
          row,
          col,
          content: "",
          style: {
            bold: false,
            italic: false,
            underline: false,
            fontsize: 12,
            textColor: "#000000",
            bgColor: "#ffffff",
          },
          formula: "",
        }),
        content: value,
      },
    }));
    Setunsavedchangesparent(true);
    setChangedCells((prev) => new Set([...prev, cellKey]));
      if(selectedCells.size===1){
        updateDataWithFormulas()
      }

  };

  const getFormulaOfCell = (cellKey) => {

    getCellNaming(cellKey)
    const cellData = data[cellKey]; // Assuming `data` holds the spreadsheet state
  
    const formulac = cellData?.formula || ""; // Get formula or return empty string
    console.log(`Formula for cell ${cellKey}:`, formulac);
  
     setFormula(formulac);
  };

  const getCellNaming = (cellKey) => {
    if (!cellKey) return;
  
    const [row, col] = cellKey.split("-").map(Number); // Convert "5-11" to [5, 11]
    const cellName = `${String.fromCharCode(65 + col)}${row + 1}`; // Convert column number to letter
  
    setstatenaming(cellName);
  };
  

  const handleMouseDown = (row, col) => {
    setSelectedCells(new Set([`${row}-${col}`]));
    setFormula("")
    setIsDragging(true);
    setStartCell({ row, col });

  };

  const handleMouseEnter = (row, col) => {
    setSelectedCells((prev) => new Set([...prev, `${row}-${col}`]));
    setFormula("")
    getFormulaOfCell(`${row}-${col}`)
  };

  useEffect(() => {
    const handleMouseUp = () => {
      setIsDragging(false);
      setStartCell(null);
    };

    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, []);

  const handleMouseMove = (row, col) => {
    if (!isDragging || !startCell) return;

    const newSelection = new Set();
    const minRow = Math.min(startCell.row, row);
    const maxRow = Math.max(startCell.row, row);
    const minCol = Math.min(startCell.col, col);
    const maxCol = Math.max(startCell.col, col);

    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        newSelection.add(`${r}-${c}`);
      }
    }

    setSelectedCells(newSelection);
    setFormula("")
    getFormulaOfCell(`${row}-${col}`)

  };

  const moveFocus = (rowIndex, colIndex, direction) => {
    let newRow = rowIndex;
    let newCol = colIndex;

    switch (direction) {
      case "ArrowUp":
        newRow = Math.max(0, rowIndex - 1);
        break;
      case "ArrowDown":
        newRow = Math.min(ROWS - 1, rowIndex + 1);
        break;
      case "ArrowLeft":
        newCol = Math.max(0, colIndex - 1);
        break;
      case "ArrowRight":
        newCol = Math.min(COLS - 1, colIndex + 1);
        break;
      case "Tab":
        newCol = (colIndex + 1) % COLS;
        if (newCol === 0) {
          newRow = Math.min(ROWS - 1, rowIndex + 1);
        }
        break;
      default:
        break;
    }

    const newInputRef = inputRefs.current[`${newRow}-${newCol}`];

    if (newInputRef) {
      newInputRef.focus();
      newInputRef.select();
      getFormulaOfCell(`${newRow}-${newCol}`)
    }
  };

  const handleKeyDown = (e, rowIndex, colIndex) => {
    if (isKeyDownDisabled && ["ArrowLeft", "ArrowRight"].includes(e.key)) {
      return;
    }

    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
      e.preventDefault();
      moveFocus(rowIndex, colIndex, e.key);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const inputRef = inputRefs.current[`${rowIndex}-${colIndex}`];

      if (colIndex === 0) {
        // Custom logic for column 0 (date picker, etc.)
        if (inputRef && typeof inputRef.showPicker === "function") {
          inputRef.showPicker();
        }
      } else if (colIndex === 6 && rowIndex === ROWS - 1) {
        handleAddRow();
      } else {
        if (inputRef) {
          if (isKeyDownDisabled) {
            inputRef.blur();
            moveFocus(rowIndex, colIndex, "Tab");
          } else {
            inputRef.focus();
            inputRef.select();
          }
        }
        setIsKeyDownDisabled(!isKeyDownDisabled);
      }
    }
  };

  const handleAddRow = () => {
    console.log("Adding new row...");
    // Implement row addition logic if needed
  };

  return (
    <div className="spreadsheet">
      <table style={{ height: "50vh" }}>
        <thead>
          <tr>
            <th></th>
            {colHeaders.map((header, i) => (
              <th key={i}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data && rowHeaders.map((rowNum, row) => (
            <tr key={row}>
              <th>{rowNum}</th>
              {colHeaders.map((_, col) => (
                <td
                  key={col}
                  className={
                    selectedCells.has(`${row}-${col}`) ? "selected" : ""
                  }
                  onMouseDown={() => handleMouseDown(row, col)}
                  onMouseEnter={(e) =>
                    e.buttons === 1 && handleMouseEnter(row, col)
                  }
                  onMouseMove={() => handleMouseMove(row, col)}
                >
                  <input
                    type="text"
                    ref={(el) => (inputRefs.current[`${row}-${col}`] = el)}
                    value={data?.[`${row}-${col}`]?.content ?? ""}
                    onFocus={() => getFormulaOfCell(`${row}-${col}`)} // Call function on focus

                    onChange={(e) =>
                      handleInputChange(row, col, e.target.value)
                    }
                    onKeyDown={(e) => handleKeyDown(e, row, col)}
                    style={{
                      fontWeight: data?.[`${row}-${col}`]?.style?.bold
                        ? "bold"
                        : "normal",
                      fontStyle: data?.[`${row}-${col}`]?.style?.italic
                        ? "italic"
                        : "normal",
                      textDecoration: data?.[`${row}-${col}`]?.style?.underline
                        ? "underline"
                        : "none",
                      fontSize: `${data?.[`${row}-${col}`]?.style?.fontsize}px`,
                      color:
                        data?.[`${row}-${col}`]?.style?.textColor ?? "#000000",
                      backgroundColor:
                        data?.[`${row}-${col}`]?.style?.bgColor ?? "#ffffff",
                      outline: "none",
                      width: "100%",
                    }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="bottom-strip">
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-end",
            marginRight: "3vw",
            gap: "2vw",
          }}
        >
          <div>
            <input
              type="text"
              placeholder={`fx Enter formula for cell ${statenaming}`}
              value={formula}
              onChange={(e) => setFormula(e.target.value)}
              className="border rounded p-2 w-full outline-none focus:ring-2 focus:ring-blue-500"
              style={{width:"25vw"}}
            />
          </div>

          <div
            style={{
              float: "right",
              alignItems: "center",
              width: "9vw",
              height: "5vh",
              backgroundColor: "#c4eed0",
              cursor: "pointer",
            }}
            className="dropdownbox"
            onClick={() => setisOpencalc(!isOpencalc)}
          >

            <div >   
            <span style={{ fontSize: "18px", fontWeight: "bold" }}>
              {selectedmathfunc}: {calcans}
            </span>
            <span className="arrow" onClick={() => setisOpencalc(!isOpencalc)}>
              {isOpencalc ? "▲" : "▼"}
            </span>

            </div>

            {isOpencalc && (
              <div className="dropdown">
                <div onClick={() => setselectedmathfunc("Sum")}>SUM</div>
                <div onClick={() => setselectedmathfunc("Average")}>
                  AVERAGE
                </div>
                <div onClick={() => setselectedmathfunc("Max")}>MAX</div>
                <div onClick={() => setselectedmathfunc("Min")}>MIN</div>
                <div onClick={() => setselectedmathfunc("Count")}>COUNT</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Spreadsheet;
