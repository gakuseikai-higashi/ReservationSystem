import ReactDOM from 'react-dom/client';
import App from './app/App';

// Render.com スリープ解除用 ping（同一タブ内で1回だけ）
if (!sessionStorage.getItem('pinged')) {
  sessionStorage.setItem('pinged', '1');
  fetch((import.meta as any).env.VITE_BACKEND_URL || 'http://127.0.0.1:8000', {
    method: 'GET',
  }).catch(() => {});
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
