import {View, Text, StyleSheet, Button, Pressable, TouchableOpacity, ScrollView, ActivityIndicator, Image} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../../src/context/ThemeContext';
import { fetchLastGlobalWorkout, getCurrentRoutine, getWorkoutHistory, logOut } from '../../src/storage';
import { HitRoutine, routines } from '../../data/routines';
import Octicons from '@expo/vector-icons/Octicons';
import {Ionicons, FontAwesome5 } from '@expo/vector-icons';
import Feather from '@expo/vector-icons/Feather';
import { Calendar } from 'react-native-calendars';
import { WorkoutContext } from '../../src/context/WorkoutContext';
import AntDesign from '@expo/vector-icons/AntDesign';
import { supabase } from '../../src/lib/supabase';
import { syncAllUserData } from '../../src/lib/sync';
import MissionCard from '../../src/components/missionCard';


export default function HomeScreen(){
    const {isWorkoutActive, routineId, startWorkout, setIsChecking, fromLogin, setFromLogin} = useContext(WorkoutContext);
   //const [markedDates, setMarkedDates] = useState({});
    const[isReady, setIsReady] = useState(true);
    const[avatarUrl, setAvatarUrl] = useState(null);
    const [routine, setRoutine] = useState({});
    const [lastLog, setLastLog] = useState({});
    const {colorScheme, toggleTheme} = useContext(ThemeContext);
    const styles = createStyles(colorScheme);
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    let isDark = colorScheme === 'dark';
   
    useEffect(()=>{
      const getUser= async()=>{
        const {data:{user}} = await supabase.auth.getUser();
        if(!user) return;
        if(user.user_metadata?.avatar_url){
          setAvatarUrl(user.user_metadata.avatar_url);
        }
      }
      getUser();
    })
     useFocusEffect(
       useCallback( ()=>{
        const initializeDashboard = async ()=>{
          setLoading(true);
          
       if(fromLogin){
         await syncAllUserData();
          setFromLogin(false);
        
         
       }
      
        const data = await fetchLastGlobalWorkout();
        setLastLog(data);
        //console.log(data);
        if(data && data.date){
          const ready = hoursAgo(data.date);
          setIsReady(ready);
        }
        const currentRoutine = await findCurrentRoutine();
       // const history = await getWorkoutHistory();
       //setMarkedDates(history);
        setRoutine(currentRoutine);
        setLoading(false);
       
      };
      
     initializeDashboard();
      
     
    },[fromLogin])
     );
      

    const getRoutine = ()=>{
     if(routines[0].exerciseIds.includes(lastLog.exerciseId)){
      return routines[0].name;
     }
     else if(routines[1].exerciseIds.includes(lastLog.exerciseId)){
      return routines[1].name;
     }
     else{return routines[2].name}
    }
    const daysAgo = (dateString)=>{
      const past = new Date (dateString);
      const now = new Date();
      const diffTime = Math.abs(now-past);
      const diffDays = Math.floor(diffTime/(1000*60*60*24));
      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Yesterday";
      return `${diffDays} days ago`
    }
    
    const hoursAgo =(dateString)=>{
      const past = new Date (dateString);
      const now = new Date();
      const diffTime = Math.abs(now-past);
      const diffHrs = Math.floor(diffTime/(1000*60*60));
      if(diffHrs>48){return true;}
      else {return false;}
    }

    const findCurrentRoutine = async ()=>{
      const index = await getCurrentRoutine();
      const currentIndex = index+1 < HitRoutine.length ? index+1 : 0; 
      //console.log(currentIndex);
      const currentRoutineId = HitRoutine[currentIndex];
      //console.log(currentRoutineId);
      const currentRoutine = routines.find(rt=> rt.id === currentRoutineId);
      //console.log(currentRoutine);
      return currentRoutine;

    }
    //console.log(routine);
    //console.log(isReady);

    if(loading){
      return(
        <View style={{ flex: 1, backgroundColor: colorScheme==='dark' ? '#121212' : '#F5F5F5', justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size={60} color="#D32F2F" />
        </View>
      )
    }
    return(
        
          <SafeAreaView style={styles.container}>
             <View style={styles.masterHeader}>
             <TouchableOpacity style={styles.profile} onPress={()=> router.push('/profile')}>
              {avatarUrl?
              <Image source={{uri: avatarUrl}} style={styles.profileImage} resizeMode='cover'/>:<Ionicons name="person" size={30} color={isDark ? '#FFF' : '#000'} />}
             </TouchableOpacity>
             <Text style={styles.masterHeaderText}>INTENSITY</Text>
            <Pressable onPress={toggleTheme} style={{padding:8}}>
              {colorScheme==='dark'?
                <Octicons name="moon" size={30} color='white' selectable={undefined} style={{width: 36,}}/>:
                <Octicons name="sun" size={30} color='black' selectable={undefined} style={{width: 36,}}/>}
            </Pressable>
            </View>
          
        <ScrollView style={{ flex: 1, backgroundColor:colorScheme==='dark'?'black':'white',width:'100%',
         }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}> 
           
           
            {lastLog==null?<View></View>:
            <View style={styles.header}>
            <Text style={styles.headerText} >Last Workout : {getRoutine()}</Text>
            <Text style={styles.lastWorkout}>{daysAgo(lastLog.date)}</Text>
            </View>}
          
            <MissionCard/>
           
           <TouchableOpacity onPress={()=>{router.push('/log'); setIsChecking(true)}} style={styles.progressButton}>
            <Text style={styles.progressText}>View Progress</Text>
            <AntDesign name="line-chart" size={32} color="white" />
           </TouchableOpacity>
          </ScrollView>
          <StatusBar style={colorScheme==='dark'?'light':'dark'} />
        </SafeAreaView>
       
    );
}

function createStyles (colorScheme){
  let isDark = colorScheme === 'dark';
  return StyleSheet.create({
    container:{
      flex: 1,
      backgroundColor: colorScheme==='dark'?'black':'white',
      alignItems:'center',
      display: 'flex',
      flexDirection: 'column',
      gap:10,
      
    },
    scrollContent:{
      alignItems:'center',
      paddingBottom: 10,
    },
    masterHeader:{
      width: '100%',             
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
     // paddingHorizontal: 20,     
      paddingVertical: 15,      
      backgroundColor: 'transparent',
      borderBottomColor: '#D32F2F',
      borderWidth: 1,
    },
    masterHeaderText:{
      fontSize: 24,             
      color: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
      letterSpacing: 1,          
      textTransform: 'uppercase',
      fontWeight: '800',         
    },
    header:{
      borderWidth: 1,
      borderColor: colorScheme==='dark'?'papayawhip':'gray',
      borderRadius: 10,
      height:'auto',
      width:'92%',
      marginTop:10,
      backgroundColor:colorScheme==='dark'? '#222':'#f1f1f1',
      display: 'flex',
      alignItems:'center',
      justifyContent:'space-evenly',
      flexDirection:'row',
      padding:10,
      
    },
    headerText:{
      color:colorScheme==='dark'?'#FFFFFF':'#000000',
      fontSize:14,
      fontWeight:'500',
    },
    lastWorkout:{
      color:colorScheme==='dark'?'#AAAAAA':'#666666',
      fontSize:14,
      fontWeight:'500',
    },

    buttonSelector:{
      display:'flex',
      flexDirection:"row",
      gap: 20,
      alignItems:'center',
      justifyContent:'center',
    },
    macrosButton:{
      backgroundColor: '#2E7D32', 
      width: '92%',
      height: 100,                
      borderRadius: 20,
      marginTop: 15,              
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
    
    
      boxShadow: '0px 4px 8px rgba(46, 125, 50, 0.4)',
      elevation: 8,

    },
    buttonText:{
      color: 'white',
      fontSize: 20,
      fontWeight: 'bold',
    },
    newWorkout:{
      backgroundColor: '#D32F2F',
      
      width: '92%',
      height: 100,               
      borderRadius: 20,
      marginTop: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      boxShadow: '0px 4px 8px rgba(211, 47, 47, 0.4)', 
      elevation: 8,
    },
    nextWorkout:{
      color: 'white',                 
      fontSize: 18,
      fontWeight: 'bold',
      
    },
    mission:{
      color: 'rgba(255,255,255,0.8)', 
      fontSize: 10,
      fontWeight: 'bold',
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    recoveryCard:{
      backgroundColor: '#1976D2',
      width: '92%',
      height: 100,               
      borderRadius: 20,
      marginTop: 20,
      flexDirection:'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      boxShadow: '0px 4px 8px rgba(25, 118, 210, 0.4)',
      elevation: 8,
    },
    recoveryText:{
      color: 'white',                 
      fontSize: 20,
      fontWeight: 'bold',
    },
    progressButton:{
      backgroundColor: '#EF6C00',
      width: '92%',
      height: 80, 
      borderRadius: 20,
      marginTop: 15,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,

    
      boxShadow: '0px 4px 8px rgba(239, 108, 0, 0.4)',
      elevation: 6,
    },
    progressText:{
      color: 'white',
      fontSize: 20,
      fontWeight: 'bold',
      letterSpacing: 0.5,
    },
    profile:{
      width: 40,   
      height: 40,
      borderRadius: 20, 
      backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#D32F2F',
      overflow: 'hidden',
    
    },
    profileImage:{
      height:'100%',
      width:'100%',
    }
  })
}