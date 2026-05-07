import { useState, useRef, useEffect, useCallback } from 'react';
import { useApiKey } from '../../context/ApiKeyContext';
import './chatbot.css'
const LANG_NAMES = {
  en: 'English',
  hi: 'Hindi',
  bn: 'Bengali',
  ta: 'Tamil',
  te: 'Telugu',
  mr: 'Marathi',
};

const SENTIMENTS = {
  positive: { icon: '😊', label: 'Positive' },
  neutral: { icon: '😐', label: 'Neutral' },
  negative: { icon: '😞', label: 'Negative' },
};

const QUICK_QS = [
  'Wheat price in Punjab?',
  'Yellow spots on paddy leaves',
  'PMKISAN scheme eligibility',
  'Best fertilizer for cotton',
];

const TAGS = [
  '#WheatHarvest',
  '#Monsoon2025',
  '#PMKisan',
  '#OrganicFarm',
  '#MandiPrices',
];

const MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-flash-latest',
];

const STORAGE_KEY = 'farmAI_chatHistory';

function loadhistory(){
    try{
        return JSON.parse(localStorage.getItem(STORAGE_KEY));
    }
    catch{
        return [];
    }
}

const WELCOME = {
    role: 'bot',
    text: 'Namaste! 🙏 I am FarmAI — your AI-powered agricultural advisor.',
    time: new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  }),
}

const Chatbot = () => {
  return (
    <div className='chatbot-section'>
        <div className='chatbot-wrapper'>
            <div className='chatbot-main'>
                <div className='chatbot-header'>
                    <div>
                        <h2>FarmAI Assistant</h2>
                        {/* <p>Gemini Live · {LANG_NAMES[language]}</p> */}
                    </div>

                </div>
            </div>
        </div>
    </div>
  )
}

export default Chatbot