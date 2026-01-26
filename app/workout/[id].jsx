import {useLocalSearchParams, useRouter} from 'expo-router';
import { routines } from '../../data/routines';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Appearance, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import { exercises } from '../../data/exercises';

export default function ExerciseSelectionScreen(){
   
    const colorScheme = Appearance.getColorScheme();
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
    return(
        <SafeAreaView style = {styles.container}>
            <View>
               <Text>{currentRoutine.name || 'Routine Not Found'}</Text> 
            </View>
            <FlatList
            data={currentExercises}
            keyExtractor={item=>item.id}
            renderItem={renderItem}
            style = {styles.list}
            />
        </SafeAreaView>
    )
}

function createStyles (colorScheme){
    return StyleSheet.create({
    container:{
        flex: 1,
        backgroundColor: colorScheme === 'light'?'white':'black',
    },
     list:{
        flex: 1,
        marginTop: 10,
    },
    rows:{
        display: 'flex',
        flexDirection:'row',
        borderWidth: 1,
        borderColor: 'papayawhip',
        borderRadius: 5,
        gap: 5,
        alignItems:'center',
        margin: 8,
    },
     workoutText:{
        color: 'white',
        fontSize: 17,
        margin:10,
    },
    })
}