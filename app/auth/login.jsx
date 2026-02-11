import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../src/lib/supabase";
import { Alert, Button, TextInput, View, Text } from "react-native";
import { useRouter } from "expo-router";
import { syncAllUserData } from "../../src/lib/sync";


export default function LoginPage(){
    const router = useRouter();
    const [email, setEmail]= useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const signInWithEmail = async ()=>{
        setLoading(true);
        const {error} = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        })
        if(error){
            Alert.alert(error.message);
        }
        else{
            await syncAllUserData();
            router.replace('/');
        }
         setLoading(false);
    }

    const signUpWithEmail = async ()=>{
        setLoading(true);
        const{
            data:{session},
            error,
        } = await supabase.auth.signUp({
            email: email,
            password: password,
        })

        if(error){Alert.alert(error.message)}
        else if(!session){Alert.alert("Please check inbox for email verification");
        }
        else{Alert.alert("Account Created");
            router.replace('/');
        }

        setLoading(false);
    }
    return(
        <SafeAreaView>
            <Text>
                Login/Signup Page
            </Text>
            <TextInput
            placeholder="email@address.com"
            value={email}
            onChangeText={text=>setEmail(text)}
            autoCapitalize={'none'}
            />
            <TextInput
            placeholder="password"
            value={password}
            onChangeText={text=>setPassword(text)}
            secureTextEntry={true}
            autoCapitalize={'none'}
            />
        <View>
            <Button title="Sing Up" onPress={signUpWithEmail} disabled={loading}/>
            <Button title="Sing In" onPress={signInWithEmail} disabled={loading}/>
        </View>
            
        </SafeAreaView>
    );
}