import { createRoot } from 'react-dom/client'
import './index.css'
import './App.css'
import './delivery.css'
import Delivery from './DeliveryPage'

createRoot(document.getElementById('delivery-root')!).render(<Delivery />)
