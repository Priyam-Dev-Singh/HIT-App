import { useContext, useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { WorkoutContext } from "../context/WorkoutContext";
import { FontAwesome5, Feather } from '@expo/vector-icons';
import { fetchLastGlobalWorkout, getCurrentRoutine } from "../storage";
import { HitRoutine, routines } from "../../data/routines";
import { useRouter } from "expo-router";
import { ThemeContext } from "../context/ThemeContext";

export default function MissionCard(){
    const router = useRouter();
    const {colorScheme} = useContext(ThemeContext);
    const {setIsChecking, startWorkout, isWorkoutActive,} = useContext(WorkoutContext);
    const [lastLog, setLastLog] = useState({});
    const [routine, setRoutine] = useState({});
    const[isReady, setIsReady] = useState(true);
    const styles = createStyles(colorScheme);
    const recoveryImage = require('./recovery.jpg');

    useEffect(()=>{
        const getCardData = async()=>{
            const data = await fetchLastGlobalWorkout();
            setLastLog(data);
                //console.log(data);
            if(data && data.date){
                const ready = hoursAgo(data.date);
                setIsReady(ready);
            }
            const currentRoutine = await findCurrentRoutine();
            setRoutine(currentRoutine);
        }
        getCardData();
    },[]);

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
    
    const hoursAgo =(dateString)=>{
      const past = new Date (dateString);
      const now = new Date();
      const diffTime = Math.abs(now-past);
      const diffHrs = Math.floor(diffTime/(1000*60*60));
      if(diffHrs>48){return true;}
      else {return false;}
    }

       
    return(
        <View style={styles.cardContainer}>
            <View style={styles.imageArea}>
                <Image source={isReady?routine.image:recoveryImage} style={styles.heroImage} resizeMode="cover" />
                <View style={[styles.statusBadge, {backgroundColor: isWorkoutActive ? '#D32F2F' : (isReady ? '#4CAF50' : '#1976D2')}]}>
                    <Text style={styles.statusText}>{isWorkoutActive?"IN PROGRESS":(isReady?'SYSTEM READY':'RECOVERING')}</Text>
                </View>
            </View>
            {isWorkoutActive?
                       <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#D32F2F' }]} onPress={()=>{
                            router.push(`/workout/${routine.id}`); setIsChecking(false);
                          }}>
                            <Text style = {styles.mission}>MISSION IN PROGRESS </Text>
                            <Text style = {styles.nextWorkout}>RESUME</Text>
                            <FontAwesome5 name="play" size={24} color={colorScheme==='dark'?'white':'black'} />
                        </TouchableOpacity>
                      :
                       (isReady ?
                          <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#D32F2F' }]} onPress={()=>{ 
                            setIsChecking(false);
                            console.log("routine id is ", routine.id);
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
        </View>
    );
}

function createStyles (colorScheme){
    let isDark = colorScheme==='dark';
    return StyleSheet.create({
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
      flex: 1, // Takes up 1/4 of the card
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-evenly',
      borderRadius:15,
      borderTopWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)',
      margin:10,
    },
    recoveryText:{
      color: 'white',                 
      fontSize: 20,
      fontWeight: 'bold',
    },
    cardContainer: {
            width: '92%',
            height: 380, // Taller to fit image + button
            backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
            borderRadius: 24,
            alignSelf: 'center',
            marginTop: 20,
            overflow: 'hidden', // Clips the image to the border radius
            
            // Deep Shadow
            shadowColor: isDark ? "#000" : "#888",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 10,
        },
        imageArea: {
            flex: 3, // Takes up 3/4 of the card
            width: '100%',
            backgroundColor: isDark ? '#111' : '#F5F5F5',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
        },
        heroImage: {
            width: '100%',
            height: '100%',
        },
        statusBadge: {
            position: 'absolute',
            alignSelf:'center',
            top:15,
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 8,
        },
        statusText: {
            color: 'white',
            fontSize: 10,
            fontWeight: 'bold',
            letterSpacing: 1,
        },
        actionButton: {
            flex: 1, // Takes up 1/4 of the card
            margin:10,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-evenly',
            borderRadius:15,
            borderTopWidth: 1,
            borderColor: 'rgba(255,255,255,0.1)',
        },
    })
}