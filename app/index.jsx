import {View, Text, StyleSheet, Button, Pressable, TouchableOpacity, ScrollView} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../src/context/ThemeContext';
import { fetchLastGlobalWorkout, getCurrentRoutine, getWorkoutHistory } from '../src/storage';
import { HitRoutine, routines } from '../data/routines';
import Octicons from '@expo/vector-icons/Octicons';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import Feather from '@expo/vector-icons/Feather';
import { Calendar } from 'react-native-calendars';
import { WorkoutContext } from '../src/context/WorkoutContext';
import AntDesign from '@expo/vector-icons/AntDesign';


export default function HomeScreen(){
    const {isWorkoutActive, routineId, startWorkout, setIsChecking} = useContext(WorkoutContext);
    const [markedDates, setMarkedDates] = useState({});
    const[isReady, setIsReady] = useState(true);
    const [routine, setRoutine] = useState({});
    const [lastLog, setLastLog] = useState({});
    const {colorScheme, toggleTheme} = useContext(ThemeContext);
    const styles = createStyles(colorScheme);
    const router = useRouter();
   
     useFocusEffect(
       useCallback(()=>{
        const initializeDashboard = async ()=>{
        const data = await fetchLastGlobalWorkout();
        setLastLog(data);
      //console.log(data);
        if(data && data.date){
          const ready = hoursAgo(data.date);
          setIsReady(ready);
        }
        const currentRoutine = await findCurrentRoutine();
        const history = await getWorkoutHistory();
        setMarkedDates(history);
        setRoutine(currentRoutine);
      };
      initializeDashboard();
    },[])
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
    return(
        <ScrollView style={{ flex: 1, backgroundColor:colorScheme==='dark'?'black':'white',
         }} showsVerticalScrollIndicator={false}>
          <SafeAreaView style={styles.container}>
           <View style={styles.masterHeader}>
             <Text style={styles.masterHeaderText}>INTENSITY</Text>
            <Pressable onPress={toggleTheme} style={{padding:8}}>
              {colorScheme==='dark'?
                <Octicons name="moon" size={30} color='white' selectable={undefined} style={{width: 36, marginHorizontal: 10,}}/>:
                <Octicons name="sun" size={30} color='black' selectable={undefined} style={{width: 36, marginHorizontal: 10, }}/>}
            </Pressable>
           </View>
            {lastLog==null?<View></View>:
            <View style={styles.header}>
            <Text style={styles.headerText} >Last Workout : {getRoutine()}</Text>
            <Text style={styles.lastWorkout}>{daysAgo(lastLog.date)}</Text>
            </View>}
            <View style={{width:'92%', marginTop:15, borderRadius:15, overflow:'hidden'}}>
              <Calendar
              markedDates={markedDates}
              key={colorScheme}
              theme={{
                backgroundColor: colorScheme === 'dark' ? '#1A1A1A' : '#ffffff',
                calendarBackground: colorScheme === 'dark' ? '#1A1A1A' : '#ffffff',
                textSectionTitleColor: '#b6c1cd',
                selectedDayBackgroundColor: '#D32F2F', // Red Circle
                selectedDayTextColor: '#ffffff',
                todayTextColor: '#D32F2F',
                dayTextColor: colorScheme === 'dark' ? '#ffffff' : '#2d4150',
                textDisabledColor: '#d9e1e8',
                monthTextColor: colorScheme === 'dark' ? '#ffffff' : 'black',
                arrowColor: '#D32F2F',
                textDayFontWeight: '300',
                textMonthFontWeight: 'bold',
                textDayHeaderFontWeight: '300',
                textDayFontSize: 16,
                textMonthFontSize: 16,
                textDayHeaderFontSize: 14
              }}/>
            </View>
           {isWorkoutActive?
           <TouchableOpacity style={[styles.newWorkout, {gap: 5}]} onPress={()=>{
                router.push(`/workout/${routine.id}`);
              }}>
                <Text style = {styles.mission}>MISSION IN PROGRESS </Text>
                <Text style = {styles.nextWorkout}>RESUME</Text>
                <FontAwesome5 name="play" size={24} color={colorScheme==='dark'?'white':'black'} />
            </TouchableOpacity>
          :
           (isReady ?
              <TouchableOpacity style={styles.newWorkout} onPress={()=>{ 
                setIsChecking(false);
                startWorkout(routine.id);
                router.push(`/workout/${routine.id}`);
              }}>
                <Text style = {styles.mission}>Mission: </Text>
                <Text style = {styles.nextWorkout}>{routine?.name||"Loading..."}</Text>
                <FontAwesome5 name="dumbbell" size={26} color='rgba(255, 255, 255, 0.8)' />
            </TouchableOpacity>
            :
           <View style = {styles.recoveryCard}>
            <Text style= {styles.recoveryText}>Recovery Mode</Text>
            <Feather name="battery-charging" size={30} color="white" />
           </View>
            )}
        
            
           <TouchableOpacity onPress={()=>router.push('/diet/macros')} style={styles.macrosButton}>
            <Text style={styles.buttonText}>Save Macros</Text>
            <FontAwesome5 name="leaf" size={26} color={colorScheme==='dark'?'white':'#B9F6CA'} />
           </TouchableOpacity>
           <TouchableOpacity onPress={()=>{router.push('/log'); setIsChecking(true)}} style={styles.progressButton}>
            <Text style={styles.progressText}>View Progress</Text>
            <AntDesign name="line-chart" size={32} color="white" />
           </TouchableOpacity>
         
        
          
          <StatusBar style="inverted" />
        </SafeAreaView>
        </ScrollView>
    );
}

function createStyles (colorScheme){
  return StyleSheet.create({
    container:{
      flex: 1,
      backgroundColor: colorScheme==='dark'?'black':'white',
      alignItems:'center',
      display: 'flex',
      flexDirection: 'column',
      gap:10,
      paddingBottom: 70,
    },
    masterHeader:{
      width: '100%',             // <--- THE FIX
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,     // Proper side spacing
      paddingVertical: 15,       // Breathing room top/bottom
      backgroundColor: 'transparent',
    },
    masterHeaderText:{
      fontSize: 24,              // 30 is a bit loud, 24 is cleaner
      color: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
      letterSpacing: 1,          // Makes it look like a brand
      textTransform: 'uppercase',
      fontWeight: '800',         // Extra Bold (Logo feel)
    },
    header:{
      borderWidth: 1,
      borderColor: colorScheme==='dark'?'papayawhip':'gray',
      borderRadius: 10,
      height:'7%',
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
      backgroundColor: '#2E7D32', // SOLID GREEN
      width: '92%',
      height: 100,                // Slightly shorter than Hero to show hierarchy? 
                                // Or keep 110 for consistency. I used 100 here.
      borderRadius: 20,
      marginTop: 15,              // Space between Red and Green cards
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
    
    // Green Glow/Shadow
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
      color: 'white',                 // Pure White
      fontSize: 18,
      fontWeight: 'bold',
      
    },
    mission:{
      color: 'rgba(255,255,255,0.8)', // White, slightly transparent
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
      color: 'white',                 // Pure White
      fontSize: 20,
      fontWeight: 'bold',
    },
    progressButton:{
      backgroundColor: '#EF6C00', // Industrial Orange (High contrast, serious)
      width: '92%',
      height: 80, 
      borderRadius: 20,
      marginTop: 15,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,

    // Orange Glow
      boxShadow: '0px 4px 8px rgba(239, 108, 0, 0.4)',
      elevation: 6,
    },
    progressText:{
      color: 'white',
      fontSize: 20,
      fontWeight: 'bold',
      letterSpacing: 0.5,
    },
  })
}