import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import GoogleSheetsNavbar from "./components/Navbar";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import envVariables from "../src/helper/ApiKey";
import Spreadsheet from "./components/Spreadsheet";
import 'react-toastify/dist/ReactToastify.css'; // Add this import
import { ToastContainer, toast } from "react-toastify";

function App() {
  const [spreadsheets, setSpreadsheets] = useState([]);
  const [unsavedchangesparent, Setunsavedchangesparent] = useState(false);
  const [currentlysaving,setcurrentlysaving]=useState(false);
  const [currentspreadsheet, Setcurrentspreadsheet] = useState(null);
  const [currentspreadsheetname, Setcurrentspreadsheetname] = useState(" ");
  const [savebuttoncnt, setsavebuttoncnt] = useState(0);
  const [undotrigger,setundotrigger]=useState(0);
  const [redotrigger,setredotrigger]=useState(0);
  const [toReplace, setToReplace] = useState("");
  const [replaceWith, setReplaceWith] = useState("");
  const [replacecount,setreplacecount]=useState(0);
  const [editorState, setEditorState] = useState({
    bold: false,
    italic: false,
    underline: false,
    fontsize: 12,
    textColor: "#000000",
    bgColor: "#ffffff",
  });

  const [textFormattingState, setTextFormattingState] = useState({
    trim: false,
    uppercase: false,
    lowercase: false,
    removeDuplicates: false,
    findAndReplace: false,
  });

  const [formula, setFormula] = useState("");

  const toggleStyle = (style) => {
    setEditorState((prevState) => ({
      ...prevState,
      [style]: !prevState[style],
    }));
    Setunsavedchangesparent(true)
  };

  const { API_URL } = envVariables;

  useEffect(() => {
    fetchSpreadsheets();
  }, []);

  const fetchSpreadsheets = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/spreadsheet`);

      if (response.data) {
        console.log(response.data);
        setSpreadsheets(response.data);

        Setcurrentspreadsheet(response.data[0]._id);
        Setcurrentspreadsheetname(response.data[0].name);
        console.log(response.data[0]._id, response.data[0].name);
      }

      return response.data;
    } catch (error) {
      console.error(
        "Error fetching spreadsheets:",
        error.response?.data || error.message
      );
      throw error;
    }
  };

  const updateSpreadsheetCells = async (spreadsheetId, updates) => {
    try {
      setcurrentlysaving(true);
      const response = await axios.patch(`${API_URL}/api/spreadsheet/cells`, {
        id: spreadsheetId,
        updates,
      });
        if(response.data){
          setcurrentlysaving(false);
        

        }
      console.log("Cells updated successfully:", response.data);
      return response.data;
    } catch (error) {
      setcurrentlysaving(false);
        Setunsavedchangesparent(true);
      console.error(
        "Error updating cells:",
        error.response ? error.response.data : error.message
      );
      throw error;
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
      }}
    >
      <GoogleSheetsNavbar
        unsavedchangesparent={unsavedchangesparent}
        currentspreadsheetname={currentspreadsheetname}
        fetchSpreadsheets={fetchSpreadsheets}
        updateSpreadsheetCells={updateSpreadsheetCells}
        setsavebuttoncnt={setsavebuttoncnt}
        savebuttoncnt={savebuttoncnt}
        spreadsheets={spreadsheets}
        Setcurrentspreadsheet={Setcurrentspreadsheet}
        Setcurrentspreadsheetname={Setcurrentspreadsheetname}
        editorState={editorState}
        formula={formula}
        setFormula={setFormula}
        toggleStyle={toggleStyle}
        setundotrigger={setundotrigger}
        setredotrigger={setredotrigger}
        undotrigger={undotrigger}
        redotrigger={redotrigger}
        setEditorState={setEditorState}
        setTextFormattingState={setTextFormattingState}
        setReplaceWith={setReplaceWith}
        setToReplace={setToReplace}
        setreplacecount={setreplacecount}
        toReplace={toReplace}
        replaceWith={replaceWith}
        replacecount={replacecount}
        currentlysaving={currentlysaving}
      />
      {currentspreadsheet && textFormattingState && (
        <Spreadsheet
          Setunsavedchangesparent={Setunsavedchangesparent}
          currentspreadsheet={currentspreadsheet}
          savebuttoncnt={savebuttoncnt}
          updateSpreadsheetCells={updateSpreadsheetCells}
          editorState={editorState}
          formula={formula}
          setFormula={setFormula}
          undotrigger={undotrigger}
          redotrigger={redotrigger}
          textFormattingState={textFormattingState}
          toReplace={toReplace}
          replaceWith={replaceWith}
          replacecount={replacecount}
        />
      )}
                  <ToastContainer/>

    </div>
  );
}

export default App;
