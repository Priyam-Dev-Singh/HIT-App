import { useLocalSearchParams } from "expo-router";
import { Appearance, Button, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { exercises } from "../../data/exercises";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";

export default function LoggingScreen(){
    const [weight,setWeight]=useState('');
    const [reps,setReps]=useState('');
    const {id} = useLocalSearchParams();
    const currentExercise = exercises.find(item=>item.id === id);
    const colorScheme = Appearance.getColorScheme();
    const styles = createStyles(colorScheme);
    return(
       <SafeAreaView style={styles.container}>
        
        <View>
            <Text style={styles.name}>{currentExercise.name}</Text>
        </View>
        <View style={styles.header}></View>
        <View>
            <Text style={styles.muscleGroup}>Muscle Group: {currentExercise.muscleGroup}</Text>
        </View>
        <View>
            <Text style={styles.description}>Description : {currentExercise.description}</Text>
        </View>

        <View style={{display: 'flex', flexDirection:'row', alignItems:'center', justifyContent:'space-evenly'}}>
            <View style={styles.logContainers}>
                <Text style={styles.weightAndReps}>Weight (kg)</Text>
                <TextInput
                value={weight}
                onChangeText={setWeight}
                style= {styles.input}
                placeholderTextColor={colorScheme==='dark'?'#c0c0c0':'#333'}
                placeholder="0"
                keyboardType="numeric"
                maxLength={3}/>
            </View>
            <View style={styles.logContainers}>
                <Text style={styles.weightAndReps}>Reps</Text>
                <TextInput
                value={reps}
                onChangeText={setReps}
                style={styles.input}
                placeholder="0"
                maxLength={2}
                keyboardType="numeric"
                allowFontScaling />
            </View>
        </View>
        <TouchableOpacity style={styles.saveButton}
        onPress={{}}>
            <Text style={styles.saveText}>Save Log</Text>
        </TouchableOpacity>
       </SafeAreaView>
    );
}

function createStyles (colorScheme){
    return StyleSheet.create({
        container:{
        flex: 1,
        backgroundColor: colorScheme === 'light'?'white':'black',
    },
    name:{
        fontSize: 30,
        width: '100%',
        height: 'auto',
        padding: 15,
        color: colorScheme === 'light'?'black':'white',
        backgroundColor: colorScheme ==='light'?'#f1f1f1':'#222',
    },
    muscleGroup:{
        color: colorScheme === 'light'?'black':'white',
        fontSize: 20,
        padding: 10,
        width: '100%',
        height: 'auto',
    },
    description:{
        color: colorScheme === 'light'?'black':'white',
        fontSize: 15,
        padding: 10,
        width:'100%',
        height: 'auto',

    },
    logContainers:{
        display:'flex', 
        flexDirection: 'column',
        padding: 10, 
        margin:10, 
        width:'40%',
        alignItems:'center',
        borderWidth:1, 
        borderColor: colorScheme==='dark'?'papayawhip':'black', 
        borderRadius: 10,
        backgroundColor:colorScheme==='light'?'#f1f1f1':'#111',
    },
    weightAndReps:{
        color: colorScheme === 'light'?'black':'white',
        fontSize: 20,
        padding: 5,
        marginBottom: 5,

    },
    input:{
        borderWidth: 1,
        borderColor:colorScheme==="light"?'black':'papayawhip',
        borderRadius: 10,
        height: 50,
        width: 50,
        backgroundColor:colorScheme==='light'?'#e1e1e1':'#222',
        color: colorScheme === 'light'?'black':'white',
        fontSize: 20,
        textAlign: 'center',
        
    },
    saveButton:{
        width: 'auto',
        height: 'auto',
        alignSelf:'center',
        margin: 10,
        backgroundColor: 'red',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 10,
        borderWidth: 1,
        borderColor: 'papayawhip',
        borderRadius: 5,

    
    },
    saveText:{
        fontSize: 20,
        color: 'white',
        padding: 10,
    },
 })
}