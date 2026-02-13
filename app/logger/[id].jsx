import { useRouter, useLocalSearchParams } from "expo-router";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Dimensions, KeyboardAvoidingView, Keyboard, ActivityIndicator } from "react-native";
import { exercises } from "../../data/exercises";
import { SafeAreaView } from "react-native-safe-area-context";
import { useContext, useEffect, useState, useRef } from "react";
import { saveSet, getLastLog, deleteLastLog, getProgressData } from "../../src/storage";
import Octicons from '@expo/vector-icons/Octicons';
import { ThemeContext } from "../../src/context/ThemeContext";
import { LineChart } from "react-native-gifted-charts";
import { WorkoutContext } from "../../src/context/WorkoutContext";
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function LoggingScreen() {
    const [isLoading, setIsLoading] = useState(false);
    const { isChecking } = useContext(WorkoutContext);
    const router = useRouter();
    const [weight, setWeight] = useState('');
    const [reps, setReps] = useState('');
    const [lastLog, setLastLog] = useState({});
    const [chartData, setChartData] = useState([]);
    
    // Inputs
    const weightInputRef = useRef(null);
    const repsInputRef = useRef(null);

    const { id } = useLocalSearchParams();
    const currentExercise = exercises.find(item => item.id === id);
    const { colorScheme, toggleTheme } = useContext(ThemeContext);
    const styles = createStyles(colorScheme);
    
   
    const screenWidth = Dimensions.get("window").width;

    
    useEffect(() => {
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
            weightInputRef.current?.blur();
            repsInputRef.current?.blur();
        });
        return () => keyboardDidHideListener.remove();
    }, []);

    const handleSave = async () => {
        if (!weight || !reps) {
            alert("please enter both reps and weight");
            return;
        }
        setIsLoading(true);
        const success = await saveSet(currentExercise.id, weight, reps);
        if (success) {
            setReps('');
            setWeight('');
            setIsLoading(false);
            alert('Set saved');
            router.back();
        }
    };

    const fetchLastLog = async () => {
        const data = await getLastLog(currentExercise.id);
        setLastLog(data);
    };

    const performDelete = async () => {
        const success = await deleteLastLog(currentExercise.id);
        if (success) {
            fetchLastLog();
            Alert.alert("Last set was deleted!");
        } else {
            alert("Failed to delete last set!");
        }
    };

    const handleDelete = () => {
        if (Platform.OS === 'web') {
            if (window.confirm("Delete last set?")) performDelete();
        } else {
            Alert.alert('Delete Last Set?', 'This cant be undone', [
                { text: 'cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: performDelete }
            ]);
        }
    };

    const fetchChartData = async () => {
        const rawData = await getProgressData(currentExercise.id, currentExercise.type);
        const cleanData = rawData.map(item => ({
            ...item,
            value: parseFloat(item.value) || 0 
        }));
        
        setChartData(cleanData);
    };

    useEffect(() => {
        fetchLastLog();
        fetchChartData();
    }, [currentExercise.id]);

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }} keyboardShouldPersistTaps="handled">
                    
                   
                    <View style={styles.header}>
                        <Pressable onPress={() => router.push("/")}>
                            <Octicons name="home" size={24} color={colorScheme === 'dark' ? 'white' : 'black'} />
                        </Pressable>
                        <Text style={styles.headerText}>{currentExercise.name}</Text>
                        <Pressable onPress={toggleTheme}>
                            <Octicons name={colorScheme === 'dark' ? "moon" : "sun"} size={24} color={colorScheme === 'dark' ? 'white' : 'black'} />
                        </Pressable>
                    </View>

                    
                    <View style={{ marginTop: 10 }}>
                        <Text style={styles.muscleGroup}>Muscle Group: {currentExercise.muscleGroup}</Text>
                        <Text style={styles.description}>Description: {currentExercise.description}</Text>
                    </View>
                    <View style={styles.chartCard}>
                        <View style={styles.chartHeaderComp}>
                            <Text style={styles.chartHeader}>Strength Curve (1RM)</Text>
                            <MaterialCommunityIcons name="arm-flex" size={20} color="#D32F2F" />
                        </View>
                        
                        
                        <LineChart
                            data={chartData}
                            color="#D32F2F"
                            thickness={3}
                            curved
                            
                            dataPointsColor="#D32F2F"
                            areaChart
                            startFillColor="#D32F2F"
                            startOpacity={0.2}
                            endFillColor="#D32F2F"
                            endOpacity={0.0}
                            xAxisColor="transparent"
                            yAxisColor="transparent"
                            yAxisTextStyle={{ color: colorScheme === 'dark' ? '#666' : '#999', fontSize: 10 }}
                            xAxisLabelTextStyle={{ color:  colorScheme === 'dark' ? '#666' : '#999', fontSize: 10 }}
                            rulesColor={colorScheme === 'dark' ? '#222' : '#F0F0F0'}
                            height={220}
                            
                            // FIX 3: Safe Width Math
                            width={screenWidth - 60} 
                            
                            initialSpacing={20}
                            endSpacing={20}
                            hideRules
                            hideYAxisText={false}
                            yAxisTextNumberOfLines={1}
                            pointerConfig={{
                                pointerStripHeight: 160,
                                pointerStripColor: colorScheme === 'dark' ? '#555' : 'lightgray',
                                pointerStripWidth: 2,
                                pointerColor: colorScheme === 'dark' ? 'white' : 'black',
                                radius: 6,
                                pointerLabelWidth: 100,
                                pointerLabelHeight: 90,
                                activatePointersOnLongPress: true,
                                autoAdjustPointerLabelPosition: false,
                                
                                // FIX 4: Safety Check for Tooltip
                                pointerLabelComponent: items => {
                                    if (!items || !items[0]) return null;
                                    return (
                                        <View style={{ height: 30, width: 50, backgroundColor: '#111', borderRadius: 4, justifyContent: 'center', alignItems: 'center', borderWidth:1, borderColor: '#D32F2F', marginLeft: -20 }}>
                                            <Text style={{ color: '#D32F2F', fontSize: 12, fontWeight: 'bold' }}>{items[0].value}</Text>
                                        </View>
                                    );
                                },
                            }}
                        />
                    </View>

                   
                    {lastLog && lastLog.weight ? (
                        <View style={styles.lastSet}>
                            <View style={{ alignItems: "center", flexDirection: 'row' }}>
                                <Text style={styles.lastSetContent}>Previous Set</Text>
                                <Text style={styles.lastSetContent}>{lastLog.weight} kgs / {lastLog.reps} reps</Text>
                            </View>
                            <Pressable onPress={() => handleDelete()}>
                                <Octicons name='trash' size={24} color="red" />
                            </Pressable>
                        </View>
                    ) : null}

                    {/* Inputs */}
                    {!isChecking ? (
                        <>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly' }}>
                                <View style={styles.logContainers}>
                                    <Text style={styles.weightAndReps}>Weight (kg)</Text>
                                    <TextInput
                                        ref={weightInputRef}
                                        value={weight}
                                        onChangeText={setWeight}
                                        style={styles.input}
                                        placeholderTextColor={colorScheme === 'dark' ? '#555' : '#CCC'}
                                        placeholder="0"
                                        keyboardType="numeric"
                                        maxLength={6}
                                        selectionColor="#D32F2F"
                                        selectTextOnFocus={true} 
                                    />
                                </View>
                                <View style={styles.logContainers}>
                                    <Text style={styles.weightAndReps}>Reps</Text>
                                    <TextInput
                                        ref={repsInputRef}
                                        value={reps}
                                        onChangeText={setReps}
                                        style={styles.input}
                                        placeholderTextColor={colorScheme === 'dark' ? '#555' : '#CCC'}
                                        placeholder="0"
                                        maxLength={4}
                                        keyboardType="numeric"
                                        selectionColor="#D32F2F"
                                        selectTextOnFocus={true} 
                                    />
                                </View>
                            </View>
                            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                                {isLoading?<ActivityIndicator color='#fff'/>:<Text style={styles.saveText}>Save Log</Text>}
                            </TouchableOpacity>
                        </>
                    ) : null}

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

function createStyles(colorScheme) {
    const isDark = colorScheme === 'dark';
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colorScheme === 'dark' ? '#000000' : '#F2F2F7',
        },
        header: {
            paddingVertical: 15,
            paddingHorizontal: 20,
            borderBottomWidth: 1,
            backgroundColor: colorScheme === 'dark' ? '#111111' : '#FFFFFF',
            borderBottomColor: colorScheme === 'dark' ? '#333' : '#E5E5EA',
            flexDirection: 'row',
            justifyContent: "space-between",
            alignItems: 'center'
        },
        muscleGroup: {
            backgroundColor: colorScheme === 'dark' ? '#333' : '#E0E0E0',
            color: colorScheme === 'dark' ? '#FFF' : '#000',
            fontSize: 13,
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: 1,
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 8,
            overflow: 'hidden',
            alignSelf: 'flex-start',
            marginLeft: 20,
            marginTop: 20,
            marginBottom: 5,
        },
        description: {
            color: colorScheme === 'dark' ? '#AAAAAA' : '#666666',
            fontSize: 13,
            lineHeight: 20,
            paddingHorizontal: 20,
            marginBottom: 10,
        },
        logContainers: {
            width: '45%',
            height: 120,
            margin: 10,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 16,
            backgroundColor: colorScheme === 'dark' ? '#1C1C1E' : '#FFFFFF',
            borderWidth: 1,
            borderColor: colorScheme === 'dark' ? '#333' : 'transparent',
            elevation: 4,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
        },
        weightAndReps: {
            color: '#D32F2F',
            fontSize: 12,
            fontWeight: 'bold',
            marginBottom: 5,
            textTransform: 'uppercase',
            letterSpacing: 1,
        },
        input: {
            fontSize: 25,
            fontWeight: 'bold',
            color: colorScheme === 'dark' ? '#FFF' : '#000',
            width: '60%',
            height: 60,
            
            
            textAlign: 'center', 
            padding: 0,
            includeFontPadding: false, 
        },
        saveButton: {
            backgroundColor: '#D32F2F',
            width: '90%',
            paddingVertical: 18,
            borderRadius: 16,
            alignSelf: 'center',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 20,
            elevation: 6,
            shadowColor: "#D32F2F",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 5,
        },
        saveText: {
            fontSize: 18,
            color: 'white',
            fontWeight: '800',
            letterSpacing: 1,
            textTransform: 'uppercase',
        },
        lastSet: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: colorScheme === 'dark' ? '#1C1C1E' : '#FFFFFF',
            marginHorizontal: 20,
            marginVertical: 10,
            padding: 15,
            borderRadius: 12,
            elevation: 2,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
        },
        lastSetContent: {
            fontSize: 16,
            fontWeight: '600',
            color: colorScheme === 'dark' ? 'white' : 'black',
            marginRight: 15,
        },
        headerText: {
            color: colorScheme === 'dark' ? 'white' : 'black',
            fontSize: 20,
            fontWeight: '700',
            letterSpacing: 0.5,
        },
        chartHeader: {
            color: '#D32F2F',
            fontSize: 14,
            fontWeight: '800',
            textTransform: 'uppercase',
            letterSpacing: 1.2,
        },
        chartCard: {
            marginTop: 20,
            marginHorizontal: 15,
            padding: 15,
            borderRadius: 16,
            backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
            borderWidth: 1,
            borderColor: isDark ? '#333' : '#E5E5EA',
            elevation: 4,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
        },
        chartHeaderComp: {
            flexDirection: 'row',
            marginBottom: 15,
            alignItems: 'center',
            paddingLeft: 5,
            gap: 10,
        }
    })
}