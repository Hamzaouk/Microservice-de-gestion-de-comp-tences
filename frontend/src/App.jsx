import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Register from './components/Register';
import Login from './components/Login';
import Home from './components/Home';
import Profil from './components/User/Profil';
import DisplayAnnouncements from './components/Anouncements/DisplayAnnouncements';
import AddAnnouncements from './components/Anouncements/AddAnnouncements';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="pt-20"> 
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profil" element={<Profil />} />
            <Route path="/announcements" element={<DisplayAnnouncements />} />
            <Route path="/announcements/add" element={<AddAnnouncements />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;