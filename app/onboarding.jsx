import { useRouter } from "expo-router";
import { useContext, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemeContext } from "../src/context/ThemeContext";
import { FontAwesome5, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { supabase } from "../src/lib/supabase";
//import { DateTimePicker, DateTimePickerAndroid } from "@react-native-community/datetimepicker";

export default function OnboardingScreen(){
    const router = useRouter();
    const {colorScheme} = useContext(ThemeContext);
    const styles = createStyles(colorScheme);
    const [loading, setLoading] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [step, setStep] = useState(1);

    const [formData, setFormData] = useState({
        full_name : '',
        gender : '',
        dob : new Date(),
        current_weight : '',
        height:'',
        goal_weight:'',
        target_sleep: '',
    });
    const handleSubmit = async()=>{
        setLoading(true);
        try{
            const {data:{user}} = await supabase.auth.getUser();
            if(!user) throw new Error("No user found");

            const updates = {
                user_id: user.id,
                created_at: new Date(),
                name: formData.full_name,
                gender: formData.gender,
                height: parseFloat(formData.height) || 0,
                current_weight: parseFloat(formData.current_weight)||0,
                goal_weight: parseFloat(formData.goal_weight)||0,
                dob : formData.dob.toISOString().split('T')[0],
                target_sleep: parseFloat(formData.target_sleep)||8
            };

            const {error} = await supabase.from('profiles').upsert(updates);
            if(error)throw error;
            router.replace('/(tabs)');

        }catch(e){console.error("error handling onboarding submit")}finally{setLoading(false)}
    }
    const updateForm = (key, value)=>{
        setFormData(prev => ({...prev, [key]: value}));
    }
    const handleNext = ()=>{
       if(step<3) setStep(step+1);
       else{handleSubmit()};
    }
    const handleBack = ()=>{
        if(step>1) setStep(step-1);
    }

    const handleDateChange = (event, selectedDate)=>{
        setShowDatePicker(false);
        if(selectedDate) updateForm('dob', selectedDate);
    }

    const renderStep1 = ()=>(
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>IDENTITY</Text>
            <Text style={styles.stepSubTitle} >Operator Details</Text>
            <Text style={styles.label}>FULL NAME</Text>
            <TextInput 
            style={styles.input}
            placeholder="Enter your Name"
            placeholderTextColor={'#666'}
            value={formData.full_name}
            onChangeText={t => updateForm('full_name', t)}
            />

            <Text style={styles.label}>GENDER</Text>
            <View style={styles.row}>{['Male','Female'].map(g=>(
                <TouchableOpacity key={g} style={[styles.choiceBtn, formData.gender=== g && styles.activeChoice]} onPress={()=> updateForm('gender', g)} >
                    <Text style={[styles.choiceText, formData.gender === g && styles.activeChoicetext]}>{g}</Text>
                </TouchableOpacity>
            ))}</View>

            <Text style={styles.label}>DATE OF BIRTH</Text>
            <TouchableOpacity styles = {styles.dateBtn} onPress={()=> setShowDatePicker(true)}>
                <Text style = {styles.dateText}>{formData.dob.toDateString()}</Text>
                <FontAwesome5 name='calendar-alt' size={20} color = '#666'/>
            </TouchableOpacity>
            {/*showDatePicker && (
                <DateTimePickerAndroid
                value={formData.dob}
                mode='date'
                display='default'
                onChange={handleDateChange}
                maximumDate={new Date()}
                />
            )*/}
        </View>
    );

    const renderStep2 = ()=>(
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>CALIBRATION</Text>
            <Text style={styles.stepSubTitle}>Physical Metrics</Text>
            <View style={styles.row}>
                <View style={{flex:1}}>
                    <Text style={styles.label}>WEIGHT (KG)</Text>
                    <TextInput
                    style={styles.input}
                    value={formData.current_weight}
                    placeholder="0.0"
                    keyboardType="numeric"
                    placeholderTextColor= "#666"
                    onChangeText={(t)=> updateForm('current_weight', t)}
                    />
                <View style={{width: 15}}/>
                </View>
                <View style={{flex:1}}>
                    <Text style={styles.label}>HEIGHT (CM)</Text>
                    <TextInput
                    style={styles.input}
                    value={formData.height}
                    placeholder="0.0"
                    keyboardType="numeric"
                    placeholderTextColor= "#666"
                    onChangeText={(t)=> updateForm('height', t)}
                    />
                </View>
            </View>
        </View>
    );

    const renderStep3 = ()=>(
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>OBJECTIVES</Text>
            <Text style={styles.stepSubTitle}>Set Your Targets</Text>
            <Text style={styles.label}>TARGET BODYWEIGHT (KG)</Text>
            <TextInput
            value={formData.goal_weight}
            placeholder="0.0"
            keyboardType="numeric"
            style={styles.input}
            placeholderTextColor='#666'
            onChangeText={(t)=> updateForm('goal_weight', t)}
            />
            <Text style={styles.label}>TARGET SLEEP (HOURS)</Text>
            <TextInput
            value={formData.target_sleep}
            placeholder="0"
            keyboardType="numeric"
            style={styles.input}
            placeholderTextColor='#666'
            onChangeText={(t)=> updateForm('target_sleep', t)}
            />
            <View style={styles.infoBox}>
                <Ionicons name="information-circle-outline" size={20} color="#888" />
                <Text style={styles.infoText}>These targets will set the baseline for your daily tracking console.</Text>
            </View>
        </View>
    )
    return(
        <SafeAreaView style={styles.container}>
            
            <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':'height'} style={{flex:1}}>
                <View style={styles.header}>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, {width:`${(step/3) *100}%`}]}/>
                    </View>
                    <Text style={styles.stepIndicator}>STEP {step} / 3</Text>
                </View>

                <ScrollView contentContainerStyle={{flexGrow: 1, justifyContent: 'center'}}>
                    {step===1 && renderStep1()}
                    {step===2 && renderStep2()}
                    {step===3 && renderStep3()}
                </ScrollView>
                <View style={styles.footer}>
                    <TouchableOpacity onPress={handleBack} style={[styles.navBtn, styles.backBtn, step===1&&{opacity:0}]} disabled={step===1}>
                        <Text style={styles.backText}>BACK</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.navBtn, styles.nextBtn]} onPress={handleNext}>
                        <Text style={styles.nextText}>{loading?'SAVING...':(step===3 ? 'INITIALIZE':'NEXT')}</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
function createStyles(colorScheme){
    const isDark = colorScheme === 'dark';
    const bg = isDark ? '#000' : '#F2F2F7';
    const text = isDark ? '#FFF' : '#000';
    const primary = '#D32F2F';
    const cardBg = isDark ? '#1C1C1E' : '#FFF';
    const border = isDark ? '#333' : '#E5E5EA';
    return StyleSheet.create({
        container: { flex: 1, backgroundColor: bg },
        header: { padding: 20, paddingTop: 10 },
        progressBar: { height: 6, backgroundColor: isDark ? '#333' : '#E0E0E0', borderRadius: 3, overflow: 'hidden' },
        progressFill: { height: '100%', backgroundColor: primary },
        stepIndicator: { color: '#666', fontSize: 12, fontWeight: 'bold', marginTop: 10, alignSelf: 'flex-end' },
        
        stepContainer: { padding: 25 },
        stepTitle: { fontSize: 32, fontWeight: '900', color: primary, letterSpacing: 1, marginBottom: 5, textTransform: 'uppercase' },
        stepSubtitle: { fontSize: 16, color: '#888', marginBottom: 30, fontWeight: '500' },

        label: { color: '#666', fontSize: 11, fontWeight: 'bold', letterSpacing: 1, marginBottom: 8, marginTop: 10 },
        input: { 
            backgroundColor: cardBg, 
            color: text, 
            padding: 16, 
            borderRadius: 12, 
            fontSize: 18, 
            borderWidth: 1, 
            borderColor: border,
            marginBottom: 10
        },
        
        row: { flexDirection: 'row', gap: 15 },
        choiceBtn: { 
            flex: 1, 
            padding: 16, 
            backgroundColor: cardBg, 
            borderRadius: 12, 
            alignItems: 'center', 
            borderWidth: 1, 
            borderColor: border 
        },
        activeChoice: { backgroundColor: primary, borderColor: primary },
        choiceText: { fontSize: 16, fontWeight: '600', color: '#888' },
        activeChoiceText: { color: '#FFF' },

        dateBtn: {
            backgroundColor: cardBg,
            padding: 16,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: border,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center'
        },
        dateText: { color: text, fontSize: 16 },

        infoBox: { flexDirection: 'row', gap: 10, marginTop: 20, padding: 15, backgroundColor: 'rgba(211, 47, 47, 0.1)', borderRadius: 10 },
        infoText: { color: text, fontSize: 12, flex: 1 },

        footer: { padding: 20, flexDirection: 'row', justifyContent: 'space-between' },
        navBtn: { paddingVertical: 16, paddingHorizontal: 30, borderRadius: 30, minWidth: 120, alignItems: 'center' },
        backBtn: { backgroundColor: 'transparent' },
        nextBtn: { backgroundColor: primary },
        backText: { color: '#666', fontWeight: 'bold' },
        nextText: { color: '#FFF', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 }
    })
}