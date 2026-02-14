import { Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "../src/context/ThemeContext";
import { WorkoutProvider } from "../src/context/WorkoutContext";
import { supabase } from "../src/lib/supabase";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { syncAllUserData } from "../src/lib/sync";

    //console.log("Supabase client active", supabase);
export default function Layout (){
    const router = useRouter();
    const segments = useSegments();
    const [session, setSession] = useState(null);
    const [isInitialized, setIsInitialised] = useState(false);
    
    useEffect(()=>{
       /* supabase.auth.getSession().then(({data:{session}})=>{
            setSession(session);
           
            
        })*/
       
         const {data :{subscription}} = supabase.auth.onAuthStateChange((_event, session)=>{
            setSession(session);
           if(session){
                
                router.replace('/');
                setIsInitialised(true);
            }
            else { router.replace('/auth/login');}
        });
        return ()=> subscription?.unsubscribe();
    },[]);

    /*useEffect(()=>{
        if(!isInitialized)return;
        const inAuthGroup = segments[0]==='(tabs)';
        if(session && !inAuthGroup){
            router.replace('/(tabs)');
        } else if(!session && segments[0]!=='auth'){
            router.replace('/auth/login');
        }

    },[session, isInitialized, segments])

    if(!isInitialized){
        return(
            <View style={{ flex: 1, backgroundColor:'#121212', justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size={60} color="#D32F2F" />
            </View>
        )
    }*/
   
    return(
        <ThemeProvider>
            <WorkoutProvider>
                <SafeAreaProvider>
                <Stack>
                    <Stack.Screen name="auth/login" options={{headerShown:false}}/>
                    <Stack.Screen name='(tabs)' options = {{headerShown:false}} />
                    <Stack.Screen name = 'logger/[id]' options = {{headerShown:false}}/>
                    <Stack.Screen name = 'workout/[id]' options = {{headerShown:false}}/>
                </Stack>
            </SafeAreaProvider>
            </WorkoutProvider>
        </ThemeProvider>
    )

}