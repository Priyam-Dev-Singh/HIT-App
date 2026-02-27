import { createContext, useEffect, useState } from "react";
import { Appearance } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const ThemeContext = createContext({});
export const ThemeProvider = ({children}) => {
    const [colorScheme, setColorScheme] = useState('dark');

    useEffect(()=>{
        
            const loadTheme = async ()=>{
            try{
                const savedTheme = await AsyncStorage.getItem('userTheme');
                if(savedTheme){setColorScheme(savedTheme);};
                }catch(e){console.error("Error getting theme!", e)}
            }
            loadTheme();
       
    },[]);

    const toggleTheme = async ()=> {
        const newTheme = colorScheme === 'dark' ? 'light':'dark';
        setColorScheme(newTheme);
        await AsyncStorage.setItem('userTheme', newTheme);

    }

    return(
        <ThemeContext.Provider value={{colorScheme, toggleTheme}}>
            {children}
        </ThemeContext.Provider>
    )
}