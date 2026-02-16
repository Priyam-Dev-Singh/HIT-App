import {useLocalSearchParams, useRouter} from 'expo-router';
import { HitRoutine, routines } from '../../data/routines';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, Alert, Appearance, FlatList, Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useContext, useEffect, useState } from 'react';
import { exercises } from '../../data/exercises';
import Octicons from '@expo/vector-icons/Octicons';
import { ThemeContext } from '../../src/context/ThemeContext';
import { getCurrentRoutine, markDayCompleted, saveNextRoutineIndex } from '../../src/storage';
import { WorkoutContext } from '../../src/context/WorkoutContext';

export default function ExerciseSelectionScreen(){
    const [isLoading, setIsLoading] = useState(false);
    const {endWorkout, isChecking} = useContext(WorkoutContext);
    const{colorScheme, toggleTheme} = useContext(ThemeContext);
    const styles = createStyles(colorScheme);
    const {id} = useLocalSearchParams();
    const router = useRouter();
    const currentRoutine = routines.find((routine)=> routine.id===id);
    const currentExerciseIds = [...currentRoutine.exerciseIds];
    const currentExercises = currentExerciseIds.map(id => exercises.find(obj => obj.id === id));
    const openLogger = (id)=>{
        router.push(`/logger/${id}`);
    }
    const renderItem = ({item, index})=>(
        <Pressable onPress={()=>openLogger(item.id)} style={({pressed})=>[styles.exerciseCard, pressed&&{opacity:0.7}]}>
           <View style={styles.thumbnailContainer}>
            {item.image?
            <Image source={item.image} style={styles.thumbnail} resizeMode='cover'/>
            : 
            <View style={styles.numberBox}>
                <Text style={styles.numberText}>{index+1}</Text>
            </View>
            }
           </View>
            <View style={styles.textContainer}>
            <Text style = {styles.exerciseName}>{item.name}</Text>
            </View>
           <Octicons name='chevron-right' size={24} color={ colorScheme === 'dark' ? '#555' : '#CCC'}/>
           
        </Pressable>
    );

    const handleCompletedSession = async ()=>{
    try{
        setIsLoading(true);
        const index = await getCurrentRoutine();
        const currentIndex = index+1 < HitRoutine.length ? index+1 : 0;
        //console.log("next routine index: ", currentIndex);
        //console.log("previous routine index: ", currentIndex);
        await saveNextRoutineIndex(currentIndex);
        const success = await markDayCompleted();
        if(success){
            endWorkout();
            setIsLoading(false);
            router.replace("/");
        }
        else{Alert.alert("Error marking workout completed");}
    }catch(e){console.error("error handling the completed session", e);}
};
    return(
        <SafeAreaView style = {styles.container}>
           <View style={styles.header}>  
                   <Pressable onPress={()=>{router.push("/")}}>
                        <Octicons name="home" size={33} color={colorScheme==='dark'?'white':'black'} selectable={undefined} style={{width: 36, marginHorizontal: 10,}}/>
                    </Pressable>
                       <Text style = {styles.headerText}>{currentRoutine.name}</Text>
                       <Pressable onPress={toggleTheme}>
                           {colorScheme==='dark'?
                           <Octicons name="moon" size={30} color='white' selectable={undefined} style={{width: 30, marginHorizontal: 10,}}/>:<Octicons name="sun" size={30} color='black' selectable={undefined} style={{width: 30, marginHorizontal: 10,}}/>}
                       </Pressable>
                   </View>
            <FlatList
            data={currentExercises}
            keyExtractor={item=>item.id}
            renderItem={renderItem}
            style = {styles.list}
            ListFooterComponent={ !isChecking?
                  <TouchableOpacity style = {styles.markCompleted} onPress={handleCompletedSession}>
                {isLoading? <ActivityIndicator color='#fff' />: <Text style ={styles.buttonText} >Mark Completed</Text>}
            </TouchableOpacity>:null  
            }
            />
            
        </SafeAreaView>
    )
}

function createStyles (colorScheme){
    return StyleSheet.create({
    container:{
        flex: 1,
        display:'flex',
        flexDirection:'column',
        backgroundColor: colorScheme === 'dark' ? '#000000' : '#F2F2F7',
        justifyContent:'center',
        
    },
    header:{
        height: '7%', 
        borderBottomWidth:1,
        backgroundColor: colorScheme === 'dark' ? '#111111' : '#FFFFFF',
        borderBottomColor: colorScheme === 'dark' ? '#333' : '#E5E5EA',
        display: 'flex', 
        flexDirection:'row', 
        justifyContent:"space-between", 
        alignItems:'center'
    },
     list:{
        marginTop: 10,
    },
    exerciseCard:{
        backgroundColor: colorScheme === 'dark' ? '#1C1C1E' : '#FFFFFF',
        borderRadius: 16,
        marginHorizontal: 16, // Space from left/right screen edges
        marginTop: 12,        // Space between cards
        padding: 16,          // Space inside the card
        flexDirection: 'row', // Aligns items horizontally
        alignItems: 'center', // Centers items vertically
    
    // Shadows
        boxShadow: '0px 2px 5px rgba(0,0,0,0.1)', // Modern shadow
        elevation: 3,
    },
    numberBox:{
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: colorScheme === 'dark' ? '#330000' : '#FFEBEE', // Dark Red vs Light Red
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colorScheme === 'dark' ? '#D32F2F' : 'transparent',
    },
    numberText: {
        color: '#D32F2F', // Hero Red
        fontSize: 18,
        fontWeight: 'bold',
    },
    textContainer: {
        flex: 1,       // Forces it to take up all middle space
        marginLeft: 15, // Gap between Number and Text
    },
     exerciseName:{
        color: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
        fontSize: 17,
        fontWeight: '600',
    },
    headerText:{
        color: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
        padding: 10,
        fontSize: 22,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    markCompleted:{
      backgroundColor: '#D32F2F', // Solid Hero Red
      margin: 20,
      marginTop: 30, // Extra space from last item
      marginBottom:60,
      paddingVertical: 18,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    
    // Red Glow
      boxShadow: '0px 4px 15px rgba(211, 47, 47, 0.5)',
      elevation: 6
    },
    buttonText:{
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '800', // Extra Bold
      letterSpacing: 1.5, // Spaced out for "Military" look
      textTransform: 'uppercase',
    },
    thumbnailContainer: {
        width: 130,     
        height: 100,
        borderRadius: 12,
        marginRight: 15, 
        backgroundColor: colorScheme === 'dark' ? '#333' : '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden', 
        borderWidth: 1,
        borderColor: colorScheme === 'dark' ? '#444' : '#E0E0E0',
    },
    thumbnail: {
        width: '100%',
        height: '100%',
    },
    })
}