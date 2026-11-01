import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './styles/tokens.css';
import './styles/monitor.css';
import './styles/screen.css';
import './styles/portfolio-screen.css';
import './styles/crt-edges.css';

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
