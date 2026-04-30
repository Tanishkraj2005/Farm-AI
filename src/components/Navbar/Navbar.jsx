import React from 'react'
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
  return (
    <div className='navbar-container'>
        <nav className='navbar'>
            <div className='logo'>
                Farm AI
            </div>
            {/* DESKTOP NAV */}
            <div className='nav-links'>
                {PRIMARY.map((p)=>(
                    <button
                    key={p.id}
                    onClick={()=>nav(p.id)}
                    className={`nav-btn${activePage===p.id ? "active":""}`}
                    >
                    {p.icon}{p.label}
                    </button>
                ))}

            </div>
            <div>

            </div>
            <div>

            </div>
            <div>

            </div>
            <div>
                
            </div>
        </nav>
    </div>
    
  )
}

export default Navbar