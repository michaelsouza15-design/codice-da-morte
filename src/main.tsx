import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { GameFrameProvider } from './context/GameFrameContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GameFrameProvider>
      <App />
    </GameFrameProvider>
  </StrictMode>,
);
