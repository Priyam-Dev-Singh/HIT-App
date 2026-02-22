import { useContext, useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ThemeContext } from "../src/context/ThemeContext";
import { supabase } from "../src/lib/supabase";
import { logOut } from "../src/storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { WorkoutContext } from "../src/context/WorkoutContext";
import DataCalendar from "../src/components/calendar";
import MissionCard from "../src/components/missionCard";
import ProfileCard from "../src/components/profileCard";
import FadeInView from "../src/components/FadeInView";

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
      
             <View style={styles.headerBar}>
               <Text style={styles.screenTitle}>OPERATOR DOSSIER</Text>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} style={{flex: 1}} >
              <View style={styles.avatarContainer}>{avatarUrl?(<Image source={{uri:avatarUrl}} style={styles.profileImage} resizeMode="cover"/>): <Ionicons name="person" size={50} color={isDark ? '#FFF' : '#000'} />}</View>
           
              <Text style = {styles.emailText}>{email}</Text>
              <Text style={styles.quoteText}>Training with INTENSITY</Text>
           
             <FadeInView delay={500}>
               <ProfileCard/>
             </FadeInView>
              <View style={styles.divider}/>
              <View style={styles.sectionHeader}>
                    <FontAwesome5 name="calendar-check" size={16} color="#D32F2F" />
                    <Text style={styles.sectionTitle}>WORKOUT LOGS</Text>
                </View>
              <View style={styles.calendarWrapper}>
                <DataCalendar/>
              </View>
              <View style={{ height: 100 }} />
            </ScrollView>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogOut}>
                <Ionicons name="log-out-outline" size={24} color="#FFF" />
                {isLoading?<ActivityIndicator color='#fff'/>:
                <Text style ={styles.logoutText}>Sign Out</Text>}
            </TouchableOpacity>
            </SafeAreaView>
        
        
    )
}

function createStyles (isDark){

  const cardBg = isDark ? '#111111' : '#FFFFFF';
  const textMain = isDark ? '#FFFFFF' : '#000000';
  const primary = '#D32F2F';
  const border = isDark ? '#222222' : '#E0E0E0';
  const textMuted = isDark ? '#666666' : '#888888';

    return StyleSheet.create({
      container: {
      flex: 1,
      backgroundColor: isDark ? '#121212' : '#F5F5F5',
      alignItems: 'center',
      paddingBottom: 10,
      
    },
    headerBar: {
       paddingHorizontal: 20,
       borderBottomWidth: 1,
       borderBottomColor: border,
       paddingVertical: 17,
      },
  screenTitle: {
    width:'100%',
    fontWeight: '900',
    color:'#D32F2F',
    letterSpacing: 2,
    
    fontSize: 22,
  },
  scrollContent: {
    padding: 10,
  },
    avatarContainer: {
      marginTop: 30, 
      marginBottom: 20,
      width: 120,   
      height: 120,
      borderRadius: 60, 
      backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
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
      textAlign:'center',
      marginBottom: 5,
      letterSpacing:0.5,
    },
    quoteText: {
        width: '100%',
        textAlign:'center',
        fontSize: 14,
        color: isDark ? '#888' : '#666',
        fontStyle: 'italic',
        marginBottom: 20,
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
      
      bottom: 10, 
    },
    logoutText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
      marginLeft: 10,
    },
    calendarTitle:{
      height:'45',
      width:'200',
      backgroundColor: isDark?'#333':'#cdcdcd',
      paddingHorizontal: 20,
      paddingVertical: 5,
      alignItems:'center',
      justifyContent:'center',
      borderColor:'#D32F2F',
      borderRadius: 5,
      borderWidth: 1,
    },
    calendarWrapper: {
      backgroundColor: cardBg,
      borderWidth: 1,
      borderColor: '#D32F2F',
      borderRadius: 15,
        },
   sectionHeader: {
     marginHorizontal: 10,
     alignItems: 'center',
     marginBottom: 15,
     flexDirection: 'row',
    },
   sectionTitle: {
     fontWeight: 'bold',
     color: textMuted,
     letterSpacing: 1.5,
     marginLeft: 10,
     fontSize: 14,
        },
   divider: {
            height: 1,
            backgroundColor: border,
            marginBottom: 20,
        },     
    })
}