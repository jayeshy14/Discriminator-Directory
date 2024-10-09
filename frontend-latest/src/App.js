import './App.css';
import Nav from './components/Nav.jsx';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer} from 'react-toastify';
import Home from './components/Home.jsx';
import { useEffect, useState } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import QueryDiscriminators from './pages/QueryDiscriminators.jsx';
import UploadDiscriminator from './pages/UploadDiscriminator.jsx';
import QueryInstructions from './pages/QueryInstructions.jsx';


function App() {

  return (
    <BrowserRouter>
    <ToastContainer/>
    <div className="App h-screen">
      <div className='gradient-bg-welcome h-screen w-screen'>
      <Nav />
      <Routes>
        <Route path="/" element={<Home/>}></Route>
        <Route path="/upload" element={<UploadDiscriminator/>}></Route>
        <Route path="/query-discriminators" element={<QueryDiscriminators/>}></Route>
        <Route path="/query-instructions" element={<QueryInstructions/>}></Route>
      </Routes>
      </div>
    </div>
  
    </BrowserRouter>
  );
}

export default App;
