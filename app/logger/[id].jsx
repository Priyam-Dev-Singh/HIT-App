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
            router.back();
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
                <View style={styles.header}>
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
        <View></View>
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
                    color="#D32F2F"
                    thickness={3}
                    curved
                    isAnimated
                    dataPointsColor="#D32F2F"

                    areaChart
                    startFillColor="#D32F2F"
                    startOpacity={0.2}
                    endFillColor="#D32F2F"
                    endOpacity={0.0}

                    xAxisColor={colorScheme === 'dark' ? '#333' : '#E5E5EA'}
                    yAxisColor="transparent"
                    yAxisTextStyle={{color:colorScheme === 'dark' ? '#666' : '#999', fontSize: 10,}}
                    xAxisLabelTextStyle={{color:colorScheme === 'dark' ? '#666' : '#999', fontSize: 10,}}
                    rulesColor={colorScheme === 'dark' ? '#222' : '#F0F0F0'}

                    height={220}
                    width={'100%'-60}
                    initialSpacing={20}
                    endSpacing={20}

                    hideRules
                    hideYAxisText={false}
                    yAxisTextNumberOfLines={1}
                    pointerConfig={{             // Adds a touch interaction
                        pointerStripHeight: 160,
                        pointerStripColor: colorScheme === 'dark' ? '#555' : 'lightgray',
                        pointerStripWidth: 2,
                        pointerColor: colorScheme === 'dark' ? 'white' : 'black',
                        radius: 6,
                        pointerLabelWidth: 100,
                        pointerLabelHeight: 90,
                        activatePointersOnLongPress: true,
                        autoAdjustPointerLabelPosition: false,
    }}
                />
            </View> ):
           null
        }
        {lastLog != null ? 
           <View style={styles.lastSet}>
             <View style={{ alignItems:"center", flexDirection:'row', }}>
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
        backgroundColor: colorScheme === 'dark' ? '#000000' : '#F2F2F7',
    },
    header:{
        paddingVertical: 15,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        backgroundColor: colorScheme === 'dark' ? '#111111' : '#FFFFFF',
        borderBottomColor: colorScheme === 'dark' ? '#333' : '#E5E5EA',
        flexDirection: 'row',
        justifyContent: "space-between",
        alignItems: 'center'
    },
    muscleGroup:{
        backgroundColor: colorScheme === 'dark' ? '#333' : '#E0E0E0',
        color: colorScheme === 'dark' ? '#FFF' : '#000',
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
    
    // Badge shaping
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        overflow: 'hidden', // Needed for borderRadius on Text
        alignSelf: 'flex-start', // Don't stretch full width
        marginLeft: 20,
        marginTop: 20,
        marginBottom: 5,
        width: 'auto',
    },
    description:{
        color: colorScheme === 'dark' ? '#AAAAAA' : '#666666',
        fontSize: 15,
        lineHeight: 20,
        paddingHorizontal: 20,
        marginBottom: 20,
        width: '100%',

    },
    logContainers:{
        width: '45%',        // Slightly less than half width
        height: 120,         // TALL card
        margin: 10,
        alignItems: 'center',
        justifyContent: 'center', // Center content vertically
        borderRadius: 16,    // Modern rounded corners
        backgroundColor: colorScheme === 'dark' ? '#1C1C1E' : '#FFFFFF',
    
    // Remove old border logic, use specific border for dark mode definition
        borderWidth: 1,
        borderColor: colorScheme === 'dark' ? '#333' : 'transparent',
    
    // Add Shadow/Glow
        boxShadow: '0px 4px 10px rgba(0,0,0,0.1)', 
        elevation: 4,
    },
    weightAndReps:{
        color: '#D32F2F',    // RED Label
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 5,     // Space between label and number
        textTransform: 'uppercase',
        letterSpacing: 1,

    },
    input:{
        borderWidth: 0,
        backgroundColor: 'transparent',
    
    // Make text HUGE
        fontSize: 40,
        fontWeight: 'bold',
        color: colorScheme === 'dark' ? '#FFF' : '#000',
        textAlign: 'center',
        width: '100%',
        height: 60,
        
    },
    saveButton:{
        backgroundColor: '#D32F2F', // Hero Red
        width: '90%',               // standardized width
        paddingVertical: 18,
        borderRadius: 16,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    
    // Remove old borders
        borderWidth: 0,
    
    // Red Glow
        boxShadow: '0px 4px 15px rgba(211, 47, 47, 0.4)',
        elevation: 6,
    },
    saveText:{
        fontSize: 18,
        color: 'white',
        fontWeight: '800', // Extra bold
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    lastSet:{
        flexDirection: 'row',
        justifyContent: 'space-between', // Push text left, trash right
        alignItems: 'center',
        backgroundColor: colorScheme === 'dark' ? '#1C1C1E' : '#FFFFFF',
        marginHorizontal: 20,
        marginVertical: 10,
        padding: 15,
        borderRadius: 12,
    
        // Shadow
        boxShadow: '0px 2px 5px rgba(0,0,0,0.1)',
        elevation: 2,
    },
    lastSetContent:{
        fontSize: 16,
        fontWeight: '600',
        color: colorScheme === 'dark' ? 'white' : 'black',
        marginHorizontal: 15,
    },
     headerText:{
        color: colorScheme==='dark'?'white':'black',
        fontSize: 20,
        fontWeight: '700',
        letterSpacing:0.5,
    },
    chartHeader:{
        fontSize: 14,
        fontWeight: 'bold',
        color: colorScheme === 'dark' ? '#888' : '#555',
        paddingLeft: 20,
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 1,
        alignSelf: 'flex-start',
    }

 })
}