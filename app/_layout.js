import { Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "../src/context/ThemeContext";
import { WorkoutProvider } from "../src/context/WorkoutContext";
import { supabase } from "../src/lib/supabase";
import { use, useEffect, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, View } from "react-native";
import * as SplashScreen from 'expo-splash-screen';

    //console.log("Supabase client active", supabase);
export default function Layout (){
    const router = useRouter();
    const segments = useSegments();
    const [session, setSession] = useState(null);
    const [isInitialized, setIsInitialised] = useState(false);
    
    useEffect(()=>{
       supabase.auth.getSession().then(({data:{session}})=>{
            setSession(session);
            setIsInitialised(true);
        })
       
         const {data :{subscription}} = supabase.auth.onAuthStateChange((_event, session)=>{
            setSession(session);
        });
        return ()=> subscription?.unsubscribe();
    },[]);

   
    useEffect(()=>{
        if(!isInitialized)return;

        const currentGroup= segments[0];

        if(!session && currentGroup !=='auth'){
            router.replace('/auth/login');
        } else if(session && currentGroup==='auth'){
            router.replace('/(tabs)');
        }

    },[session, isInitialized, segments])

    if(!isInitialized){
        return(
            <View style={styles.splashContainer}>
                <Image 
                source={require('../assets/mySplash.png')}
                style={styles.splashImage}
                resizeMode="contain"/>
                
            </View>
        )
    }
    
   
    return(
        <ThemeProvider>
            <WorkoutProvider>
                <SafeAreaProvider>
                <Stack>
                    <Stack.Screen name="auth/login" options={{headerShown:false}}/>
                    <Stack.Screen name="onboarding" options={{headerShown:false}}/>
                    <Stack.Screen name='(tabs)' options = {{headerShown:false}} />
                    <Stack.Screen name = 'logger/[id]' options = {{headerShown:false}}/>
                    <Stack.Screen name = 'workout/[id]' options = {{headerShown:false}}/>
                </Stack>
            </SafeAreaProvider>
            </WorkoutProvider>
        </ThemeProvider>
    )

}
const styles = StyleSheet.create({
    splashContainer: {
        flex: 1,
        backgroundColor: '#000000', // Match this to your splash background color
        justifyContent: 'center',
        alignItems: 'center',
    },
    splashImage: {
        width: '50%',
        height: '50%',
    }
})