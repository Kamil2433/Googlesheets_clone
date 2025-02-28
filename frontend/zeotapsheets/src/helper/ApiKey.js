const API_URL = import.meta.env.VITE_API_URL_DEVELOPMENT;


console.log(`Running in ${import.meta.env.MODE} mode`);
console.log(`Running in ${import.meta.env.VITE_API_URL_DEVELOPMENT} `);

// https://api.nikkoerp.com
// http://localhost:3200
const envVariables = {
  API_URL:API_URL,
 
};

export default envVariables;
