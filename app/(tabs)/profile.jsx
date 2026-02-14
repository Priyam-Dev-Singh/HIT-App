import { useContext, useEffect, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ThemeContext } from "../../src/context/ThemeContext";
import { supabase } from "../../src/lib/supabase";
import { logOut } from "../../src/storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';
import { WorkoutContext } from "../../src/context/WorkoutContext";

export default function ProfileScreen(){
    const {endWorkout} = useContext(WorkoutContext);
    const {colorScheme} = useContext(ThemeContext);
    const isDark = colorScheme === 'dark';
    const [email, setEmail] = useState('loading...');
    const[avatarUrl, setAvatarUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const styles = createStyles(isDark);

    useEffect(()=>{
        const getUser =async()=>{
            const{data:{user}} = await supabase.auth.getUser();
            if(user){setEmail(user.email);
                 if(user.user_metadata?.avatar_url){
                setAvatarUrl(user.user_metadata.avatar_url);
                 }
            }; 
        }
        getUser();
    },[])
    const handleLogOut = async ()=>{
        setIsLoading(true);
        endWorkout();
        await logOut();
        setIsLoading(false);
    }
    
    return(
        <SafeAreaView style={styles.container}>
            <View style={styles.avatarContainer}>
               {avatarUrl?(<Image source={{uri:avatarUrl}} style={styles.profileImage} resizeMode="cover"/>): <Ionicons name="person" size={50} color={isDark ? '#FFF' : '#000'} />}
            </View>
            <Text style = {styles.emailText}>{email}</Text>
            <Text style={styles.quoteText}>Training with INTENSITY</Text>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogOut}>
                <Ionicons name="log-out-outline" size={24} color="#FFF" />
                {isLoading?<ActivityIndicator color='#fff'/>:
                <Text style ={styles.logoutText}>Sign Out</Text>}
            </TouchableOpacity>
        </SafeAreaView>
        
    )
}

function createStyles (isDark){
    return StyleSheet.create({
      container: {
      flex: 1,
      backgroundColor: isDark ? '#121212' : '#F5F5F5',
      padding: 20,
      alignItems: 'center',
    },
    avatarContainer: {
      marginTop: 80, 
      marginBottom: 20,
      width: 120,   
      height: 120,
      borderRadius: 60, 
      backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 3,
      borderColor: '#D32F2F',
      overflow: 'hidden',
    },
    profileImage: {
      width: '100%',
      height: '100%',
    },
    emailText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: isDark ? '#FFFFFF' : '#000000',
      marginBottom: 5,
      letterSpacing:0.5,
    },
    quoteText: {
        width: '100%',
        textAlign:'center',
        fontSize: 14,
        color: isDark ? '#888' : '#666',
        fontStyle: 'italic',
        marginBottom: 40,
    },
    logoutButton: {
      flexDirection: 'row',
      backgroundColor: '#D32F2F',
      paddingVertical: 15,
      paddingHorizontal: 40,
      borderRadius: 30,
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      position: 'absolute',
      bottom: 40, 
    },
    logoutText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
      marginLeft: 10,
    },
    })
}