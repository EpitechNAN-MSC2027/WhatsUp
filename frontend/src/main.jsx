import { StrictMode } from'react'
import { createRoot} from "react-dom/client";
import './index.css'
import Chat from './chat.jsx'
//import Login from 'login.jsx'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <Chat />
    </StrictMode>
)