import { useState, useEffect, createContext } from 'react'
import axiosInstance from '../axiosInstance'

// Create a context for authentication
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(
        !!localStorage.getItem('accessToken')
    );
    const [user, setUser] = useState(null);

    // Fetch real user data whenever logged-in state becomes true
    useEffect(() => {
        if (!isLoggedIn) {
            setUser(null);
            return;
        }
        axiosInstance.get('/user/profile/')
            .then(res => setUser(res.data))
            .catch(() => setUser(null));
    }, [isLoggedIn]);

    return (
        <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, user, setUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthProvider
export { AuthContext };
