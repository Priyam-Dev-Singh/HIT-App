import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../src/lib/supabase";
import { Alert, TextInput, View, Text, KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, ActivityIndicator, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import AntDesign from '@expo/vector-icons/AntDesign';
import { syncAllUserData } from "../../src/lib/sync";
import * as WebBrowser from 'expo-web-browser';
import {makeRedirectUri} from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();


export default function LoginPage(){
    const router = useRouter();
    const [email, setEmail]= useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isLogin, setIsLogin] = useState(true);

    const styles = createStyles();

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

    async function handleGoogleSignIn(){
        //Alert.alert("Google Sign In button");
        try{
            setLoading(true);
            const redirectUrl = makeRedirectUri({
                scheme:'intensity',
                path:'auth/callback'
            });
            console.log("My redirect url is ", redirectUrl);
            const {data, error} = await supabase.auth.signInWithOAuth({
                provider:'google',
                options:{
                    redirectTo: redirectUrl,
                    skipBrowserRedirect: true,
                }
            });
            if(error)throw error;

            const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
            if(result.type==='success'){
                const url = result.url;

                const getTokens = (url)=>{
                    let params = {};
                    const queryString = url.split('#')[1] || url.split('?')[1];
                    if(queryString){
                        queryString.split('&').forEach(param => {
                            const [key, value] = param.split("=");
                            params[key] = value;
                        });
                    }
                    return params;
                };

                const {access_token, refresh_token} = getTokens(url);

                if(access_token && refresh_token){
                    const {error: sessionError}=await supabase.auth.setSession({
                        access_token,
                        refresh_token
                    });
                    if(sessionError){
                        console.error("Error setting session", sessionError);
                    }else{
                        console.log("Session set the router should take over now");
                    }
                }
                console.log("Google sign in successful");
            }

        }catch(e){console.error("Erorr while signing through google", e);}
        finally{
            setLoading(false);
        }
    }
    return(
           <KeyboardAvoidingView behavior={Platform.OS === 'ios'?'height':'padding'} style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>INTENSITY</Text>
                <Text style={styles.subTitle}>Train optimally not everyday</Text>
            </View>
            <View style={styles.tabContainer}>
                <TouchableOpacity style={[styles.tab, isLogin && styles.activeTab]} onPress={()=> setIsLogin(true)}>
                    <Text style= {[styles.tabText, isLogin && styles.activeTabText]}>Sign In</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tab, !isLogin && styles.activeTab]} onPress={()=> setIsLogin(false)}>
                    <Text style= {[styles.tabText, !isLogin && styles.activeTabText]}>Sign Up</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.form}>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Email</Text>
                     <TextInput
                     style={styles.input}
                     placeholder="gymrat@example.com"
                     placeholderTextColor='#666'
                     value={email}
                     onChangeText={text=>setEmail(text)}
                     keyboardType="email-address"
                     autoCapitalize={'none'}
                    />
                </View>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Password</Text>
                    <TextInput
                    style={styles.input}
                    placeholder="Minimum 8 characters"
                    placeholderTextColor="#666"
                    value={password}
                    onChangeText={text=>setPassword(text)}
                    secureTextEntry={true}
                    autoCapitalize={'none'}
                    />
                </View>
                <TouchableOpacity style={styles.primaryButton} onPress={()=> isLogin? signInWithEmail(): signUpWithEmail()} disabled={loading}>
                    {loading?( <ActivityIndicator color='#FFF'/>):(<Text style={styles.primaryButtonText}>{isLogin?'LOG IN':'CREATE ACCOUNT'}</Text>)}
                </TouchableOpacity>

                <View style={styles.dividerContainer}>
                    <View style = {styles.dividerLine}/>
                    <Text style = {styles.dividerText}>OR</Text>
                    <View style = {styles.dividerLine}/>
                </View>

                <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn}>
                    <AntDesign name="google" size={24} color="black" style={styles.googleIcon} />
                    <Text style={styles.googleButtonText}>Continue with Google</Text>
                </TouchableOpacity>


            </View>
           
           
       {/* <View>
            <Button title="Sing Up" onPress={signUpWithEmail} disabled={loading}/>
            <Button title="Sing In" onPress={signInWithEmail} disabled={loading}/>
        </View>*/}

            <StatusBar style="light" />
            
           </KeyboardAvoidingView>
    );
}

function createStyles(){

    return StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#121212', 
    },
  header: {
    marginBottom: 40,
    alignItems: 'center',
        
  },
  title: {
    width:'100%',
    fontSize: 42,
    fontWeight: '900', 
    color: '#FFF',
    letterSpacing: 1,
    fontStyle: 'italic', 
    paddingHorizontal: 12,  
    textAlign: 'center',
  },
  subTitle: {
    fontSize: 16,
    color: '#888',
    marginTop: 5,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#D32F2F',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#FFF',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: '#BBB',
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#1E1E1E',
    color: '#FFF',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  primaryButton: {
    backgroundColor: '#D32F2F',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#D32F2F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5, 
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#333',
  },
  dividerText: {
    color: '#666',
    paddingHorizontal: 10,
    fontSize: 12,
    fontWeight: 'bold',
  },
  googleButton: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
  },
  googleIcon: {
    marginRight: 10,
  },
  googleButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
})
}