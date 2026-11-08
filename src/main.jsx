import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import 'lenis/dist/lenis.css';
import './styles.css';

// Entrance motion only when the visitor allows it; without this class everything renders in place.
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) document.documentElement.classList.add('motion');

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>);
