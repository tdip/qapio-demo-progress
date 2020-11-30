import * as React from "react"
import * as ReactDom from "react-dom"
import './index.css';
import App from './App';
//import reportWebVitals from './reportWebVitals';

const start = async (event:any) => {

  ReactDom.render(
      <App />,
      document.getElementById("root")
  );
}

window.addEventListener('load', start);