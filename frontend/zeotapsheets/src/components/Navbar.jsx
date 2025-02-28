import { useState, useEffect, useRef } from "react";
import {
  FiPrinter,
  FiZoomIn,
  FiBold,
  FiItalic,
  FiUnderline,
} from "react-icons/fi";
import { IoMdRedo, IoMdUndo } from "react-icons/io";
import { AiOutlineShareAlt } from "react-icons/ai";
import { BsThreeDotsVertical } from "react-icons/bs";
import logo from "../assets/gsheetslogo.png";
import Modal from "./Modal";
import axios from "axios";
import envVariables from "../helper/ApiKey";
import "./Navbar.css";

export default function GoogleSheetsNavbar({
  unsavedchangesparent,
  currentspreadsheetname,
  fetchSpreadsheets,
  setsavebuttoncnt,
  savebuttoncnt,
  spreadsheets,
  Setcurrentspreadsheet,
  Setcurrentspreadsheetname,
  editorState,
  formula,
  setFormula,
  toggleStyle,
  setredotrigger,
  setundotrigger,
  undotrigger,
  redotrigger,
  setEditorState,
  setTextFormattingState,
  setReplaceWith,
  setToReplace,
  setreplacecount,
  replacecount,
  toReplace,
  replaceWith,
  currentlysaving
}) {
  const [fileName, setFileName] = useState(currentspreadsheetname);
  const { API_URL } = envVariables;
  const [opennewsheetmodal, setopennewsheetmodal] = useState(false);
  const [openfilemodal, setopenfilemodal] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [replaceopen, setreplaceopen] = useState(false);
 
  const handleReplacemodalchanges=()=>{

    setreplacecount(replacecount+1)

    setreplaceopen(false);

  }




  const handleReplacemodal=()=>{
    setreplaceopen(true);
  }

  const replacemodalclose=()=>{
    setreplaceopen(false);
  }

  const handleOpenSheet = (id, name) => {
    Setcurrentspreadsheet(id);
    Setcurrentspreadsheetname(name);
    closenopenfile();
  };

  const openewfilemodal = () => {
    setopennewsheetmodal(true);
  };

  const closenewfile = () => {
    setopennewsheetmodal(false);
  };

  const openopenfilemodal = () => {
    setopenfilemodal(true);
  };

  const closenopenfile = () => {
    setopenfilemodal(false);
  };

  const buttonclicked = () => {
    setsavebuttoncnt(savebuttoncnt + 1);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-container")) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const createNewSpreadsheet = async () => {
    try {
      const response = await axios.post(`${API_URL}/api/spreadsheet`, {
        name: fileName || "Untitled Spreadsheet",
      });

      console.log("Spreadsheet Created:", response.data);

      if (response.data) {
        fetchSpreadsheets();
      }
      closenewfile(); // Close modal after API call
    } catch (error) {
      console.error("Error creating spreadsheet:", error);
    }
  };

  const handleSelect = (format) => {
    setTextFormattingState((prev) => {
      let newState = {
        ...prev,
        [format]: !prev[format], // Toggle the selected format
      };
  
      // Ensure mutual exclusivity between uppercase and lowercase
      if (format === "uppercase" && newState.uppercase) {
        newState.lowercase = false;
      } else if (format === "lowercase" && newState.lowercase) {
        newState.uppercase = false;
      }
  
      return newState;
    });
  };
  

  return (
    <div className="flex items-center justify-between bg-gray-100 px-4 py-2 border-b">
      {/* Left - Menu Items */}
      <div className="flex items-center space-x-4">
        <div style={{ display: "flex", flexDirection: "row" }}>
          <div style={{ marginRight: "10px", fontSize: "2px", height: "10px" }}>
            <img
              src={logo} // Change to your logo path
              alt="Logo"
              width="50"
              height="60"
              className="d-inline-block align-text-top"
            />
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", width: "100%" }}
          >
            <span
              className="text-lg font-semibold"
              style={{ fontSize: "20px", marginLeft: "0.3vw" }}
            >
              {currentspreadsheetname || "Untitled Spreadsheet"}
            </span>

            <div
              className="flex space-x-3 text-sm text-gray-700"
              style={{ display: "flex", flexDirection: "row" }}
            >
              <button
                className="hover:bg-gray-200 px-2 py-1 rounded"
                style={{ fontSize: "2.3vh" }}
                onClick={openewfilemodal}
              >
                New File
              </button>
              <button
                className="hover:bg-gray-200 px-2 py-1 rounded"
                style={{ fontSize: "2.3vh" }}
                onClick={openopenfilemodal}
              >
                Open File
              </button>
              <div className="dropdown">
                <button className="menu-btn dropbtn">
                  Data Formatting <span className="caret">▼</span>
                </button>
                <div className="dropdown-content">
                  <a href="#" onClick={() => handleSelect("trim")}>
                    TRIM: Remove whitespace
                  </a>
                  <a href="#" onClick={() => handleSelect("uppercase")}>
                    UPPER: Convert to uppercase
                  </a>
                  <a href="#" onClick={() => handleSelect("lowercase")}>
                    LOWER: Convert to lowercase
                  </a>
                  <a href="#" onClick={() => handleSelect("removeDuplicates")}>
                    REMOVE_DUPLICATES: Remove duplicate rows
                  </a>
                  <a href="#" onClick={() => setreplaceopen(true)}>
                    FIND_AND_REPLACE: Find and replace text
                  </a>
                </div>
              </div>

              <button
                className="hover:bg-gray-200 px-2 py-1 rounded"
                style={{ fontSize: "2.3vh" }}
              >
                View
              </button>
              <button
                className="hover:bg-gray-200 px-2 py-1 rounded"
                style={{ fontSize: "2.3vh" }}
              >
                Insert
              </button>
              <button
                className="hover:bg-gray-200 px-2 py-1 rounded"
                style={{ fontSize: "2.3vh" }}
              >
                Format
              </button>

              <button
                className="hover:bg-gray-200 px-2 py-1 rounded"
                style={{ fontSize: "2.3vh" }}
              >
                Tools
              </button>
              <button
                className="hover:bg-gray-200 px-2 py-1 rounded"
                style={{ fontSize: "2.3vh" }}
              >
                Extensions
              </button>
              <button
                className="hover:bg-gray-200 px-2 py-1 rounded"
                style={{ fontSize: "2.3vh" }}
              >
                Help
              </button>
              <div
                style={{
                  float: "right",
                  fontSize: "2vh",
                  marginRight: "2vw",
                  borderRadius: "20px",
                  backgroundColor: "#c2e7ff",
                  padding: "1vh",
                  border: "2px solid #c2e7ff",
                  width: "15vw",
                  height: "5vh",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginLeft: "auto",
                  cursor: "pointer",
                }}
                onClick={() => buttonclicked()}
              >
                {unsavedchangesparent && (
                  <span
                    style={{
                      float: "right",
                      fontSize: "20px",
                      fontWeight: "bold",
                      color: "red",
                      cursor: "pointer",
                      marginRight: "1vw",
                    }}
                  >
                    {currentlysaving ? "Saving..":"Unsaved changes"}
                  </span>
                )}
                <span style={{ fontSize: "20px", fontWeight: "bold" }}>
                  Save
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Center - Toolbar */}
      <div
        className="flex items-center space-x-3"
        style={{
          border: "1px solid #f0f4f9",
          borderRadius: "200px",
          margin: "5px",
          padding: "2px",
          backgroundColor: "#f0f4f9",
        }}
      >
        <button
          className="p-2 bg-[#f0f4f9] hover:bg-gray-200 rounded"
          style={{ marginLeft: "30px", backgroundColor: "#f0f4f9" }}
          onClick={() => setundotrigger(undotrigger + 1)}
        >
          <IoMdUndo size={18} />
        </button>
        <button
          className="p-2 bg-[#f0f4f9] hover:bg-gray-200 rounded"
          style={{ backgroundColor: "#f0f4f9" }}
          onClick={() => setredotrigger(redotrigger + 1)}
        >
          <IoMdRedo size={18} />
        </button>

        {/* Font Size Selector */}
        <select
          className="border p-1 rounded"
          value={editorState.fontsize} // Ensure the dropdown reflects the current font size
          onChange={(e) =>
            setEditorState((prevState) => ({
              ...prevState,
              fontsize: Number(e.target.value), // Update fontsize in editorState
            }))
          }
          style={{ backgroundColor: "#f0f4f9" }}
        >
          {[10, 12, 14, 16, 18, 20].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>

        <button
          className="p-2 hover:bg-gray-200 rounded"
          style={{ backgroundColor: "#f0f4f9" }}
          onClick={() => toggleStyle("bold")}
        >
          <FiBold size={18} />
        </button>
        <button
          className="p-2 hover:bg-gray-200 rounded"
          style={{ backgroundColor: "#f0f4f9" }}
          onClick={() => toggleStyle("italic")}
        >
          <FiItalic size={18} />
        </button>
        <button
          className="p-2 hover:bg-gray-200 rounded"
          style={{ backgroundColor: "#f0f4f9" }}
          onClick={() => toggleStyle("underline")}
        >
          <FiUnderline size={18} />
        </button>
        <input
          type="color"
          value={editorState.textColor}
          onChange={(e) =>
            setEditorState((prevState) => ({
              ...prevState,
              textColor: e.target.value,
            }))
          }
          className="w-8 h-8 border rounded cursor-pointer"
          title="Text Color"
          style={{ paddingTop: "1vh", marginLeft: "1vw", width: "2vw" }}
        />

        {/* Background Color Picker */}
        <input
          type="color"
          value={editorState.bgColor}
          onChange={(e) =>
            setEditorState((prevState) => ({
              ...prevState,
              bgColor: e.target.value,
            }))
          }
          className="w-8 h-8 border rounded cursor-pointer"
          title="Background Color"
          style={{ paddingTop: "1vh", marginLeft: "1vw", width: "2vw" }}
        />
      </div>

      {opennewsheetmodal && (
        <Modal
          header={"Create New Spread Sheet"}
          isOpen={opennewsheetmodal}
          onClose={closenewfile}
        >
          {/* Buttons */}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <input
              type="text"
              placeholder="Enter file name"
              className="w-full mt-3 p-2 border rounded"
              style={{ fontSize: "1rem", height: "10vh", width: "30vw" }}
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
            />

            <button
              onClick={createNewSpreadsheet}
              style={{
                backgroundColor: "#f0f4f9",
                fontSize: "2vh",
                marginTop: "2vh",
                width: "30vw",
                height: "5vh",
                borderRadius: "10px",
              }}
            >
              Create New Spread Sheet
            </button>
          </div>
        </Modal>
      )}

      {openfilemodal && (
        <Modal
          header={"Open Spread Sheet"}
          isOpen={openfilemodal}
          onClose={closenopenfile}
        >
          <div className="p-4" style={{ maxHeight: "50vh", overflowY: "auto" }}>
            <h2 className="text-lg font-semibold mb-3 text-gray-800">
              Available Spreadsheets
            </h2>
            <ul className="divide-y divide-gray-300">
              {spreadsheets.length > 0 ? (
                spreadsheets.map((sheet) => (
                  <li
                    key={sheet._id}
                    className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                    onClick={() => handleOpenSheet(sheet._id, sheet.name)}
                  >
                    <span className="text-blue-600 font-medium hover:underline">
                      {sheet.name}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevents parent click
                        handleOpenSheet(sheet._id, sheet.name);
                      }}
                      style={{
                        fontSize: "1rem",
                        border: "2px solid rgb(194, 231, 255)",
                        color: "black",
                        borderRadius: "15px",
                        backgroundColor: "rgb(194, 231, 255)",
                        marginLeft: "2vw",
                      }}
                    >
                      Open
                    </button>
                  </li>
                ))
              ) : (
                <p className="text-gray-500 text-center mt-2">
                  No spreadsheets available
                </p>
              )}
            </ul>
          </div>
        </Modal>
      )}

      {replaceopen && (
        <Modal
          header={"Replace from Selected Cells"}
          isOpen={handleReplacemodal}
          onClose={replacemodalclose}
        >
          {/* Buttons */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <input
              type="text"
              placeholder="To replace"
              value={toReplace}
              onChange={(e) => setToReplace(e.target.value)}
              style={{ padding: "5px", width: "200px" }}
            />
            <input
              type="text"
              placeholder="Replace with"
              value={replaceWith}
              onChange={(e) => setReplaceWith(e.target.value)}
              style={{ padding: "5px", width: "200px" }}
            />
            <button onClick={handleReplacemodalchanges} style={{ padding: "5px 10px", border:"2px solid rgb(194, 231, 255)", backgroundColor:"rgb(194, 231, 255)", borderRadius:"20px" }}>
              Replace
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
