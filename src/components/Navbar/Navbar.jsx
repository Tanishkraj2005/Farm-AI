import React, { useState,useRef,useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import './Navbar.css'

const PRIMARY = [
  { id: "home", label: "Home", icon: "🏠" },
  { id: "chatbot", label: "Chatbot", icon: "💬" },
  { id: "simulator", label: "Simulator", icon: "📈" },
  { id: "disease", label: "Diagnose", icon: "🌿" },
  { id: "weather", label: "Weather", icon: "🌦️" },
];

const SECONDARY = [
  { id: "soil", label: "Soil Analysis", icon: "🧪" },
  { id: "mandi", label: "Mandi Prices", icon: "🏪" },
  { id: "news", label: "Agri News", icon: "📰" },
  { id: "calendar", label: "Crop Calendar", icon: "📅" },
  { id: "waste", label: "Waste to Income", icon: "♻️" },
  { id: "insurance", label: "PMFBY", icon: "🛡️" },
  { id: "glossary", label: "Agri Glossary", icon: "📖" },
];


const Navbar = () => {
  const navigate = useNavigate();
  const [activePage, setActivePage] = React.useState("home");
  const [moreOpen,setMoreOpen] = useState(false);
  const [darkMode,setDarkMode] = useState(false);
  const dropdownRef = useRef(null);

  // const displayFarmerName = profile?.name?.split(' ')[0] || user?.displayName?.split(' ')[0] || 'Profile';
  const nav = (page) => {
    setActivePage(page);
    setMoreOpen(false);
    navigate(`/${page}`)
  };
  const isSecondaryActive = SECONDARY.some(p => p.id === activePage);
  
  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMoreOpen(false);
      }
  };

  document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  return (
    <div className='navbar-container'>
        <nav className='navbar'>
            <div className='logo'>
                <button onClick={()=>nav('home')}>
                  🌾 Farm AI
                </button>
            </div>
            {/* DESKTOP NAV */}
            <div className='nav-links'>
                {PRIMARY.map((p)=>(
                    <button key={p.id} onClick={()=>nav(p.id)} 
                      className={`nav-btn ${activePage===p.id ? "active": ""}`}>
                      {p.icon}{p.label}
                    </button>
                ))}

                <div className="dropdown" ref={dropdownRef}>
                  <button onClick={() => setMoreOpen(!moreOpen)}
                    className={`nav-btn ${isSecondaryActive ? 'active' : ''}`}>
                    More ▼
                  </button>

                  <div className={`dropdown-menu ${moreOpen ? 'show': ''}`}>
                    {SECONDARY.map(p=>(
                      <button key={p.id} onClick={()=>nav(p.id)}
                       className={`dropdown-item ${activePage===p.id ? 'active': ''}`}>
                        {p.icon} {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className='nav-action'>
                    <button onClick={()=>setDarkMode(!darkMode)} className='icon-btn'>
                      {darkMode ? '☀️' : '🌙'}
                    </button>

                    <button onClick={()=>nav('profile')} className='profile-btn'>
                      🧑‍🌾 Profile
                    </button>

                    <button >

                    </button>

                    <button>

                    </button>
                </div>
            </div>
        </nav>
    </div>
    
  )
}

export default Navbar