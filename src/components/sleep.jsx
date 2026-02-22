import { useContext, useEffect, useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { ThemeContext } from "../context/ThemeContext";
import { StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { deleteLastSleep, saveSleep } from "../storage";
import { ActivityIndicator } from "react-native";
import { BarChart } from "react-native-gifted-charts";

const sleepStorageKey = '@sleepData';
export default function SleepComponent({targetSleep}){
    const{colorScheme} = useContext(ThemeContext);
    let isDarkMode = colorScheme === 'dark';
    const styles = createStyles(colorScheme);

    const[sleep, setSleep] = useState('');
    const[loading, setLoading] = useState(false);
    const [chartData, setChartData] = useState([]);

    const loadChartData = async()=>{
        try{
            const jsonValue = await AsyncStorage.getItem(sleepStorageKey);
            const currentLogs = jsonValue != null ? JSON.parse(jsonValue):[];
            setChartData(currentLogs);
        }catch(e){console.error("error loading sleep chart data", e);}
    }
    useEffect(()=>{
        loadChartData();
    },[])
    return(
        <View style={styles.card}>
           <View style={styles.graphicContainer}>
            <View style={styles.clockWrapper}>
                <View style={styles.snoozeButton}/>
                <View style={styles.clockBody}>
                    <View style={styles.ledScreen}>
                        <TextInput
                        style={styles.clockInput}
                        value={sleep}
                        placeholder="0.0"
                        placeholderTextColor="#333333"
                        keyboardType="numeric"
                        onChangeText={setSleep}
                        maxLength={4}
                        />
                        <Text style={styles.unitText}>HRS</Text>
                    </View>
                    <View style={styles.speakerGrill}>
                        <View style={styles.speakerHole}/>
                        <View style={styles.speakerHole}/>
                        <View style={styles.speakerHole}/>
                        <View style={styles.speakerHole}/>
                        <View style={styles.speakerHole}/>
                    </View>
                </View>
            </View>
           </View>
           <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.saveButton} onPress={async()=>{
                if(!sleep){
                    Alert.alert("Add sleep hours first");
                    return;
                }
                setLoading(true);
                await saveSleep(sleep);
                setSleep('');
                await loadChartData();
                setLoading(false);
            }}>
                {!loading?<Text style={styles.saveButtonText}>LOG RECOVERY</Text> : <ActivityIndicator size={30} color={'black'}/>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.undoButton} onPress={async()=>{await deleteLastSleep(); await loadChartData();}}>
                <Text style={styles.undoButtonText}>Delete Last Entry</Text>
            </TouchableOpacity>
           </View>
           <View style={styles.chartWrapper}>
             <View style={styles.chartHeader}>
                <Text style={styles.chartHeaderText}>RECOVERY TREND</Text>
                <Text style={styles.chartSubText}>Last 7 days</Text>
             </View>
             <View style={styles.chartInner}>
                <BarChart
                data={chartData}
                frontColor={isDarkMode ? '#0088FF' : '#0066CC'} // Restorative Blue
                barWidth={24}
                barBorderRadius={4}
                
                // Background and Grid lines
                hideRules={false}
                rulesColor={isDarkMode ? '#333333' : '#E0E0E0'}
                yAxisColor={isDarkMode ? '#333333' : '#E0E0E0'}
                xAxisColor={isDarkMode ? '#333333' : '#E0E0E0'}
                
                // Text styling
                yAxisTextStyle={{ color: isDarkMode ? '#888888' : '#A0A0A0', fontSize: 12 }}
                xAxisLabelTextStyle={{ color: isDarkMode ? '#888888' : '#A0A0A0', fontSize: 10 }}
                
                initialSpacing={20}
                spacing={30}
                showLine={false} 
                yAxisThickness={1}
                xAxisThickness={1}

                showReferenceLine1={targetSleep>0}
                referenceLine1Position={targetSleep}
                referenceLine1Config={{
                  thickness:2,
                  color: isDarkMode? '#888888' : '#A0A0A0',
                  dashWidth: 4,
                  dashGap: 4,
                }}
                />
             </View>
           </View>
        </View>
    )
}
function createStyles(colorScheme){
    let isDarkMode = colorScheme === 'dark';
    const blueAccent = isDarkMode ? '#0088FF' : '#0066CC';
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
    graphicContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 25,
      marginTop: 10,
    },
    // --- CLOCK UI STYLES ---
    clockWrapper: {
      alignItems: 'center',
    },
    snoozeButton: {
      width: 80,
      height: 12,
      backgroundColor: isDarkMode ? '#1A1A1A' : '#D0D0D0',
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
      marginBottom: -2, // Pulls the clock body up to overlap slightly
      zIndex: 1,
    },
    clockBody: {
      width: 260,
      height: 160, // Wider and shorter than the scale
      backgroundColor: isDarkMode ? '#2A2A2A' : '#F0F0F0',
      borderRadius: 24,
      padding: 20,
      borderWidth: 4,
      borderColor: isDarkMode ? '#383838' : '#E0E0E0',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: isDarkMode ? 0.4 : 0.1,
      shadowRadius: 10,
      elevation: 5,
      zIndex: 2,
    },
    ledScreen: {
      width: '90%',
      height: 75,
      backgroundColor: '#0A0A0A', 
      borderRadius: 12,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 15,
      borderWidth: 2,
      borderColor: isDarkMode ? '#1A1A1A' : '#333333',
    },
    clockInput: {
      color: blueAccent, 
      fontSize: 48,
      fontWeight: '900',
      textAlign: 'center',
      letterSpacing: 2,
      padding: 0, 
    },
    unitText: {
      color: blueAccent,
      fontSize: 16,
      fontWeight: 'bold',
      marginLeft: 8,
      marginTop: 20, 
    },
    speakerGrill: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 12,
    },
    speakerHole: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: isDarkMode ? '#1A1A1A' : '#D0D0D0',
    },
    // -----------------------
    buttonRow:{
        marginVertical: 10,
    },
    saveButton: {
      backgroundColor: blueAccent, // Changed to Blue
      width: '100%',
      height: 55,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
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
      padding: 15,
      marginBottom: 10,
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
      alignItems: 'center', 
      marginLeft: -10, 
    }
    });
}