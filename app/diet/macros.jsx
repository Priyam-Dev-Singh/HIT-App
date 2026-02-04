import { useContext, useEffect, useRef, useState } from "react";
import { Text, TextInput, TouchableOpacity, View, Pressable, KeyboardAvoidingView, ScrollView, Platform, StyleSheet, Dimensions, Keyboard, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { deleteLastMacros, getWeeklyCalories, getWeeklyWater, saveMacros } from "../../src/storage";
import { ThemeContext } from "../../src/context/ThemeContext";
import Octicons from '@expo/vector-icons/Octicons';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { BarChart } from "react-native-gifted-charts"; // Ensure this is installed

export default function MacrosLoggingScreen() {
    const router = useRouter();
    const { colorScheme, toggleTheme } = useContext(ThemeContext);
    const styles = createStyles(colorScheme);
    const screenWidth = Dimensions.get("window").width;

   
    const [protein, setProtein] = useState('');
    const [carbs, setCarbs] = useState('');
    const [fats, setFats] = useState('');
    const [water, setWater] = useState('');
    const [dailyCalories, setDailyCalories] = useState([]);
    const [dailyWater, setDailyWater] = useState([]);
    const proteinInputRef = useRef(null);
    const carbsInputRef = useRef(null);
    const fatsInputRef = useRef(null);
    const waterInputRef = useRef(null);

    useEffect(()=>{
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide',()=>{
            proteinInputRef.current?.blur();
            carbsInputRef.current?.blur();
            fatsInputRef.current?.blur();
            waterInputRef.current?.blur();
        });
        return ()=> keyboardDidHideListener.remove();
    },[])
    useEffect(()=>{
        const loadData = async()=>{
            const calories = await getWeeklyCalories();
            setDailyCalories(calories);
            const waters = await getWeeklyWater();
            setDailyWater(waters);
        }
        loadData();
    },[])


    const handleSave = async () => {
        if (!protein || !carbs || !fats || !water) {
            alert("Please enter all rations!");
            return;
        }
        const success = await saveMacros(protein, carbs, fats, water);
        if (success) {
            setProtein('');
            setCarbs('');
            setFats('');
            setWater('');
            alert("Supply Log Updated!");
            router.back();
        }
    };
    const performDelete = async()=>{
        const success = await deleteLastMacros();
        if(success){
            Alert.alert("Last set was deleted");
        }
        else{
            alert("Log your macros first");
        }
    };
    const handleDelete = ()=>{
        if(Platform.OS==='web'){
            if(window.confirm("Delete last Macros Log?")){performDelete();}
        }
        else{
            Alert.alert("Delete Last Macros Log?", 'This cant be undone',[
                {text:'cancel', style:'cancel'},
                {text:'Delete', style:'destructive', onPress: performDelete}
            ]
            )
        };
    };

    //console.log(dailyCalories);
    //console.log(dailyWater);
    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
            >
               
                <View style={styles.header}>
                    <Pressable onPress={() => { router.push("/") }}>
                        <Octicons name="home" size={28} color={colorScheme === 'dark' ? 'white' : 'black'} />
                    </Pressable>
                    <Text style={styles.headerText}>MACRO SAVER</Text>
                    <Pressable onPress={toggleTheme}>
                        <Octicons 
                            name={colorScheme === 'dark' ? "moon" : "sun"} 
                            size={30} 
                            color={colorScheme === 'dark' ? 'white' : 'black'} 
                        />
                    </Pressable>
                </View>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    
                    
                    <View style={styles.chartContainer}>
                        <View style={styles.chartHeader}>
                            <FontAwesome5 name="fire" size={14} color={colorScheme==='dark'?'#00E676' : '#2E7D32'} />
                            <Text style={styles.chartTitle}>Caloric Intake (History)</Text>
                        </View>
                        
                        <BarChart
                            data={dailyCalories}
                            barWidth={22}
                            barBorderRadius={4}
                            frontColor={colorScheme==='dark'?'#00E676' : '#2E7D32'}
                            yAxisThickness={0}
                            xAxisThickness={0}
                            yAxisExtraHeight={30}
                            hideYAxisText
                            hideRules
                            height={120}
                            width={screenWidth - 70}
                            isAnimated
                            yAxisTextStyle={{ color: colorScheme === 'dark' ? '#CCCCCC' : '#333333' }}
                            xAxisLabelTextStyle={{color: colorScheme === 'dark' ? '#CCCCCC' : '#333333', // Dynamic color
                            fontSize: 12}}
                            focusEnabled = {true}
                            showTextonFocus = {true}
                        />
                    </View>

                   
                    <View style={styles.chartContainer}>
                        <View style={styles.chartHeader}>
                            <MaterialCommunityIcons name="water" size={18} color={colorScheme==='dark'?'#40C4FF' : '#1976D2' } />
                            <Text style={[styles.chartTitle, { color: colorScheme==='dark'?'#40C4FF' : '#1976D2' }]}>Hydration (History)</Text>
                        </View>
                        <BarChart
                            data={dailyWater}
                            barWidth={22}
                            barBorderRadius={4}
                            frontColor="#1976D2"
                            yAxisThickness={0}
                            xAxisThickness={0}
                            maxValue={4}
                            noOfSections={4}
                            yAxisExtraHeight={20}
                            hideRules
                            hideYAxisText
                            height={120}
                            width={screenWidth - 70}
                            isAnimated
                            yAxisTextStyle={{ color: colorScheme === 'dark' ? '#CCCCCC' : '#333333' }}
                            xAxisLabelTextStyle={{color: colorScheme === 'dark' ? '#CCCCCC' : '#333333', // Dynamic color
                            fontSize: 12}}
                        />
                    </View>

                   
                    <Text style={styles.gridHeader}>LOG TODAY'S MACROS</Text>

                    <View style={styles.gridContainer}>
                       
                        <View style={styles.inputCard}>
                            <Text style={styles.label}>PROTEIN (g)</Text>
                            <TextInput
                                ref={proteinInputRef}
                                style={styles.inputField}
                                placeholder="0"
                                value={protein}
                                onChangeText={setProtein}
                                keyboardType="numeric"
                                maxLength={5}
                                placeholderTextColor={colorScheme === 'dark' ? '#555' : '#CCC'}
                            />
                        </View>

                       
                        <View style={styles.inputCard}>
                            <Text style={styles.label}>CARBS (g)</Text>
                            <TextInput
                                ref={carbsInputRef}
                                style={styles.inputField}
                                placeholder="0"
                                value={carbs}
                                onChangeText={setCarbs}
                                keyboardType="numeric"
                                maxLength={5}
                                placeholderTextColor={colorScheme === 'dark' ? '#555' : '#CCC'}
                            />
                        </View>

                        
                        <View style={styles.inputCard}>
                            <Text style={styles.label}>FATS (g)</Text>
                            <TextInput
                                ref={fatsInputRef}
                                style={styles.inputField}
                                placeholder="0"
                                value={fats}
                                onChangeText={setFats}
                                keyboardType="numeric"
                                maxLength={5}
                                placeholderTextColor={colorScheme === 'dark' ? '#555' : '#CCC'}
                            />
                        </View>

                        
                        <View style={[styles.inputCard, styles.waterCard]}>
                            <Text style={[styles.label, { color: '#64B5F6' }]}>WATER (L)</Text>
                            <TextInput
                                ref={waterInputRef}
                                style={[styles.inputField, { color: '#90CAF9' }]}
                                placeholder="0"
                                value={water}
                                onChangeText={setWater}
                                keyboardType="numeric"
                                maxLength={4}
                                placeholderTextColor={colorScheme === 'dark' ? '#1565C0' : '#BBDEFB'}
                            />
                        </View>
                    </View>

                   
                    <View style={{display:'flex', flexDirection:'row', alignItems:'baseline', justifyContent:'center'}}>
                        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                        <Text style={styles.saveText}>SAVE YOUR MACROS</Text>
                        <FontAwesome5 name="check" size={18} color="white" style={{marginLeft: 10}}/>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleDelete}>
                        <Octicons name='trash' size={28} color='red' style={{padding:20,}}/>
                    </TouchableOpacity>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

function createStyles(colorScheme) {
    const isDark = colorScheme === 'dark';
    const bg = isDark ? '#000000' : '#F2F2F7';
    const cardBg = isDark ? '#1C1C1E' : '#FFFFFF';
    const textMain = isDark ? '#FFFFFF' : '#000000';
    const textSub = isDark ? '#888888' : '#666666';
    const border = isDark ? '#333333' : '#E5E5EA';
    const greenHero = isDark ? '#00E676' : '#2E7D32';

    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: bg,
            paddingBottom: 70,
        },
        scrollContent: {
            paddingBottom: 40,
        },
        
        header: {
            height: 60,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            borderBottomWidth: 1,
            borderBottomColor: border,
            backgroundColor: isDark ? '#111111' : '#FFFFFF',
        },
        headerText: {
            color: textMain,
            fontSize: 20,
            fontWeight: '700',
            letterSpacing: 0.5,
        },

       
        chartContainer: {
            marginTop: 20,
            marginHorizontal: 15,
            padding: 15,
            borderRadius: 16,
            backgroundColor: cardBg,
            borderWidth: 1,
            borderColor: border,
            elevation: 3,
            shadowColor: "#000",
            shadowOpacity: 0.2,
            shadowRadius: 4,
            alignItems: 'center'
        },
        chartHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            alignSelf: 'flex-start',
            marginBottom: 10,
            gap: 8,
        },
        chartTitle: {
            color: greenHero,
            fontSize: 14,
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: 1,
        },

       
        gridHeader: {
            color: textSub,
            fontSize: 12,
            fontWeight: 'bold',
            letterSpacing: 1.5,
            marginTop: 30,
            marginLeft: 20,
            marginBottom: 10,
            textTransform: 'uppercase',
        },
        gridContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            paddingHorizontal: 15,
            gap: 15,
        },
        inputCard: {
            width: '47%', 
            aspectRatio: 1.1,
            backgroundColor: cardBg,
            borderRadius: 12,
            padding: 15,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: border,
        },
        waterCard: {
            borderColor: isDark ? '#1565C0' : '#90CAF9',
            backgroundColor: isDark ? '#0D1B2A' : '#E3F2FD',
        },
        label: {
            color: textSub,
            fontSize: 12,
            fontWeight: '700',
            marginBottom: 8,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
        },
        inputField: {
            fontSize: 25,
            fontWeight: 'bold',
            color: textMain,
            alignItems:'center',
            textAlign: 'center',
            width: '70%',
            height: 50,
        },

       
        saveButton: {
            backgroundColor: greenHero,
            marginHorizontal: 20,
            paddingHorizontal: 20,
            padding: 10,
            marginTop: 30,
            height: 56,
            borderRadius: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            elevation: 6,
            shadowColor: greenHero,
            shadowOpacity: 0.4,
            shadowRadius: 8,
        },
        saveText: {
            color: 'white',
            fontSize: 17,
            fontWeight: '800',
            letterSpacing: 1,
            textTransform: 'uppercase',
        }
    });
}