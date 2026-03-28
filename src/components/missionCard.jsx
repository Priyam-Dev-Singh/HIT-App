import { useContext, useEffect, useState } from "react";
import { Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { WorkoutContext } from "../context/WorkoutContext";
import { FontAwesome5, Feather } from '@expo/vector-icons';
import { fetchLastGlobalWorkout, getCurrentRoutine, getTodayStringAdv, getWorkoutHistory } from "../storage";
import { HitRoutine, routines } from "../../data/routines";
import { useRouter } from "expo-router";
import { ThemeContext } from "../context/ThemeContext";
import { exercises } from "../../data/exercises";
import { customExercises } from "../../data/customExercises";

export default function MissionCard({isReady, restTime}){
    const router = useRouter();
    const {colorScheme} = useContext(ThemeContext);
    const {setIsChecking, startWorkout, isWorkoutActive,} = useContext(WorkoutContext);
    const [routine, setRoutine] = useState({});
    const[showInfoModal, setShowInfoModal] = useState(false);

    const [exerciseList, setExerciseList] = useState([]);
    const [showNextWorkoutModal, setShowNextWorkoutModal] = useState(false);

    const styles = createStyles(colorScheme);
    const recoveryImageD = require('./recoveryD.jpg');
    const recoveryImageL = require('./recoveryL.jpg');

    useEffect(()=>{
        const getCardData = async()=>{
        
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

          const listOfEx = currentRoutine.exerciseIds.map(id=>customExercises.find(ex=>ex.id===id));
          setExerciseList(listOfEx);
          //console.log(currentRoutine);
          return currentRoutine;
        }

         


    const badgeColor = isWorkoutActive ? '#FF4444' : (isReady ? '#00FF66' : '#0088FF');
    const badgeText = isWorkoutActive ? "IN PROGRESS" : (isReady ? 'SYSTEM READY' : 'RECOVERING');
       //console.log(isReady);
    return(
        <View style={styles.cardContainer}>
            <View style={styles.imageArea}>
                <Image source={isReady?(colorScheme==='dark'?routine.imageD:routine.imageL):(colorScheme==='dark'?recoveryImageD:recoveryImageL)} style={styles.heroImage} resizeMode="cover" />
                <TouchableOpacity style={[styles.statusBadge, {borderColor: badgeColor}]} onPress={()=> setShowInfoModal(true)} >
                    <Text style={styles.statusText}>{badgeText}</Text>
                    <Feather name="info" size={18} color={colorScheme==='dark'?'white':'black'} />
                </TouchableOpacity>

                {!isReady && 
                <TouchableOpacity style={[styles.nextBadge, {borderColor: '#D32F2F'}]} onPress={()=> setShowNextWorkoutModal(true)} >
                    <Feather name="chevrons-right" size={18} color={colorScheme==='dark'?'white':'black'} />
                    <Text style={styles.statusText}>{routine?.name}</Text>  
                </TouchableOpacity>}
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
                            <View style={{width: '100%',flexDirection:'row',alignItems: 'center',justifyContent: 'space-evenly', }}>
                                <Text style = {styles.mission}>Next Workout: </Text>
                                <Text style = {styles.nextWorkout}>{routine?.name||"Loading..."}</Text>
                                <FontAwesome5 name="dumbbell" size={26} color='rgba(255, 255, 255, 0.8)' />
                            </View>
                            <Text style={styles.philosophySubtitle}>Perform 1 all-out set to failure for each exercise after proper warmup.</Text>
                        </TouchableOpacity>
                        :
                       <View style = {styles.recoveryCard}>
                        <View style={{width:'100%', flexDirection:'row', alignItems:'center', justifyContent:'space-evenly'}}>
                            <Text style= {styles.recoveryText}>Recovery Mode</Text>
                            <Feather name="battery-charging" size={30} color="white" />
                        </View>
                         <Text style= {styles.timerText}>Next session on: {restTime}{'\n'}{'Take 8 hrs of sleep'}</Text>
                       </View>
                        )}
            
            <Modal animationType="fade" transparent={true} visible={showInfoModal} onRequestClose={()=> setShowInfoModal(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>THE PROTOCOL</Text>
                        <Text style={styles.modalText}>
                        {isReady 
                        ? "SYSTEM READY\nYour central nervous system and musculature have recovered.\nExecute exactly one all-out set per exercise to absolute muscular failure.\n No junk volume." 
                        : "RECOVERY PHASE\nMuscle repair in progress. \nThe gym only provides the stimulus; actual growth happens during this phase. \nDo not train until the timer clears."}
                        </Text>
                        <TouchableOpacity style={styles.modalCloseBtn} onPress={()=> setShowInfoModal(false)}>
                            <Text style={styles.modalCloseText}>UNDERSTOOD</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
             
            <Modal animationType="fade" transparent={true} visible={showNextWorkoutModal} onRequestClose={()=>setShowNextWorkoutModal(false)}>
                <View style={styles.modalOverlay}>
                   
                    <View style={[styles.modalContent,{padding: 15,}]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle,{fontSize: 20, marginBottom:0, textAlign:'center'}]} numberOfLines={2}>NEXT WORKOUT{'\n'} {routine.name}</Text>
                            <TouchableOpacity onPress={()=> setShowNextWorkoutModal(false)}>
                                <Feather name="x" size={25} color={'#D32F2F'} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView contentContainerStyle={{flexGrow: 1, paddingBottom: 20}} showsVerticalScrollIndicator={false} >
                            {exerciseList.map((exercise, index)=>{
                            return(
                                <View key={index} style={styles.exerciseRow}>
                                    <View style={styles.tacticalDotOuter}>
                                        <View style={styles.tacticalDotInner}/>
                                    </View>
                                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                                </View>
                            )
                        })} 
                        </ScrollView>
                    </View>
                </View>
            </Modal>
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
      flexDirection: 'cloumn',
      alignItems: 'center',
      justifyContent: 'center',
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
            backgroundColor: isDark ? '#141414' : '#FFFFFF',
            borderRadius: 20,
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
            padding:10,
           
            flex: 3, // Takes up 3/4 of the card
            width: '100%',
            backgroundColor: isDark ? '#111' : '#F5F5F5',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
        },
        heroImage: {
            borderRadius: 20,
            width: '100%',
            height: '100%',
        },
        statusBadge: {
            position: 'absolute', 
            top: 15, 
            gap: 10,
            flexDirection:'row',
            justifyContent:'center',
            alignItems:'center',
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 6, 
            backgroundColor: isDark?'rgba(0,0,0,0.6)':'rgba(255, 255, 255, 0.8)',
            borderWidth: 1, 
            borderColor: 'rgba(255,255,255,0.2)',
        },
        nextBadge: {
            position: 'absolute', 
            bottom: 10, 
            gap: 10,
            flexDirection:'row',
            justifyContent:'center',
            alignItems:'center',
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 6, 
            backgroundColor: isDark?'rgba(0,0,0,0.6)':'rgba(255, 255, 255, 0.8)',
            borderWidth: 1, 
            borderColor: 'rgba(255,255,255,0.2)',
        },
        statusText: {
            color: isDark?'white':'black',
            fontSize: 10,
            fontWeight: '900', 
            letterSpacing: 1.5,
        },
        actionButton: {
            flex: 1, // Takes up 1/4 of the card
            margin:10,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius:15,
            borderTopWidth: 1,
            borderColor: 'rgba(255,255,255,0.1)',
        },
        philosophySubtitle: {
            color: 'rgba(255,255,255,0.6)',
            fontSize: 10,
            fontStyle: 'italic',
            textAlign:'center',
            marginTop: 2,
        },
        timerText: {
            color: '#FFA726', // Warning orange for recovery
            fontSize: 12,
            fontWeight: 'bold',
            marginTop: 4,
            letterSpacing: 1,
            textAlign: 'center',
        },
        modalTitle: {
            color: isDark ? '#FFF' : '#000',
            fontSize: 20,
            fontWeight: '900',
            letterSpacing: 1,
            flex:1,
            marginBottom: 20,
            textTransform: 'uppercase',
        },
        modalText: {
            color: '#888',
            fontSize: 14,
            lineHeight: 22,
            marginBottom: 20,
        },
        modalCloseBtn: {
            backgroundColor: '#D32F2F',
            padding: 12,
            borderRadius: 8,
            alignItems: 'center',
        },
        modalCloseText: {
            color: '#FFF',
            fontWeight: 'bold',
        },
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.8)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        modalContent: {
            backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
            maxHeight: '45%',
            width: '85%',
            borderRadius: 15,
            borderWidth: 1,
            borderColor: isDark ? '#333' : '#E5E5EA',
        },
        exerciseRow: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: isDark ? '#2A2A2C' : '#EAEAEA',
        },
        tacticalDotOuter: {
            width: 14,
            height: 14,
            borderRadius: 7,
            backgroundColor: isDark ? 'rgba(211, 47, 47, 0.25)' : 'rgba(211, 47, 47, 0.15)', // Translucent Halo
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 15,
            marginLeft: 5, // Slight indent to align nicely
        },
        tacticalDotInner: {
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: '#D32F2F', // Solid Hero Red Core
            
            // Subtle Glow Effect
            shadowColor: '#D32F2F',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 4,
            elevation: 3,
        },
        exerciseName: {
            color: isDark ? '#E0E0E0' : '#222',
            fontSize: 12,
            fontWeight: '600',
            flex: 1,
        },
        modalHeader: {
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20, // Space between header and the scrollable list
            borderBottomWidth: 1, // Optional: Adds a subtle line under the header
            borderBottomColor: isDark ? '#333' : '#E5E5EA',
            paddingBottom: 15,
            flexDirection: 'row',
},
    })
}