import {View, Text, StyleSheet, Button} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
export default function HomeScreen(){
    
    const router = useRouter();
    return(
        <SafeAreaView style={{flex: 1, backgroundColor: 'black', alignItems:'center', display: 'flex', flexDirection: 'column', gap:10,}}>
            <Text style={{color:'papayawhip', margin: 20, fontSize: 30}}>Hello, HIT App</Text>
          <View style={{width: 180, margin: 20,}}>
              <Button
            title="Select a workout"
            onPress={()=>router.push(`/log`)}
            color='red'
            />
          </View>
        </SafeAreaView>
    );
}
