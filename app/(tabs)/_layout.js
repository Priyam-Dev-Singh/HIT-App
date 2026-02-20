import { Tabs, useRouter } from "expo-router";
import { useContext } from "react";
import { ThemeContext } from "../../src/context/ThemeContext";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Feather from '@expo/vector-icons/Feather';
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from 'expo-blur';


export default function TabLayout (){

    const router = useRouter();
    const {colorScheme} = useContext(ThemeContext);
    const insets = useSafeAreaInsets();
    const isDark = colorScheme === 'dark';
  //  console.log(`theme is ${colorScheme} and isDark is ${isDark}`);

    const tabStyles ={
        tabBarActiveTintColor: '#D32F2F', 
        tabBarBackground:()=><BlurView tint={isDark?'dark':'light'} intensity={100} style={StyleSheet.absoluteFill} />,
        tabBarInactiveTintColor: isDark ? '#888' : '#A0A0A0',
        tabBarStyle: {
        // Lift it off the bottom edge!
        backgroundColor: isDark ? '#000000':'#ffffff', // Fallback semi-transparent color
        overflow: 'hidden',
    },
    headerStyle: {
      backgroundColor: isDark ? '#121212' : '#FFFFFF',
    },
    headerTintColor: isDark ? '#FFF' : '#000',
    }

   return(
        <Tabs screenOptions={tabStyles}>
            <Tabs.Screen name="index" options={{title:'Home', tabBarIcon: ({color})=> <Ionicons name='home' size ={24} color={color}/>, headerShown:false}}/>
            <Tabs.Screen name="macros" options={{title:'Diet', tabBarIcon: ({color})=> <MaterialCommunityIcons name='food-apple' size ={24} color={color}/>, headerShown:false}}/>
            <Tabs.Screen name="log" options={{title:'Progress', tabBarIcon: ({color})=> <Ionicons name='bar-chart' size ={24} color={color}/>, headerShown:false}}/>
            <Tabs.Screen name="calibration" options={{title:'Calibration', tabBarIcon: ({color})=> <Feather name="sliders" size={24} color={color} />, headerShown:false}}/>
        </Tabs>
        
        
        
   )

    

    
}