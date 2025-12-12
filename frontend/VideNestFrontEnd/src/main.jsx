// ============================================
// APPLICATION ENTRY POINT
// ============================================
// This is where React application starts.
// Everything begins here: Redux store, routing, global styles.

import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import "./index.css" // Global styles and Tailwind CSS imports
import App from "./App.jsx"
import { Provider } from "react-redux"
import store from "./store/index.js"

/**
 * RENDER APPLICATION
 *
 * What happens here?
 * 1. Find HTML element with id="root" (in index.html)
 * 2. Create React root using React 18's createRoot API
 * 3. Render app with wrappers (StrictMode, Provider)
 *
 * Component Hierarchy:
 * <StrictMode>              // Development safety checks (warns about deprecated APIs)
 *   <Provider store={store}> // Makes Redux store available to ALL components
 *     <App />                // Your main app component (routes, layouts, pages)
 *   </Provider>
 * </StrictMode>
 *
 * Why this order?
 * - StrictMode outermost: Checks entire app for issues
 * - Provider middle: Wraps app so all components can access Redux
 * - App innermost: Your actual application code
 */
createRoot(document.getElementById("root")).render(
    <StrictMode>
        {/* 
          REDUX PROVIDER
          
          What does <Provider> do?
          - Makes Redux store accessible to any component via useSelector/useDispatch
          - Without this, components can't read/update global state
          
          How it works:
          - Uses React Context API under the hood
          - Any component can now: 
            const user = useSelector(state => state.auth.user)
            const dispatch = useDispatch()
        */}
        <Provider store={store}>
            {/* 
              ROUTER PROVIDER
              - Moved here from App.jsx so App can use useLocation()
            */}
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </Provider>
    </StrictMode>
)
