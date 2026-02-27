import { Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "../src/context/ThemeContext";
import { WorkoutProvider } from "../src/context/WorkoutContext";
import { supabase } from "../src/lib/supabase";
import { useEffect, useState } from "react"; // Removed 'use'
import { Image, StyleSheet, View, Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
// Removed unused SplashScreen import

export default function Layout() {
    const router = useRouter();
    const segments = useSegments();
    
   
    const [session, setSession] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isOfflineMode, setIsOfflineMode] = useState(false); 
    const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false); 

   
    useEffect(() => {
        const initializeApp = async () => {
            try {
               
                const onboardingStatus = await AsyncStorage.getItem('onboarding_completed');
                setHasSeenOnboarding(onboardingStatus === 'true');

                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) throw error;
                
                if (session) {
                    setSession(session);
                    setIsOfflineMode(false);
                    await AsyncStorage.setItem('@active_user', 'true');
                }
            } catch (e) {
                console.error("Auth initialization error", e); 
                
                // Network failed. Activate Offline Bypass natively, DO NOT fake the session.
                const isActiveUser = await AsyncStorage.getItem('@active_user');
                if (isActiveUser === 'true') {
                    setIsOfflineMode(true); 
                } else {
                    setSession(null);
                    setIsOfflineMode(false);
                }
            } finally {
                setIsInitialized(true);
            }
        };
        
        initializeApp();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT') {
                setSession(null);
                setIsOfflineMode(false);
            } else if (session) {
                setSession(session);
                setIsOfflineMode(false);
            }
        });
        
        return () => subscription?.unsubscribe();
    }, []);

    
    useEffect(() => {
       
        if (!isInitialized || !segments || segments.length === 0) return;

        const routeUser = async () => {
            const currentGroup = segments[0];

            let onboarded = hasSeenOnboarding;
            if (!onboarded) {
                const status = await AsyncStorage.getItem('onboarding_completed');
                onboarded = (status === 'true');
                
                // If they JUST finished it, update Layout's brain so it knows!
                if (onboarded) setHasSeenOnboarding(true); 
            }
            // SCENARIO 1: Brand New Install
            if (!onboarded) {
                if (currentGroup !== 'onboarding') {
                    router.replace('/onboarding');
                }
                return; 
            }

            // SCENARIO 2: No Auth AND Not in Offline Mode
            if (!session && !isOfflineMode) {
                if (currentGroup !== 'auth') {
                    router.replace('/auth/login');
                }
                return; 
            }

            // SCENARIO 3: Authenticated OR Valid Offline Mode
            if (session || isOfflineMode) {
                if (currentGroup === 'onboarding' || currentGroup === 'auth') {
                    router.replace('/(tabs)');
                }
                return;
            }
        };

        routeUser();
    }, [session, isInitialized, segments, hasSeenOnboarding, isOfflineMode]);

    if (!isInitialized) {
        return (
            <View style={styles.splashContainer}>
                <Image 
                    source={require('../assets/mySplash.png')}
                    style={styles.splashImage}
                    resizeMode="contain"
                />
            </View>
        );
    }
    
    return (
        <ThemeProvider>
            <WorkoutProvider>
                <SafeAreaProvider>
                    {isOfflineMode && (
                        <View style={styles.offlineBanner}>
                            <Text style={styles.offlineText}>⚠️ NO INTERNET CONNECTION! VIEW ONLY MODE</Text>
                        </View>
                    )}
                    <Stack>
                        <Stack.Screen name="auth/login" options={{headerShown: false}} />
                        <Stack.Screen name="onboarding" options={{headerShown: false}} />
                        <Stack.Screen name="(tabs)" options={{headerShown: false}} />
                        <Stack.Screen name="logger/[id]" options={{headerShown: false}} />
                        <Stack.Screen name="workout/[id]" options={{headerShown: false}} />
                        <Stack.Screen name="profile" options={{headerShown: false}} />
                        <Stack.Screen name="misc/menu" options={{headerShown: false}} />
                        <Stack.Screen name="misc/aboutUs" options={{headerShown: false}} />
                    </Stack>
                </SafeAreaProvider>
            </WorkoutProvider>
        </ThemeProvider>
    );
}

const styles = StyleSheet.create({
    splashContainer: {
        flex: 1,
        backgroundColor: '#000000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    splashImage: {
        width: '50%',
        height: '50%',
    },
    offlineBanner: {
        backgroundColor: '#D32F2F', 
        paddingTop: 50, 
        paddingBottom: 10,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999, 
    },
    offlineText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 1.5,
    }
});