import {View, Text, StyleSheet, Button, Appearance} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
export default function HomeScreen(){
    const colorScheme = Appearance.getColorScheme();
    const router = useRouter();
    return(
        <SafeAreaView style={{flex: 1, backgroundColor: 'black', alignItems:'center', display: 'flex', flexDirection: 'column', gap:10,}}>
            <Text style={{color:'papayawhip', margin: 20, fontSize: 30}}>Hello, HIT App</Text>
          <View style={{width: 180, margin: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
              <Button
            title="Select a workout"
            onPress={()=>router.push(`/log`)}
            color='red'
            style={{margin: 20,}}
            />
            <Button
            title="Add your macros"
            onPress={()=>router.push('/diet/macros')}
            color='green'
            style={{margin: 20,}}
            />
          </View>
          <StatusBar style="inverted" />
        </SafeAreaView>
    );
}
