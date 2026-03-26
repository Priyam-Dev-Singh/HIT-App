import { useContext, useEffect, useState } from "react";
import { ActivityIndicator, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ThemeContext } from "../context/ThemeContext";
import { FontAwesome5, Feather } from '@expo/vector-icons';
import { WorkoutContext } from "../context/WorkoutContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomMissionExerciseList from "./homeScreen/customMissionExerciseList";
import { useRouter } from "expo-router";
import { getTodayStringAdv, getWorkoutHistory } from "../storage";

export default function CustomMissionCard({isReady}){

    const router = useRouter();
    const {colorScheme} = useContext(ThemeContext);
    const {isWorkoutActive, setIsChecking, startWorkout, setIsWorkoutActive} = useContext(WorkoutContext);
    const {activeProtocol} = useContext(WorkoutContext);
    const isDark = colorScheme==='dark';
    const styles = createStyles(isDark); 
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [nextCustomMission, setNextCustomMission] = useState(null);
    const [showNextWorkoutModal, setShowNextWorkoutModal] = useState(false);
    //const [isReady, setIsReady] = useState(false);

    const recoveryImageD = require('./recoveryD.jpg');
    const recoveryImageL = require('./recoveryL.jpg');
    const badgeColor = isWorkoutActive ? '#FF4444' : (isReady ? '#00FF66' : '#0088FF');
    const badgeText = isWorkoutActive ? "IN PROGRESS" : (isReady ? 'SYSTEM READY' : 'RECOVERING');

    useEffect(()=>{
        const initializeCard = async()=>{
            
            const storedRoutine = await AsyncStorage.getItem("customRoutine");
         // console.log(storedRoutine);
          const lastWorkoutId = await AsyncStorage.getItem("lastWorkoutId");
         
          if(storedRoutine){
            const parsedRoutine = JSON.parse(storedRoutine);
            //setCustomRoutineData(parsedRoutine);
            const nextMission = getNextCustomRoutine(parsedRoutine, lastWorkoutId);
           // console.log("next mission is: ",nextMission);
            setNextCustomMission(nextMission);
          }
        }
        initializeCard();
    },[activeProtocol])

    const getNextCustomRoutine = (customRoutineData, lastWorkoutId) =>{

      if(!customRoutineData || !customRoutineData.workouts || customRoutineData.workouts.length === 0){
        return 0;
      }
      const workouts = customRoutineData.workouts;
      if(!lastWorkoutId){
        return workouts[0];
      }
      const currentIndex = workouts.findIndex(w=>w.id===lastWorkoutId);
      if(currentIndex === -1){
        return workouts[0];
      }
      const nextIndex = (currentIndex+1)%workouts.length;
      return workouts[nextIndex];

    }

    const doingWorkout = ()=>{
        setIsChecking(false);
        startWorkout(nextCustomMission.id);
        router.push(`/workout/${nextCustomMission.id}?type=custom`);
    }

    if(!nextCustomMission){
        return(
            <View style={[styles.cardContainer, { height: 300 ,justifyContent: 'center', alignItems: 'center', backgroundColor: isDark ? '#141414' : '#FFF' }]}>
                <ActivityIndicator color={'#D32F2F'} size={30}/>
                <Text style={{color: '#D32F2F', fontSize: 18, fontWeight: 'bold', marginBottom: 10}}>LOADING DIRECTIVE...</Text>
            </View>)
    }
    //console.log(isWorkoutActive);
    console.log("is ready :",isReady);
    return(
        <View style={[styles.cardContainer, (!isReady && !isWorkoutActive) && {height: 380}]}>
            <View style={[styles.imageArea, (!isReady && !isWorkoutActive) && {flex:3}]}>
                {isReady || isWorkoutActive ? 
                   ( <View style={styles.fallbackImageContainer}>
                        <FontAwesome5 name="clipboard-list" size={100} color={isDark ? '#333' : '#E0E0E0'} style={styles.bgIcon} />
                        <View style={styles.fallbackHeader}>
                            <Text style={styles.fallbackTitle}>{nextCustomMission.title}</Text>
                            <Text style={styles.fallbackSub}>{nextCustomMission?.exercises.length} MOVEMENTS LOADED</Text>
                        </View>
                        <CustomMissionExerciseList exerciseIds={nextCustomMission.exercises}/>
                    </View>)
                    :
                    (
                        <Image source={isDark? recoveryImageD: recoveryImageL} style={styles.heroImage} resizeMode="cover"/>
                    )
            }
            <TouchableOpacity style={[styles.statusBadge,{ borderColor: badgeColor }]} onPress={()=>setShowInfoModal(true)}>
                <Text style={styles.statusText}>{badgeText}</Text>
                <Feather name="info" size={15} color={colorScheme === 'dark' ? 'white' : 'black'} />
            </TouchableOpacity>
            {!isReady && <TouchableOpacity style={[styles.nextBadge,{ borderColor: '#D32F2F',}]} onPress={()=> setShowNextWorkoutModal(true)}>
                <Feather name="chevrons-right" size={15} color={colorScheme === 'dark' ? 'white' : 'black'} />
                <Text style={[styles.statusText,{textAlign:'center', fontSize: 15, padding: 2}]}>{nextCustomMission?.title}</Text>
            </TouchableOpacity>}
            </View>
        
            {isWorkoutActive?(
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#D32F2F' }]} onPress={doingWorkout}>
                   <View style={{width: '100%',flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', paddingVertical:10, }}>
                     <Text style={styles.mission}>MISSION IN PROGRESS</Text>
                     <Text style={styles.nextWorkout}>RESUME</Text>
                     <FontAwesome5 name="play" size={24} color={colorScheme === 'dark' ? 'white' : 'black'} />
                   </View>
                </TouchableOpacity>
            ): isReady ? (
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#D32F2F' }]} onPress={doingWorkout}>
                    <View style={{width: '100%',flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly' }}>
                        <Text style={styles.mission}>Next Protocol: </Text>
                        <Text style={styles.nextWorkout}>{nextCustomMission.title}</Text>
                        <FontAwesome5 name="dumbbell" size={26} color='rgba(255, 255, 255, 0.8)' />
                    </View>
                    <Text style={styles.philosophySubtitle}>Execute your workout with absolute intensity.</Text>
                </TouchableOpacity>
            ):(
                <View style={styles.recoveryCard}>
                    <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly' }}>
                        <Text style={styles.recoveryText}>Recovery Mode</Text>
                        <Feather name="battery-charging" size={30} color="white" />
                    </View>
                    <Text style={styles.timerText}>Hit 8 hours of sleep for optimal recovery</Text>
                </View>
            )}
        
        <Modal animationType="fade" transparent={true} visible={showInfoModal} onRequestClose={()=> setShowInfoModal(false)}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>CUSTOM PROTOCOL</Text>
                    <Text style={styles.modalText}>{
                        isReady?'SYSTEM READY\n Warm-up properly before your top-set. Do atleast 1 set to absolute failure for optimal stimulus. Dont perform another set until you breathing is stable.'
                        :'RECOVERY PHASE\nMuscle repair in progress. The gym only provides the stimulus; actual growth happens during this phase. Sleep atleast 8 hrs and hit your daily protein goals.'}
                    </Text>
                    <TouchableOpacity style={styles.modalCloseBtn} onPress={()=> setShowInfoModal(false)}>
                        <Text style={styles.modalCloseText}>UNDERSTOOD</Text>
                    </TouchableOpacity>
                    
                </View>
            </View>
        </Modal>

        <Modal animationType="fade" transparent={true} visible={showNextWorkoutModal} onRequestClose={()=> setShowNextWorkoutModal(false)}>
             <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Next Workout: {nextCustomMission.title}</Text>
                    <CustomMissionExerciseList exerciseIds={nextCustomMission.exercises}/>
                    <TouchableOpacity style={styles.modalCloseBtn} onPress={()=> setShowNextWorkoutModal(false)}>
                        <Text style={styles.modalCloseText}>Close</Text>
                    </TouchableOpacity>
                    
                </View>
            </View> 
        </Modal>
        </View>
    )
}

function createStyles(isDark){

    return StyleSheet.create({
        cardContainer: {
            width: '92%',
            backgroundColor: isDark ? '#141414' : '#FFFFFF',
            borderRadius: 20,
            alignSelf: 'center',
            marginTop: 20,
            overflow: 'hidden',
            shadowColor: isDark ? "#000" : "#888",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 10,
        },
        imageArea: {
            padding: 10,
           // flex: 3,
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
        // NEW: The Tactical Data Screen styles
        fallbackImageContainer: {
            width: '100%',
            minHeight: 220,
            borderRadius: 20,
            backgroundColor: isDark ? '#1C1C1E' : '#E5E5EA',
            paddingHorizontal: 20,
            paddingTop: 10,
            justifyContent: 'flex-start',
            alignItems: 'stretch',
            borderWidth: 1,
            borderColor: isDark ? '#333' : '#D1D1D6',
            overflow: 'hidden',
        },
        bgIcon: {
            position: 'absolute',
            opacity: 0.1,
            top:'20%',
            alignSelf:'center',
            zIndex: 0,
        },
        fallbackTitle: {
            color: isDark ? '#FFF' : '#000',
            padding: 10,
            fontSize: 26,
            fontWeight: '900',
            letterSpacing: 2,
            textAlign: 'center',
        },
        fallbackHeader: {
            alignItems: 'center', // Center the title and subtitle
            marginBottom: 10,
            zIndex: 1, // Keep above the background icon
        },
        fallbackSub: {
            color: '#D32F2F',
            fontSize: 11,
            fontWeight: 'bold',
            letterSpacing: 1.5,
           
        },
        // ... Keep the rest of your original MissionCard styles exactly as they were!
        statusBadge: {
            position: 'absolute',
            right: 11, 
            top: 12, 
            gap: 10,
            flexDirection:'row',
            justifyContent:'center',
            alignItems:'center',
            paddingVertical: 3,
            paddingHorizontal: 7,
            borderRadius: 6, 
            backgroundColor: 'rgba(0,0,0,0.6)',
            borderWidth: 1, 
        },
        nextBadge: {
            position: 'absolute',
            bottom: 10, 
            gap: 10,
            flexDirection:'row',
            justifyContent:'center',
            alignItems:'center',
            paddingVertical: 3,
            paddingHorizontal: 7,
            borderRadius: 6, 
            backgroundColor: 'rgba(0,0,0,0.6)',
            borderWidth: 1, 
        },
        statusText: {
            color: 'white',
            fontSize: 9,
            fontWeight: '900', 
            letterSpacing: 1.5,
        },
        actionButton: {
            flex: 1,
            margin:10,
            padding: 15,
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius:15,
            borderTopWidth: 1,
            borderColor: 'rgba(255,255,255,0.1)',
        },
        mission: {
            color: 'rgba(255,255,255,0.8)', 
            fontSize: 10,
            fontWeight: 'bold',
            letterSpacing: 1,
            textTransform: 'uppercase',
        },
        nextWorkout: {
            color: 'white',                
            fontSize: 18,
            fontWeight: 'bold',
        },
        philosophySubtitle: {
            color: 'rgba(255,255,255,0.6)',
            fontSize: 10,
            fontStyle: 'italic',
            marginTop: 2,
        },
        recoveryCard: {
            backgroundColor: '#1976D2',
            flex: 1, 
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius:15,
            borderTopWidth: 1,
            borderColor: 'rgba(255,255,255,0.1)',
            margin:10,
        },
        recoveryText: {
            color: 'white',                
            fontSize: 20,
            fontWeight: 'bold',
        },
        timerText: {
            color: '#FFA726', 
            fontSize: 12,
            fontWeight: 'bold',
            marginTop: 4,
            letterSpacing: 1,
        },
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.8)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        modalContent: {
            backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
            width: '85%',
            padding: 25,
            borderRadius: 15,
            borderWidth: 1,
            borderColor: isDark ? '#333' : '#E5E5EA',
        },
        modalTitle: {
            color: isDark ? '#FFF' : '#000',
            fontSize: 20,
            fontWeight: '900',
            letterSpacing: 1,
            marginBottom: 10,
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
    })
}

{/*<View style={styles.customMissionContainer}>
            <Text style={styles.missionLabel}>TODAY'S MISSION</Text>
            <Text style={styles.customMissionTitle}>{nextCustomMission.title}</Text>
            <Text style={styles.customMissionSub}>{nextCustomMission.exercises.length} Movements</Text>
            <TouchableOpacity style={[styles.newWorkout, !isReady && {backgroundColor:'#555'} ]} onPress={()=>{
              if(isReady){
                router.push(
                  `/workout/${nextCustomMission.id}?type=custom`,
                );
              }
              else{
                alert("System Locked. Recovery in progress");
              }
            }} >
              <Text style={styles.nextWorkout}>{isReady? 'INITIATE PROTOCOL': 'SYSTEM RECOVERING'}</Text>
              <Feather name="play" size={20} color="white" />
            </TouchableOpacity>
             <ProtocolChecklist isReady={isReady} routine={nextCustomMission}/>
          </View>*/}