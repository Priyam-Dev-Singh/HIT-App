import { Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "../src/context/ThemeContext";
import { WorkoutProvider } from "../src/context/WorkoutContext";
import { supabase } from "../src/lib/supabase";
import { use, useEffect, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, View } from "react-native";
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Text } from "react-native";

    //console.log("Supabase client active", supabase);
export default function Layout (){
    const router = useRouter();
    const segments = useSegments();
    const [session, setSession] = useState(null);
    const [isInitialized, setIsInitialised] = useState(false);
    const [isOffline, setIsOffline] = useState(false);
    
    useEffect(()=>{
        const initializeAuth = async()=>{
            try{
                const {data:{session}, error} = await supabase.auth.getSession();
                if(error)throw error;
                setSession(session);
                setIsOffline(false);
                if(session)await AsyncStorage.setItem('@active_user', 'true');

            }catch(e){
                console.error("Auth initialisation error", e); 
               
                setIsOffline(true);
                const isActiveUser = await AsyncStorage.getItem('@active_user');
                const hasSeenOnboarding = await AsyncStorage.getItem('onboarding_completed');
                if(isActiveUser==='true' || hasSeenOnboarding==='true'){
                    setSession({offlineMode : true})
                }else{ setSession(null);}

                    }finally{setIsInitialised(true)}
        };
        initializeAuth();

        const {data :{subscription}} = supabase.auth.onAuthStateChange((_event, session)=>{
           if(session) setSession(session);
        });
        return ()=> subscription?.unsubscribe();

    },[]);

   
    useEffect(()=>{
        if(!isInitialized)return;

       const routeUser = async()=>{
         const currentGroup= segments[0];

        if(!session){
           if( currentGroup !=='onboarding') {router.replace('/onboarding');}
           return;
        
        } 
        try{
           const hasSeenOnboarding =  await AsyncStorage.getItem('onboarding_completed');
           if(hasSeenOnboarding==='true'){
            if (currentGroup === 'onboarding' || currentGroup === 'auth') {
                router.replace('/(tabs)');
            }
           }
           else{
           if(currentGroup !== 'onboarding') router.replace('/onboarding');
           }
        }catch(e){console.error(e); router.replace('/(tabs)');}
       }
        routeUser();
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
                {isOffline && (
                    <View style={styles.offlineBanner}>
                        <Text style={styles.offlineText}>⚠️ NO INTERNET CONNECTION! VIEW ONLY MODE</Text>
                    </View>
                )}
                <Stack>
                    <Stack.Screen name="auth/login" options={{headerShown:false}}/>
                    <Stack.Screen name="onboarding" options={{headerShown:false}}/>
                    <Stack.Screen name='(tabs)' options = {{headerShown:false}} />
                    <Stack.Screen name = 'logger/[id]' options = {{headerShown:false}}/>
                    <Stack.Screen name = 'workout/[id]' options = {{headerShown:false}}/>
                    <Stack.Screen name = 'profile' options = {{headerShown:false}}/>
                    <Stack.Screen name = 'misc/menu' options = {{headerShown:false}}/>
                    <Stack.Screen name = 'misc/aboutUs' options = {{headerShown:false}}/>

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
    },
    offlineBanner: {
        backgroundColor: '#D32F2F', // Intensity Red
        paddingTop: 50, // Pushes it down below the iOS/Android status bar
        paddingBottom: 10,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999, // Ensures it floats above everything else
    },
    offlineText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 1.5,
    }
})