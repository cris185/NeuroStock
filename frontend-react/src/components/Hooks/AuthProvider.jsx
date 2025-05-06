import {useState, useContext, createContext} from 'react'

// Create a context for authentication
const AuthContext = createContext();

const AuthProvider = ({children}) => {
    const [isLoggedIn, setIsLoggedIn] = useState(
        !!localStorage.getItem('accessToken')
    );
        
  return (
    <AuthContext.Provider value={{isLoggedIn, setIsLoggedIn}}>
      {/* The children components will have access to the AuthContext */}
        {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
export { AuthContext };