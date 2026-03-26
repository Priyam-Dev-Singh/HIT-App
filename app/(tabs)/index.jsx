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
import { WorkoutContext } from '../../src/context/WorkoutContext';
import AntDesign from '@expo/vector-icons/AntDesign';
import { supabase } from '../../src/lib/supabase';
import { syncAllUserData } from '../../src/lib/sync';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MissionCard from '../../src/components/missionCard';
import ProtocolChecklist from '../../src/components/protocolChecklist';
import CustomMissionCard from '../../src/components/customMissionCard';
import IntensityDossier from '../../src/components/protocolDossier/intensityDossier';
import CustomDossier from '../../src/components/protocolDossier/customDossier';
import WhatsNewModal from '../../src/components/misc/whatsNew';
import Constants from 'expo-constants';




export default function HomeScreen(){
    const {fromLogin, setFromLogin, setActiveProtocol,activeProtocol, isProtocolLoading, initializeProtocol} = useContext(WorkoutContext);
   //const [markedDates, setMarkedDates] = useState({});
    const[isReady, setIsReady] = useState(true);
    const [routine, setRoutine] = useState({});
    const [lastLog, setLastLog] = useState({});
    const {colorScheme} = useContext(ThemeContext);
    const styles = createStyles(colorScheme);
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);

    const currentAppVersion = Constants.expoConfig?.version;

    const [lastCustomWorkout, setLastCustomWorkout] = useState(null);
    let isDark = colorScheme === 'dark'; 
   
     useFocusEffect(  
       useCallback( ()=>{
        const initializeDashboard = async ()=>{
          setLoading(true);

          const lastSeenVersion = await AsyncStorage.getItem('lastVersionSeen');
          if(lastSeenVersion !== currentAppVersion) setShowUpdateModal(true);


          if(fromLogin){
            await syncAllUserData();
            await initializeProtocol();
            setFromLogin(false);  
          }

        const data = await fetchLastGlobalWorkout();
        setLastLog(data);
        //console.log(data);
        if(data && data.date){
          const ready = hoursAgo(data.date);
          setIsReady(ready);
        }
       if(activeProtocol==='hit'){
         const currentRoutine = await findCurrentRoutine();
         setRoutine(currentRoutine);
       }
       else if(activeProtocol==='custom'){
        const jsonValue = await AsyncStorage.getItem('customRoutine');
        
        const customRoutine = JSON.parse(jsonValue);
        const lastWorkoutId = await AsyncStorage.getItem('lastWorkoutId');
        const lastCustomWorkout = customRoutine.workouts.find(w=>w.id===lastWorkoutId);
        setLastCustomWorkout(lastCustomWorkout);
       }
       
        setLoading(false);
      };

     
     initializeDashboard();

    },[fromLogin, activeProtocol])
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
      if(activeProtocol === 'hit'){
        if(diffHrs>48){
          return true;
        }
        else {return false;}
      }
      else{
        if(diffHrs>12) return true;
        else false;
      }
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

    const setHIT = async()=>{
      try{
        const{data:{user}} = await supabase.auth.getUser();
        await supabase.from('profiles').update({active_protocol : 'hit'}).eq('user_id', user.id);
        await AsyncStorage.setItem('active_protocol', 'hit');
        setActiveProtocol('hit');
      }catch(e){console.log("error setting active protocol",e)}
    }

    const handleCloseUpdateModal = async()=>{
      try{
        await AsyncStorage.setItem("lastVersionSeen", currentAppVersion);
        setShowUpdateModal(false);
      }catch(e){console.error("error saving last version"); setShowUpdateModal(false);}
    }

    if(loading||isProtocolLoading){
      return(
        <View style={{ flex: 1,flexDirection:'column', backgroundColor: colorScheme==='dark' ? '#121212' : '#F5F5F5', justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size={60} color="#D32F2F" />
            <Text style={{alignSelf:'center', fontSize:15, color:'white'}}>Getting all your workout...</Text>
        </View>
      )
    }
    return(
        
          <SafeAreaView style={styles.container} edges={['top']}>
             <View style={styles.masterHeader}>
              <Pressable onPress={()=>router.push('/misc/menu')}><Feather name="menu" size={30} color={colorScheme==='dark'?'white':'black'} /></Pressable>
             <Text style={styles.masterHeaderText}>INTENSITY</Text>
            </View>
          
        <ScrollView style={{ flex: 1, backgroundColor:colorScheme==='dark'?'black':'white',width:'100%',
         }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}> 
           
        {activeProtocol === null ?
        (
          <View style={{flex:1, backgroundColor: '#000', justifyContent: 'center'}}>
            <Text style={{color: '#FFF', textAlign: 'center', marginBottom: 20, fontSize: 18, fontWeight: 'bold'}}>SELECT YOUR PROTOCOL</Text>

            <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} contentContainerStyle={{alignItems:'center'}}>
              <IntensityDossier onSelect={setHIT}/>
              <CustomDossier onSelect={()=>router.push('/routine/customBuilder')}/>
            </ScrollView>
          </View>
         
          )
        : activeProtocol === 'hit'?
        (<>
           {lastLog==null?<View></View>:
            <View style={styles.header}>
            <Text style={styles.headerText} >Last Workout : {getRoutine()}</Text>
            <Text style={styles.lastWorkout}>{daysAgo(lastLog.date)}</Text>
            </View>}
          
            <MissionCard/>
            <ProtocolChecklist isReady={isReady} routine={routine}/>
          </>
        ):(
          <>
          {lastLog && lastCustomWorkout?.title && 
          <View style={styles.header}>
            <Text style={styles.headerText}>Last Workout {lastCustomWorkout?.title||''} : {daysAgo(lastLog.date)}</Text>
          </View>}
          <CustomMissionCard isReady={isReady}/> 
          <ProtocolChecklist isReady={isReady} routine={routine}/>
          </>
        )}  
         
           
          </ScrollView>
          <StatusBar style={colorScheme==='dark'?'light':'dark'} />
          <WhatsNewModal visible={showUpdateModal} onClose={handleCloseUpdateModal} version={currentAppVersion} />
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
      justifyContent: 'flex-start',
      paddingHorizontal: 20,     
      paddingVertical: 10,      
      backgroundColor: 'transparent',
      gap:'22%',
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
    },
    uncalibratedContainer: {
            width: '92%',
            marginTop: 40,
            padding: 25,
            backgroundColor: isDark ? '#1C1C1E' : '#F5F5F5',
            borderRadius: 15,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: isDark ? '#333' : '#E0E0E0',
        },
        uncalibratedTitle: {
            color: '#EF6C00',
            fontSize: 22,
            fontWeight: '900',
            letterSpacing: 1.5,
            marginBottom: 5,
        },
        uncalibratedSubtitle: {
            color: '#888',
            textAlign: 'center',
            marginBottom: 30,
            fontSize: 13,
        },
        directiveBtn: {
            width: '100%',
            padding: 20,
            borderRadius: 12,
            marginBottom: 15,
            alignItems: 'center',
        },
        primaryDirective: {
            backgroundColor: '#D32F2F',
        },
        secondaryDirective: {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: '#D32F2F',
        },
        directiveBtnTitle: {
            color: '#FFF',
            fontSize: 16,
            fontWeight: 'bold',
            letterSpacing: 1,
            marginBottom: 4,
        },
        directiveBtnSub: {
            color: 'rgba(255,255,255,0.7)',
            fontSize: 11,
            textAlign: 'center',
        },
    
  })
}
 {/*<View style={styles.uncalibratedContainer}>
            <FontAwesome5 name="dumbbell" size={40} color="#EF6C00" style={{marginBottom: 15}}/>
            <Text style={styles.uncalibratedTitle}>SYSTEM UNCALIBRATED</Text>
            <Text style={styles.uncalibratedSubtitle}>Select your training routine to initialize the console.</Text>

            <TouchableOpacity style={[styles.directiveBtn, styles.primaryDirective]} onPress={setHIT}>
              <Text style={styles.directiveBtnTitle}>THE INTENSITY PROTOCOL</Text>
              <Text style={styles.directiveBtnSub}>Pre-calibrated 3-day HIT split. Optimal growth.(recommended for intermediate lifters)</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.directiveBtn, styles.secondaryDirective]} onPress={()=>router.push('/routine/customBuilder')}>
              <Text style={styles.directiveBtnTitle}>CREATE YOUR OWN ROUTINE</Text>
              <Text style={styles.directiveBtnSub}>Create your own workout routine. Top-set tracking only.</Text>
            </TouchableOpacity>

            <View style={{flexDirection:'row', gap:5,}}>
              <AntDesign name="info-circle" size={14} color="white" />
              <Text style={styles.directiveBtnSub}>You can always switch routines in the future</Text>
            </View>
          </View>*/}