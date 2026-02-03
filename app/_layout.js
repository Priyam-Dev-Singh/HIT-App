import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "../src/context/ThemeContext";
import { WorkoutProvider } from "../src/context/WorkoutContext";

export default function Layout (){

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