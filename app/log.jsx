import { FlatList, Pressable, View, Text, StyleSheet, Appearance } from "react-native";
import {SafeAreaView} from 'react-native-safe-area-context'
import { exercises } from "../data/exercises";
import { routines } from "../data/routines";
import { useRouter } from "expo-router";
import { useContext } from "react";
import { ThemeContext } from "../src/context/ThemeContext";
import Octicons from '@expo/vector-icons/Octicons';

export default function WorkoutSelectionScreen (){

    const router = useRouter();
    const {colorScheme, toggleTheme} = useContext(ThemeContext);
    const styles = createStyles(colorScheme);
    const selectWorkout = (id)=>{
        router.push(`/workout/${id}`);
    }
    const renderItem = ({item})=>(
        <Pressable onPress={()=>selectWorkout(item.id)}>
            <View style = {styles.rows}>
                <Text style={[styles.id, styles.workoutText]}>Workout {item.id} :</Text>
                    <Text style={styles.workoutText}>{item.name}</Text>
               
            </View>
        </Pressable>
    )
   
    return(
       <SafeAreaView style={styles.container}>
        <View style={{height: '7%', backgroundColor:colorScheme==='dark'?'grey':'#dddddd', display: 'flex', flexDirection:'row', justifyContent:"space-between", alignItems:'center'
        }}> 
            <Pressable onPress={()=>{router.push("/")}}>
                <Octicons name="home" size={33} color={colorScheme==='dark'?'white':'black'} selectable={undefined} style={{width: 36, marginHorizontal: 10,}}/>
            </Pressable>
            <Text style = {styles.headerText}>Select a Workout</Text>
            <Pressable onPress={toggleTheme}>
                {colorScheme==='dark'?
                <Octicons name="moon" size={36} color='white' selectable={undefined} style={{width: 36, marginHorizontal: 10,}}/>:<Octicons name="sun" size={36} color='black' selectable={undefined} style={{width: 36, marginHorizontal: 10,}}/>}
            </Pressable>
        </View>
        <FlatList
        data = {routines}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        style={styles.list}
        
        />
       </SafeAreaView>
    )
}

function createStyles(colorScheme){
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
        borderColor: colorScheme==='dark'?'papayawhip':'black',
        borderRadius: 5,
        gap: 5,
        alignItems:'center',
        margin: 10,
    },
    id:{
        fontWeight: '400',
        margin: 10,
    },
    workoutText:{
        color: colorScheme==='dark'?'white':'black',
        fontSize: 17,
    },
    headerText:{
        color: colorScheme==='dark'?'white':'black',
        padding: 10,
        fontSize: 22,
        fontWeight: '600'
    }
    
})}