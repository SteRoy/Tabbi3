import React from 'react';
import ReactDOM from 'react-dom';
import reportWebVitals from './reportWebVitals';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';

// Page Imports
import LoginPage from "./LoginPage";
import HomePage from "./HomePage";
import RegisterPage from "./RegisterPage";
import TournamentListPage from "./TournamentListPage";
import TournamentRouter from "./Tournament";

ReactDOM.render(
  <React.StrictMode>
    <Router>
        <Switch>
            <Route exact path="/" component={HomePage}/>
            <Route exact path="/login" component={LoginPage}/>
            <Route exact path="/register" component={RegisterPage}/>
            <Route path="/tournament" component={TournamentRouter}/>
            <Route exact path="/tournaments" component={TournamentListPage}/>
        </Switch>
        <hr/>
        <a className="text-white" href="https://github.com/SteRoy/Tabbi3">
            <p className="text-center">
                Tabbi3 &copy; 2021 - made with secret alien technology
            </p>
        </a>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals(console.log);
