import React from 'react';
import './App.css';
import TestSSH from './testSSH';
import Header from './header';
import { BrowserRouter, Route } from 'react-router-dom';


function App() {
  return (
    <div>
      <Header />
      <BrowserRouter>
        <Route path='/' exact component={TestSSH}></Route>
        <Route path='/aws-troubleshooting' exact component={TestSSH}></Route>
      </BrowserRouter>
    </div>
  );
}

export default App;
