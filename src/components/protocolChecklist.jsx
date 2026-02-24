import { useCallback, useContext, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ThemeContext } from "../context/ThemeContext";
import { useFocusEffect, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FadeInView from "./FadeInView";
import { FontAwesome5, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { WorkoutContext } from "../context/WorkoutContext";

export default function ProtocolChecklist({isReady, routine}){
    
    const router = useRouter();
    const {isWorkoutAcitve} = useContext(WorkoutContext);
    const {colorScheme} = useContext(ThemeContext);
    let isDark = colorScheme === 'dark';
    const styles= createStyles(isDark);
    const [tasks, setTasks] = useState({
        weight: false,
        sleep: false,
        macros: false,
        workout: false,  
    });

    const isToday=(timestamp)=>{
        if(!timestamp) return;
        const today = new Date();
        const logDate = new Date(timestamp);
        return logDate.toDateString()===today.toDateString();

    }
    useFocusEffect(
        useCallback(()=>{
            const checkDailyLogs = async()=>{
                try{
                    const weightJson = await AsyncStorage.getItem('@weightData');
                    const sleepJson = await AsyncStorage.getItem('@sleepData');
                    const macrosJson = await AsyncStorage.getItem('@macrosLogs');
                    const liftJson = await AsyncStorage.getItem('@workoutLogs');

                    let weightLogged = false;
                    let sleepLogged = false;
                    let macrosLogged = false;
                    let workoutCompleted = false;

                    if(weightJson){
                        const weightLogs = JSON.parse(weightJson);
                        if(weightLogs.length>0){
                            weightLogged = isToday(weightLogs[weightLogs.length-1].createdAt);
                        }
                    }
                    if(sleepJson){
                        const sleepLogs = JSON.parse(sleepJson);
                        if(sleepLogs.length>0){
                            sleepLogged = isToday(sleepLogs[sleepLogs.length-1].createdAt);
                        }
                    }
                    if(macrosJson){
                        const macrosLogs = JSON.parse(macrosJson);
                        if(macrosLogs.length>0){
                            macrosLogged = isToday(macrosLogs[macrosLogs.length-1].date);
                        }
                    }
                    if(liftJson){
                        const liftLogs = JSON.parse(liftJson);
                        if(liftLogs.length>0){
                            workoutCompleted = isToday(liftLogs[liftLogs.length-1].date);
                        }
                    }
                    setTasks({weight: weightLogged, sleep: sleepLogged, macros: macrosLogged, workout: workoutCompleted});
                }catch(e){console.error("error checking completed or not");}
            }
            checkDailyLogs();
        },[])
    );

    const completedCount = Object.values(tasks).filter(Boolean).length;
    const TaskItem = ({label, icon, isCompleted, delay, route})=>(
        <FadeInView delay={delay}>
            <TouchableOpacity style={[styles.taskRow, isCompleted && styles.taskRowCompleted]} onPress={()=>{!isCompleted && router.push(route)}}>
                <View style={styles.iconWrapper}>
                    <FontAwesome5 name={icon} size={16} color={isCompleted ? '#000000' : (isDark ? '#888' : '#666')} />
                </View>
                <Text style={[styles.taskLabel, isCompleted && styles.taskLabelCompleted]}>
                    {label}
                </Text>
                <View style={[styles.checkbox, isCompleted && styles.checkboxCompleted]}>
                    {isCompleted && <FontAwesome5 name="check" size={12} color="#000000" />}
                </View>
            </TouchableOpacity>
        </FadeInView>
    );

    return(
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.headerTitle}>DAILY PROTOCOL</Text>
               {(isReady||tasks.workout)? <Text style={[styles.headerSubtitle, completedCount===4 && {color: isDark ? '#00FF66' : '#00C851'}]}>{completedCount}/4 CLEARED</Text>:<Text style={[styles.headerSubtitle, completedCount===3 && {color: isDark ? '#00FF66' : '#00C851'}]}>{completedCount}/3 CLEARED</Text>}
            </View>
            {(isReady || tasks.workout )&& <TaskItem
            label={`TRAIN ${String(routine?.name||' ').toUpperCase()} TODAY`}
            isCompleted={tasks.workout}
            delay={100}
            route= {`/workout/${routine.id}`}
            icon='dumbbell'
            /> }
            <TaskItem
            label='LOG MORNING WEIGHT'
            icon='weight'
            isCompleted={tasks.weight}
            delay={200}
            route='/calibration'
            />
            <TaskItem
            label='VERIFY RECOVERY SLEEP'
            icon='bed'
            isCompleted={tasks.sleep}
            delay={300}
            route='/calibration'
            />            
            <TaskItem
            label='INPUT MACRO FUEL'
            icon='fire-alt'
            isCompleted={tasks.macros}
            delay={500}
            route='/macros'
            />
        </View>
    )
}

function createStyles(isDark){

    return StyleSheet.create({
        container: {
            width: '92%',
            alignSelf: 'center',
            backgroundColor: isDark ? '#141414' : '#FFFFFF',
            borderRadius: 20,
            padding: 20,
            marginTop: 20,
            marginBottom: 20, // Added slight bottom margin for scrollability
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: isDark ? 0.4 : 0.1,
            shadowRadius: 12,
            elevation: 8,
            borderWidth: 1,
            borderColor: isDark ? '#222222' : '#E0E0E0',
        },
        headerRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
            paddingHorizontal: 5,
        },
        headerTitle: {
            color: isDark ? '#FFFFFF' : '#121212',
            fontSize: 16,
            fontWeight: '900',
            letterSpacing: 1.5,
        },
        headerSubtitle: {
            color: '#D32F2F', 
            fontSize: 12,
            fontWeight: 'bold',
            letterSpacing: 1,
        },
        taskRow: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isDark ? '#1C1C1E' : '#F5F5F5',
            padding: 16,
            borderRadius: 12,
            marginBottom: 10,
            borderWidth: 1,
            borderColor: 'transparent',
        },
        taskRowCompleted: {
            backgroundColor: isDark ? 'rgba(0, 255, 102, 0.1)' : 'rgba(0, 200, 81, 0.1)', 
            borderColor: isDark ? 'rgba(0, 255, 102, 0.3)' : 'rgba(0, 200, 81, 0.3)',
        },
        iconWrapper: {
            width: 30,
            alignItems: 'center',
            marginRight: 10,
        },
        taskLabel: {
            flex: 1,
            color: isDark ? '#E0E0E0' : '#333333',
            fontSize: 14,
            fontWeight: '700',
            letterSpacing: 0.5,
        },
        taskLabelCompleted: {
            color: isDark ? '#00FF66' : '#00C851',
            textDecorationLine: 'line-through', 
            opacity: 0.8,
        },
        checkbox: {
            width: 24,
            height: 24,
            borderRadius: 12, 
            borderWidth: 2,
            borderColor: isDark ? '#444' : '#CCC',
            justifyContent: 'center',
            alignItems: 'center',
        },
        checkboxCompleted: {
            backgroundColor: isDark ? '#00FF66' : '#00C851',
            borderColor: isDark ? '#00FF66' : '#00C851',
        },
    })
}