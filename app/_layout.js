import { Stack, useRouter } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "../src/context/ThemeContext";
import { WorkoutProvider } from "../src/context/WorkoutContext";
import { supabase } from "../src/lib/supabase";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

    //console.log("Supabase client active", supabase);
export default function Layout (){
    const router = useRouter();
    
    useEffect(()=>{
        const {data :{subscription}} = supabase.auth.onAuthStateChange((event, session)=>{
            if(session){
                router.replace('/'); 
                //console.log(session)
                }
            else{ router.replace('/auth/login')}
          
        });
        return ()=> subscription?.unsubscribe();
    },[]);
    
    return(
        <ThemeProvider>
            <WorkoutProvider>
                <SafeAreaProvider>
                <Stack>
                    <Stack.Screen name='index' options = {{headerShown:false}} />
                    <Stack.Screen name='log' options = {{headerShown:false}}/>
                    <Stack.Screen name = 'logger/[id]' options = {{headerShown:false}}/>
                    <Stack.Screen name = 'workout/[id]' options = {{headerShown:false}}/>
                    <Stack.Screen name = 'diet/macros' options = {{headerShown:false}}/>
                </Stack>
            </SafeAreaProvider>
            </WorkoutProvider>
        </ThemeProvider>
    )

}