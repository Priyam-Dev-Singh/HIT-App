import { router, useLocalSearchParams, useRouter } from "expo-router";
import { Alert, Appearance, Button, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { exercises } from "../../data/exercises";
import { SafeAreaView } from "react-native-safe-area-context";
import { useContext, useEffect, useState } from "react";
import { saveSet, getLastLog, deleteLastLog, getProgressData } from "../../src/storage";
import Octicons from '@expo/vector-icons/Octicons';
import { ThemeContext } from "../../src/context/ThemeContext";
import { LineChart } from "react-native-gifted-charts";

export default function LoggingScreen(){
    const router = useRouter();
    const [weight,setWeight]=useState('');
    const [reps,setReps]=useState('');
    const [lastLog, setLastLog] = useState({});
    const [chartData, setChartData] = useState([]);
    const {id} = useLocalSearchParams();
    const currentExercise = exercises.find(item=>item.id === id);
    const {colorScheme, toggleTheme} = useContext(ThemeContext); 
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
    };

    const fetchLastLog = async ()=>{
        const data = await getLastLog(currentExercise.id);
        setLastLog(data);
        //console.log("log loaded",data);
      };

      const performDelete = async ()=>{
        const success =  await deleteLastLog(currentExercise.id);
        if(success){
            fetchLastLog();
           if(Platform.OS==='web'){
            window.alert("Last set was deleted!");
           }
           else{
            Alert.alert("Last set was deleted!")
           } 
            }
        else{alert("Failed to delete last set!");}
                
      }

    const handleDelete = ()=>{
        if(Platform.OS==='web'){
            const userConfirmed = window.confirm("Delete last set?");
            if(userConfirmed){performDelete();
            }
        }
        else{Alert.alert('Delete Last Set?','This cant be undone',[
            {text:'cancel', style:'cancel'},
            {text: 'Delete', style:'destructive',
                onPress: performDelete
            }
        ])  
    }
}

    const fetchChartData = async()=>{
        const data = await getProgressData(currentExercise.id, currentExercise.type);
        setChartData(data);
       // console.log("This is data",data);
      //console.log("This is chart Data",chartData);
    }

    useEffect(() => {

      fetchLastLog();
      fetchChartData();
         
      
    }, [currentExercise.id]);
     //console.log("This is chart Data",chartData);
    
    return(
       <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
            style={{flex:1}}
            behavior = {Platform.OS==='ios'?'padding':'height'}
            keyboardVerticalOffset={Platform.OS==='ios'?10:0}
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }} 
                keyboardShouldPersistTaps="handled">
                <View style={{height: '7%', backgroundColor:colorScheme==='dark'?'black':'#dddddd', display: 'flex', flexDirection:'row', justifyContent:"space-between", alignItems:'center'
                           }}>
            <Pressable onPress={()=>{router.push("/")}}>
                <Octicons name="home" size={33} color={colorScheme==='dark'?'white':'black'} selectable={undefined} style={{width: 36, marginHorizontal: 10,}}/>
            </Pressable>
            <Text style = {styles.headerText}>{currentExercise.name}</Text>
                <Pressable onPress={toggleTheme}>
                     {colorScheme==='dark'?
                <Octicons name="moon" size={33} color='white' selectable={undefined} style={{width: 36, marginHorizontal: 10,}}/>:
                <Octicons name="sun" size={33} color='black' selectable={undefined} style={{width: 36, marginHorizontal: 10,}}/>}
            </Pressable>
                           </View>
        <View style={styles.header}></View>
        <View>
            <Text style={styles.muscleGroup}>Muscle Group: {currentExercise.muscleGroup}</Text>
        </View>
        <View>
            <Text style={styles.description}>Description : {currentExercise.description}</Text>
        </View>
        { chartData.length != 0 ?
            (<View>
                <Text style = {styles.chartHeader}>Strength Curve</Text>
                <LineChart
                    data={chartData}
                    color="#FF0000"
                    thickness={3}
                    dataPointsColor="#FF0000"

                    xAxisColor={colorScheme==='dark'?'white':'black'}
                    yAxisColor={colorScheme==='dark'?'gray':'black'}
                    yAxisTextStyle={{color:colorScheme==='dark'?'lightgray':'gray'}}
                    xAxisLabelTextStyle={{color:colorScheme==='dark'?'lightgray':'gray'}}
                    rulesColor={colorScheme === 'dark' ? '#333' : '#eee'}
                    textColor={colorScheme === 'dark' ? 'white' : 'black'}

                    height={200}
                    width={300}
                    initialSpacing={20}
                    hideRules
                    hideYAxisText={false}
                    yAxisTextNumberOfLines={1}
                    textShiftY={-10}
                    textShiftX={-5}
                    textFontSize={12}
                />
            </View> ):
           null
        }
        {lastLog != null ? 
           <View style={styles.lastSet}>
             <View style={{ alignItems:"center", marginLeft: 60,}}>
                <Text style={styles.lastSetContent}>Previous Set</Text>
                <Text style={styles.lastSetContent}>{lastLog.weight} kgs / {lastLog.reps} reps</Text>
                
            </View>
            <Pressable onPress={()=>{handleDelete();
                console.log("Delete pressed");
            }}>
                <Octicons name='trash' size = {33} color="red" selectable={undefined} style={{width:36,}} />
            </Pressable>
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
                placeholderTextColor={colorScheme==='dark'?'#c0c0c0':'#333'}
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
            </ScrollView>
        </KeyboardAvoidingView>
       </SafeAreaView>
    );
}

function createStyles (colorScheme){
    return StyleSheet.create({
        container:{
        flex: 1,
        backgroundColor: colorScheme === 'light'?'white':'black',
    },

    muscleGroup:{
        color: colorScheme === 'light'?'black':'white',
        fontSize: 18,
        padding: 10,
        width: '100%',
        height: 'auto',
    },
    description:{
        color: colorScheme === 'light'?'black':'white',
        fontSize: 16,
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
        fontSize: 18,
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
        fontSize: 18,
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
        fontSize: 15,
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
        flexDirection:'row',
        justifyContent:"space-around",
        
    },
    lastSetContent:{
        fontSize: 18,
        color: colorScheme === 'light'?'black':'white',
    },
     headerText:{
        color: colorScheme==='dark'?'white':'black',
        padding: 10,
        fontSize: 20,
        fontWeight: '600',
    },
    chartHeader:{
        fontSize:17,
        color: colorScheme==='dark'?'white':'black',
        padding: 10,
        alignSelf:'center',
        pointerEvents:'auto',
    }

 })
}