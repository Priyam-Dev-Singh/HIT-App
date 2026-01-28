import { useLocalSearchParams } from "expo-router";
import { Appearance, Button, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { exercises } from "../../data/exercises";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { saveSet, getLastLog } from "../../src/storage";


export default function LoggingScreen(){
    const [weight,setWeight]=useState('');
    const [reps,setReps]=useState('');
    const [lastLog, setLastLog] = useState({});
    const {id} = useLocalSearchParams();
    const currentExercise = exercises.find(item=>item.id === id);
    const colorScheme = Appearance.getColorScheme();
    const styles = createStyles(colorScheme);
    const handleSave = async()=>{
        if(!weight || !reps){
            alert("please enter both reps and weight");
            return;
        }
        const success = await saveSet(currentExercise.id, weight, reps);
        if(success){
            setReps('');
            setWeight('');
            alert('Set saved')
        }
    }
    useEffect(() => {
      const fetchLastLog = async ()=>{
        const data = await getLastLog(currentExercise.id);
        setLastLog(data);
        //console.log("log loaded",data);
      }
      fetchLastLog();
      
    }, [currentExercise.id]);
    
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
        {lastLog != null ? 
            <View style={styles.lastSet}>
                <Text style={styles.lastSetContent}>Previous Set</Text>
                <Text style={styles.lastSetContent}>{lastLog.weight} kgs / {lastLog.reps} reps</Text>
            </View> : 
            <View></View>  
        }
       
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
                maxLength={6}/>
            </View>
            <View style={styles.logContainers}>
                <Text style={styles.weightAndReps}>Reps</Text>
                <TextInput
                value={reps}
                onChangeText={setReps}
                style={styles.input}
                placeholder="0"
                maxLength={4}
                keyboardType="numeric"
                allowFontScaling />
            </View>
        </View>
        <TouchableOpacity style={styles.saveButton}
        onPress={handleSave}>
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
        fontSize: 18,
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
        margin: 15,
        backgroundColor: 'red',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'papayawhip',
        borderRadius: 5,

    
    },
    saveText:{
        fontSize: 20,
        color: 'white',
        padding: 10,
    },
    lastSet:{
        width: 'auto',
        borderWidth: 1,
        borderColor:colorScheme==="light"?'black':'papayawhip', 
        borderRadius: 10,
        backgroundColor:colorScheme==='light'?'#e1e1e1':'#222',
        margin: 15,
        padding: 10,
        display:'flex',
        alignItems: 'center',
        
    },
    lastSetContent:{
        fontSize: 25,
        color: colorScheme === 'light'?'black':'white',
    },

 })
}