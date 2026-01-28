import { createContext, useEffect, useState } from "react";
import { Appearance } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const ThemeContext = createContext({});
export const ThemeProvider = ({children}) => {
    const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme()||'dark');

    useEffect(()=>{
        try{
            const loadTheme = async ()=>{
                const savedTheme = await AsyncStorage.getItem('userTheme');
                if(savedTheme){setColorScheme(savedTheme);};
            }
            loadTheme();
        }catch(e){console.error("Error getting theme!", e)}
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