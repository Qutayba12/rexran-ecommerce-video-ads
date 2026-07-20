import { createRoot } from 'react-dom/client'
import './index.css'
import './App.css'
import './admin.css'
import Admin from './AdminPage'

createRoot(document.getElementById('admin-root')!).render(<Admin />)
