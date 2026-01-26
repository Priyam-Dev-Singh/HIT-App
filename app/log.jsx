import { FlatList, Pressable, View, Text, StyleSheet, Appearance } from "react-native";
import {SafeAreaView} from 'react-native-safe-area-context'
import { exercises } from "../data/exercises";
import { routines } from "../data/routines";
import { useRouter } from "expo-router";

export default function WorkoutSelectionScreen (){

    const router = useRouter();
    const colorScheme = Appearance.getColorScheme();
    const styles = createStyles(colorScheme);
    const selectWorkout = (id)=>{
        router.push(`/workout/${id}`);
    }
    const renderItem = ({item})=>(
            <View style = {styles.rows}>
                <Text style={[styles.id, styles.workoutText]}>Workout {item.id} :</Text>
                <Pressable onPress={()=>selectWorkout(item.id)}>
                    <Text style={styles.workoutText}>{item.name}</Text>
                </Pressable>
            </View>
    )
   
    return(
       <SafeAreaView style={styles.container}>
        <View style={{height: '10%', backgroundColor:'gray'
        }}></View>
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
        borderColor: 'papayawhip',
        borderRadius: 5,
        gap: 5,
        alignItems:'center',
        margin: 8,
    },
    id:{
        fontWeight: '400',
        margin: 10,
    },
    workoutText:{
        color: 'white',
        fontSize: 17,
    },
    
})}