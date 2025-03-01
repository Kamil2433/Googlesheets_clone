# Googlesheets_clone
Clone application of google sheets

test Deployed URL- https://kamil2433.github.io/Googlesheets_clone/


<img width="955" alt="Screenshot 2025-02-28 144658" src="https://github.com/user-attachments/assets/c99522c6-3f62-4c24-9dec-2dcd28fac079" />

backend server Link(render.com)- https://googlesheets-clone.onrender.com  (render.com might shut down server after inactivity)

Features: 
1. UI similar to Google Sheets 
2. Drag functions 
3. Formula for each cell  (input in bottom bar)
4. Maths functions (dropdown in bottom bar)
5. Styling features for each cell (bold, italics, font size, color,background color) (toolbar below navbar)
6. Data Quality functions (Trim, uppercase, lowercase, remove duplicate, find & 
replace)  (in the navbar)

Additional Features: 
1. Implemented the Saving features to save & load the spreadsheet in MongoDB  (Save button in the top right corner, when data changes unsaved changes alert appears)
2. Arrow functions (To change cells using arrow buttons in keyboard ⬆️ ⬇️ ⬅️ ➡️) 
3. Features to Create new spreadsheets and Open Other spreadsheets (New File and Open file buttons in navbar)
4. Undo and Redo actions (  ↩️ ↪️ button in toolbar below navbar)

Performance optimization techniques used:
1. Used useEffect hooks to effectively display cell values when formulas are used
2. Used the useRef hooks effectively to manage arrow functions and switch cells quickly

Data Structures used:
1. 2D arrays: to store the data in the spreadsheets
2. Sets: to keep track of the selected cells and changed cells
3. Stacks: to keep track of actions for undo and redo feature


Backend setup-
cd backend
1. create .env with mongoURI
2. npm i
3. node index.js

Frontend setup-
cd frontend
cd zeotapsheets
1. Create .env with VITE_API_URL_DEVELOPMENT variable
2. npm i
3. npm run dev
