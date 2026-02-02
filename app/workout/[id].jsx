import {useLocalSearchParams, useRouter} from 'expo-router';
import { HitRoutine, routines } from '../../data/routines';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Appearance, FlatList, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useContext, useEffect, useState } from 'react';
import { exercises } from '../../data/exercises';
import Octicons from '@expo/vector-icons/Octicons';
import { ThemeContext } from '../../src/context/ThemeContext';
import { getCurrentRoutine, saveNextRoutineIndex } from '../../src/storage';

export default function ExerciseSelectionScreen(){
   
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
    const renderItem = ({item})=>(
        <Pressable onPress={()=>openLogger(item.id)}>
            <View style={styles.rows}>
            <Text style = {styles.workoutText}>{item.name}</Text>
            </View>
        </Pressable>
    );

    const handleCompletedSession = async ()=>{
    try{
        const index = await getCurrentRoutine();
        const currentIndex = index+1 < HitRoutine.length ? index+1 : 0;
        //console.log("next routine index: ", currentIndex);
        //console.log("previous routine index: ", currentIndex);
        await saveNextRoutineIndex(currentIndex);
        router.replace("/");

    }catch(e){console.error("error handling the completed session", e);}
};
    return(
        <SafeAreaView style = {styles.container}>
           <View style={{height: '7%', backgroundColor:colorScheme==='dark'?'grey':'#dddddd', display: 'flex', flexDirection:'row', justifyContent:"space-between", alignItems:'center'
                   }}>  
                   <Pressable onPress={()=>{router.push("/")}}>
                        <Octicons name="home" size={33} color={colorScheme==='dark'?'white':'black'} selectable={undefined} style={{width: 36, marginHorizontal: 10,}}/>
                    </Pressable>
                       <Text style = {styles.headerText}>{currentRoutine.name}</Text>
                       <Pressable onPress={toggleTheme}>
                           {colorScheme==='dark'?
                           <Octicons name="moon" size={36} color='white' selectable={undefined} style={{width: 36, marginHorizontal: 10,}}/>:<Octicons name="sun" size={36} color='black' selectable={undefined} style={{width: 36, marginHorizontal: 10,}}/>}
                       </Pressable>
                   </View>
            <FlatList
            data={currentExercises}
            keyExtractor={item=>item.id}
            renderItem={renderItem}
            style = {styles.list}
            />
            <TouchableOpacity style = {styles.markCompleted} onPress={handleCompletedSession}>
                <Text style ={styles.buttonText} >Workout Completed</Text>
            </TouchableOpacity>
        </SafeAreaView>
    )
}

function createStyles (colorScheme){
    return StyleSheet.create({
    container:{
        flex: 1,
        backgroundColor: colorScheme === 'light'?'white':'black',
        display:'flex',
        flexDirection:'column',
        justifyContent:'center',
        
    },
     list:{
        marginTop: 10,
    },
    rows:{
        display: 'flex',
        flexDirection:'row',
        borderWidth: 1,
        borderColor: colorScheme === 'light'?'black':'papayawhip',
        borderRadius: 5,
        gap: 5,
        alignItems:'center',
        margin: 8,
        pointerEvents:'auto',
    },
     workoutText:{
        color: colorScheme === 'light'?'black':'white',
        fontSize: 17,
        margin:10,
    },
    routineName:{
        fontSize: 20,
        backgroundColor: colorScheme==='light'?'#e1e1e1':'#222',
        width: '100%',
        color: colorScheme==='light'?'black':'white',
        padding: 15,

    },
    headerText:{
        color: colorScheme==='dark'?'white':'black',
        padding: 10,
        fontSize: 22,
        fontWeight: '600',
    },
    markCompleted:{
      backgroundColor:colorScheme==='dark'?'#1A1A1A':'#FFFFFF',
      marginTop:10,
      marginBottom:400,
      borderWidth:1,
      width:'50%',
      borderColor:colorScheme==='light'?'#D32F2F':'#FF5252',
      padding:10,
      paddingTop:15,
      borderRadius: 20,
      display: 'flex',
      alignItems:'center',
      justifyContent:'center',
      alignSelf:'center',
    },
    buttonText:{
      fontSize:17,
      color:colorScheme==='dark'?'#FFFFFF':'#000000',
      margin:5,
      fontWeight:'600',
    }
    })
}