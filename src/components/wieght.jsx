import { useContext, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ThemeContext } from "../context/ThemeContext";
import { TextInput } from "react-native";
import { deleteLastWeight, saveWeight } from "../storage";
import Octicons from '@expo/vector-icons/Octicons';
import { LineChart } from "react-native-gifted-charts";
import AsyncStorage from "@react-native-async-storage/async-storage";

const weightStorageKey = '@weightData';
export default function WeightComponent(){
    const {colorScheme} = useContext(ThemeContext);
    let isDarkMode = colorScheme === 'dark';
    const styles = createStyles(colorScheme);
    const [loading, setLoading] = useState(false);
    const [weight, setWeight] = useState('');
    const [chartData, setChartData] = useState([]);

    const loadChartData = async()=>{
        try{
            const jsonValue= await AsyncStorage.getItem(weightStorageKey);
           const currentLogs = jsonValue != null ? JSON.parse(jsonValue):[];
           setChartData(currentLogs);
        }catch(e){console.error("error in loading chart data");}  
        }

    useEffect(()=>{
        loadChartData();
    },[chartData])
    return(
        <View style={styles.card}>
          {/*<Text style={styles.title}>WEIGHT CALIBRATION</Text>*/}
            <View style={styles.graphicContainer}>
                <View style={styles.scaleBody}>
                    <View style={styles.ledScreen}>
                        <TextInput
                         style={styles.scaleInput}
                         placeholder="0.00"
                         placeholderTextColor= '#333333'
                         keyboardType="numeric"
                         value={weight}
                         onChangeText={setWeight}
                         maxLength={5}
                        />
                        <Text style={styles.unitText}>KG</Text>
                    </View>
                    <View style={styles.sensorRow}>
                        <View style={styles.sensorPad} />
                        <View style={styles.sensorPad} />
                    </View>
                    <View style={styles.sensorRow}>
                        <View style={styles.sensorPad} />
                        <View style={styles.sensorPad} />
                    </View>
                </View>
            </View>

           <View style={styles.buttonRow}>
             <TouchableOpacity style={styles.saveButton} onPress={async()=> { 
                if(!weight){
                    Alert.alert("Add weight first"); 
                    return;
                    } 
                    setLoading(true)
                    await saveWeight(weight); 
                    setWeight('')
                    await loadChartData();
                    setLoading(false)}}>
               {!loading? <Text style={styles.saveButtonText}>LOG WEIGHT</Text> : <ActivityIndicator size={30} color={'black'}/>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.undoButton} onPress={deleteLastWeight}>
                <Text style={styles.undoButtonText}>Delete Last Entry</Text>
            </TouchableOpacity>
           </View>
            <View style={styles.chartWrapper}>
                <View style={styles.chartHeader}>
                    <Text style={styles.chartHeaderText}>WEIGHT TREND</Text>
                    <Text style={styles.chartSubText}>Last 7 days</Text>
                </View>
                
               <View style={styles.chartInner}>
                 <LineChart
                data={chartData}
                curved // Makes the line smooth instead of sharp angles
                color={isDarkMode ? '#00FF66' : '#00C851'}
                thickness={3}
                dataPointsColor={isDarkMode ? '#00FF66' : '#00C851'}
                dataPointsRadius={4}
                
                // Background and Grid lines
                hideRules={false}
                rulesColor={isDarkMode ? '#333333' : '#E0E0E0'}
                yAxisColor={isDarkMode ? '#333333' : '#E0E0E0'}
                xAxisColor={isDarkMode ? '#333333' : '#E0E0E0'}
                
                // Text styling
                yAxisTextStyle={{ color: isDarkMode ? '#888888' : '#A0A0A0', fontSize: 12 }}
                xAxisLabelTextStyle={{ color: isDarkMode ? '#888888' : '#A0A0A0', fontSize: 10 }}
                
                // Optional: The Neon Glow effect (looks incredible in dark mode)
                shadowColor={isDarkMode ? '#00FF66' : 'transparent'}
                shadowOffset={{ width: 0, height: 4 }}
                shadowOpacity={0.3}
                shadowRadius={6}
                initialSpacing={20}
                spacing={40}

                />
               </View>
            </View>
        </View>
    )
}

function createStyles(colorScheme){
    let isDarkMode = colorScheme === 'dark';
    return StyleSheet.create({
    card: {
      backgroundColor: isDarkMode ? '#000000' : '#FFFFFF',
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDarkMode ? 0 : 0.1,
      shadowRadius: 4,
      elevation: isDarkMode ? 0 : 3,
    },
    title: {
      color: isDarkMode ? '#FFFFFF' : '#121212',
      fontSize: 20,
      fontWeight: '800',
      textTransform: 'uppercase',
      marginBottom: 20,
      textAlign: 'center',
    },
    graphicContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 25,
    },
    // The main body of the smart scale
    scaleBody: {
      width: 260,
      height: 260,
      backgroundColor: isDarkMode ? '#2A2A2A' : '#F0F0F0',
      borderRadius: 30,
      padding: 20,
      borderWidth: 4,
      borderColor: isDarkMode ? '#383838' : '#E0E0E0',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: isDarkMode ? 0.4 : 0.1,
      shadowRadius: 10,
      elevation: 5,
    },
    // The glass LED display at the top
    ledScreen: {
      width: '80%',
      height: 70,
      backgroundColor: '#0A0A0A', // Always dark to look like a screen
      borderRadius: 12,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 25,
      borderWidth: 2,
      borderColor: isDarkMode ? '#1A1A1A' : '#333333',
    },
    scaleInput: {
      color: isDarkMode ? '#00FF66' : '#00FF66', // Keep neon green for the LED effect
      fontSize: 42,
      fontWeight: '900',
      textAlign: 'center',
      letterSpacing: 2,
      padding: 0, 
    },
    unitText: {
      color: isDarkMode ? '#00FF66' : '#00FF66',
      fontSize: 18,
      fontWeight: 'bold',
      marginLeft: 5,
      marginTop: 15, // Aligns the KG closer to the baseline of the numbers
    },
    // Decorative sensors on the scale surface
    sensorRow: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 10,
      marginBottom: 30,
    },
    sensorPad: {
      width: 60,
      height: 40,
      backgroundColor: isDarkMode ? '#333333' : '#E8E8E8',
      borderRadius: 10,
    },
    saveButton: {
      backgroundColor: isDarkMode ? '#00FF66' : '#00C851',
      width: 'auto',
      height: 50,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 10,
      marginBottom: 10,
    },
    saveButtonText: {
      color: isDarkMode ? '#000000' : '#FFFFFF', 
      fontSize: 15,
      fontWeight: 'bold',
      letterSpacing: 1,
    },
    undoButton: {
      alignItems: 'center',
      padding: 10,
      marginBottom: 20,
    },
    undoButtonText: {
      color: isDarkMode ? '#FF4444' : '#CC0000',
      fontSize: 14,
      fontWeight: '600',
    },
    chartWrapper: {
      marginTop: 15,
      borderTopWidth: 1,
      borderTopColor: isDarkMode ? '#222222' : '#E0E0E0',
      paddingTop: 25,
      paddingBottom: 10,
    },
    chartHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 25,
      paddingHorizontal: 5,
    },
    chartHeaderText: {
      color: isDarkMode ? '#FFFFFF' : '#121212',
      fontSize: 16,
      fontWeight: '800',
      letterSpacing: 0.5,
    },
    chartSubText: {
      color: isDarkMode ? '#888888' : '#A0A0A0',
      fontSize: 12,
      fontWeight: '600',
    },
    chartInner: {
      alignItems: 'center', // Centers the chart nicely within the wrapper
      marginLeft: -10, // Sometimes gifted-charts needs a tiny nudge to center perfectly
    }
    })
}