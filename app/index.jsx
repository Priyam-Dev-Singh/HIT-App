import {View, Text, StyleSheet, Button, Pressable, TouchableOpacity} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../src/context/ThemeContext';
import { fetchLastGlobalWorkout, getCurrentRoutine } from '../src/storage';
import { HitRoutine, routines } from '../data/routines';
import Octicons from '@expo/vector-icons/Octicons';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';


export default function HomeScreen(){
    const [routine, setRoutine] = useState({});
    const [lastLog, setLastLog] = useState({});
    const {colorScheme, toggleTheme} = useContext(ThemeContext);
    const styles = createStyles(colorScheme);
    const router = useRouter();
    useEffect(()=>{
      getLastLogData();
      const loadRoutine = async ()=>{
      const currentRoutine = await findCurrentRoutine();
      setRoutine(currentRoutine);
      };
      loadRoutine();
    },[]);

    const getLastLogData = async ()=>{
      const data = await fetchLastGlobalWorkout();
      setLastLog(data);
      //console.log(data);
    }
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
    return(
        <SafeAreaView style={styles.container}>
           <View style={{display:'flex', flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>
             <Text style={{color:colorScheme==='dark'?'papayawhip':'black', margin: 15, fontSize: 30}}>Hello, HIT App</Text>
            <Pressable onPress={toggleTheme}>
              {colorScheme==='dark'?
                <Octicons name="moon" size={33} color='white' selectable={undefined} style={{width: 36, marginHorizontal: 10,}}/>:
                <Octicons name="sun" size={33} color='black' selectable={undefined} style={{width: 36, marginHorizontal: 10,}}/>}
            </Pressable>
           </View>
            {lastLog==null?<View></View>:
            <View style={styles.header}>
            <Text style={styles.headerText} >Last Workout : {getRoutine()}</Text>
            <Text style={styles.lastWorkout}>{daysAgo(lastLog.date)}</Text>
            </View>}
            <TouchableOpacity style={styles.newWorkout} onPress={()=> router.push(`/workout/${routine.id}`)}>
                <Text style = {styles.mission}>Mission: </Text>
                <Text style = {styles.nextWorkout}>{routine?.name||"Loading..."}</Text>
            </TouchableOpacity>
          <View style={{width: 180, margin: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
            <View style={styles.buttonSelector}>
             <TouchableOpacity onPress={()=>router.push(`/log`)} style={styles.logButton}>
              <FontAwesome5 name="dumbbell" size={32} color={colorScheme==='light'?'#D32F2F':'#FF5252'} />
              <Text style={styles.buttonText}>Log Workout</Text>
             </TouchableOpacity>
           <TouchableOpacity onPress={()=>router.push('/diet/macros')} style={[styles.logButton,{borderColor:colorScheme==='dark'?'#4CAF50':'#388E3C'}]}>
            <FontAwesome5 name="leaf" size={32} color={colorScheme==='dark'?'#4CAF50':'#388E3C'} />
            <Text style={styles.buttonText}>Save Macros</Text>
           </TouchableOpacity>
            </View>
        
          </View>
          <StatusBar style="inverted" />
        </SafeAreaView>
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
      fontSize:17,
      fontWeight:'500',
    },
    lastWorkout:{
      color:colorScheme==='dark'?'#AAAAAA':'#666666',
      fontSize:16,
      fontWeight:'500',
    },
    buttonSelector:{
      display:'flex',
      flexDirection:"row",
      gap: 20,
      alignItems:'center',
      justifyContent:'center',
    },
    logButton:{
      backgroundColor:colorScheme==='dark'?'#1A1A1A':'#FFFFFF',
      marginTop:10,
      marginBottom:10,
      borderWidth:1,
      borderColor:colorScheme==='light'?'#D32F2F':'#FF5252',
      padding:10,
      paddingTop:15,
      borderRadius: 20,
      display:'flex',
      flexDirection:'column',
      alignItems:'center',
      justifyContent:'center',
      gap:10,

    },
    buttonText:{
      fontSize:17,
      color:colorScheme==='dark'?'#FFFFFF':'#000000',
      margin: 5,
      fontWeight:'600',
    },
    newWorkout:{
      borderWidth: 1,
      borderColor: colorScheme==='dark'?'papayawhip':'gray',
      borderRadius: 10,
      height:'9%',
      width:'92%',
      marginTop:15,
      gap:10,
      backgroundColor:colorScheme==='dark'?'#1A1A1A':'#FFFFFF',
      display: 'flex',
      alignItems:'center',
      justifyContent:'center',
      flexDirection:'row',
      padding:10,
    },
    nextWorkout:{
      color:colorScheme==='dark'?'#FFFFFF':'#000000',
      fontSize: 20,
      fontWeight:'600',
    },
    mission:{
      color:colorScheme==='dark'?'#AAAAAA':'#666666',
      fontSize:19,
      fontWeight:'500',
    }
    

  })
}