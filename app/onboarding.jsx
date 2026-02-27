import { useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { Image, KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemeContext } from "../src/context/ThemeContext";
import { FontAwesome5, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { supabase } from "../src/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LoginPage from "./auth/login";
import  DateTimePicker from "@react-native-community/datetimepicker";
import FadeInView from "../src/components/FadeInView";

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

    const updateForm = (key, value)=>{
        setFormData(prev => ({...prev, [key]: value}));
    }
    const handleNext = async ()=>{
       if(step<6) setStep(step+1);
       if(step===5){await AsyncStorage.setItem('onboarding_completed', 'true');}
      // console.log(formData);
       //else{handleSubmit()};
    }
    const handleBack = ()=>{
        if(step>1) setStep(step-1);
    }

    const handleDateChange = (event, selectedDate)=>{
        setShowDatePicker(false);
        if(selectedDate) updateForm('dob', selectedDate);
    }


    const renderStep1 = ()=>(
        <View style={styles.introContainer}>
            <FadeInView delay={200}>
                <Image source={require('../assets/myIcon.png')} style={styles.appLogo} resizeMode="contain"/>
            </FadeInView>
            <FadeInView delay={600}>
                <Text style={styles.massiveTitle}>INTENSITY</Text>
            </FadeInView>
            <FadeInView delay={1200}>
                <Text style={styles.introSubtitle}>THE OPTIMAL TRAINING CONSOLE</Text>
            </FadeInView>
            <FadeInView delay={1800} style={styles.bottomButtonContainer}>
                <TouchableOpacity style={styles.primaryButton} onPress={()=> setStep(2)}>
                    <Text style={styles.buttonText}>INITIALIZE</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={async() => {await AsyncStorage.setItem('onboarding_completed', 'true'); setStep(6);}} style={{ marginTop: 20, alignItems: 'center' }}>
                <Text style={{ color: '#888', fontSize: 14, fontWeight: 'bold' }}>
                ALREADY A USER? <Text style={{ color: '#D32F2F' }}>LOG IN</Text>
                </Text>
            </TouchableOpacity>
            </FadeInView>
        </View>
    )

    const renderStep2 = ()=>(
        <View style={styles.introContainer}>
            <FadeInView delay={100}>
                <Text style={styles.massiveTitle}>PROTOCOLS</Text>
                <Text style={styles.introSubtitle}>SYSTEM CAPABILITIES</Text>
            </FadeInView>
            <View style={styles.featureList}>
                <FadeInView delay={600} style={styles.featureItem}>
                    <FontAwesome5 name="check-circle" size={24} color= '#EF6C00'/>
                    <Text style={styles.featureText}>Follow optimal routines for your exact goals.</Text>
                </FadeInView>
                
                <FadeInView delay={1000} style={styles.featureItem}>
                    <FontAwesome5 name="fire-alt" size={24} color='#D32F2F'/>
                    <Text style={styles.featureText}>Track top sets with high-intensity execution.</Text>
                </FadeInView>
                
                <FadeInView delay={1400} style={styles.featureItem}>
                    <FontAwesome5 name="bed" size={24} color='#0088FF' />
                    <Text style={styles.featureText}>Calibrate weight and sleep recovery data.</Text>
                </FadeInView>

                <FadeInView delay={1800} style={styles.featureItem}>
                    <FontAwesome5 name="apple-alt" size={24} color="#00FF66" />
                    <Text style={styles.featureText}>Log macros to fuel maximum growth.</Text>
                </FadeInView>
            </View>
            <FadeInView delay={2400} style={styles.bottomButtonContainer}>
                <TouchableOpacity style={styles.primaryButton} onPress={()=> setStep(3)}>
                    <Text style={styles.buttonText}>BEGIN CALIBRATION</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={async() => {await AsyncStorage.setItem('onboarding_completed', 'true'); setStep(6);}} style={{ marginTop: 20, alignItems: 'center' }}>
                <Text style={{ color: '#888', fontSize: 14, fontWeight: 'bold' }}>
                ALREADY A USER? <Text style={{ color: '#D32F2F' }}>LOG IN</Text>
                </Text>
            </TouchableOpacity>
            </FadeInView>
        </View>
    )
    const renderStep3 = ()=>(
        <View style={styles.stepContainer}>
           <FadeInView delay={200}>
            <Text style={styles.stepTitle}>IDENTITY</Text>
            <Text style={styles.stepSubtitle} >Operator Details</Text> 
            </FadeInView>
            <FadeInView delay={500}>
            <Text style={styles.label}>FULL NAME</Text>
            <TextInput 
            style={styles.input}
            placeholder="Enter your Name"
            placeholderTextColor={'#666'}
            value={formData.full_name}
            onChangeText={t => updateForm('full_name', t)}
            />
            </FadeInView>

           <FadeInView delay={800}>
             <Text style={styles.label}>GENDER</Text>
             <View style={styles.row}>{['Male','Female'].map(g=>(
                <TouchableOpacity key={g} style={[styles.choiceBtn, formData.gender=== g && styles.activeChoice]} onPress={()=> updateForm('gender', g)} >
                    <Text style={[styles.choiceText, formData.gender === g && styles.activeChoiceText]}>{g}</Text>
                </TouchableOpacity>
            ))}</View>
           </FadeInView>

           <FadeInView delay={1200}> 
            <Text style={styles.label}>DATE OF BIRTH</Text>
            <TouchableOpacity style = {styles.dateBtn} onPress={()=> setShowDatePicker(true)}>
                <Text style = {styles.dateText}>{formData.dob.toDateString()}</Text>
                <FontAwesome5 name='calendar-alt' size={20} color = '#666'/>
            </TouchableOpacity>
           { showDatePicker && (
                <DateTimePicker
                value={formData.dob}
                mode='date'
                display='default'
                onChange={handleDateChange}
                maximumDate={new Date()}
                />)
            }</FadeInView>
            <FadeInView delay={1500}>
                <TouchableOpacity onPress={async() => {await AsyncStorage.setItem('onboarding_completed', 'true'); setStep(6);} } style={{ marginTop: 20, alignItems: 'center' }}>
                <Text style={{ color: '#888', fontSize: 14, fontWeight: 'bold' }}>
                ALREADY A USER? <Text style={{ color: '#D32F2F' }}>LOG IN</Text>
                </Text>
            </TouchableOpacity>
            </FadeInView>
        </View>
    );

    const renderStep4 = () => (
        <View style={styles.stepContainer}>
            
            <FadeInView delay={200}>
                <Text style={styles.stepTitle}>CALIBRATION</Text>
                <Text style={styles.stepSubtitle}>Physical Metrics</Text>
            </FadeInView>

            <FadeInView delay={600}>
                <View style={styles.row}>
                    
                    <View style={{flex: 1}}>
                        <Text style={styles.label}>WEIGHT (KG)</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.current_weight}
                            placeholder="0.0"
                            keyboardType="numeric"
                            placeholderTextColor="#666"
                            onChangeText={(t) => updateForm('current_weight', t)}
                        />
                    </View>
                    
                    <View style={{width: 15}}/>
                    
                    <View style={{flex: 1}}>
                        <Text style={styles.label}>HEIGHT (CM)</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.height}
                            placeholder="0.0"
                            keyboardType="numeric"
                            placeholderTextColor="#666"
                            onChangeText={(t) => updateForm('height', t)}
                        />
                    </View>

                </View>
            </FadeInView>

        </View>
    );
   const renderStep5 = () => (
        <View style={styles.stepContainer}>
            
            <FadeInView delay={200}>
                <Text style={styles.stepTitle}>OBJECTIVES</Text>
                <Text style={styles.stepSubtitle}>Set Your Targets</Text>
            </FadeInView>

            <FadeInView delay={500}>
                <Text style={styles.label}>TARGET BODYWEIGHT (KG)</Text>
                <TextInput
                    value={formData.goal_weight}
                    placeholder="0.0"
                    keyboardType="numeric"
                    style={styles.input}
                    placeholderTextColor='#666'
                    onChangeText={(t) => updateForm('goal_weight', t)}
                />
            </FadeInView>

            <FadeInView delay={800}>
                <Text style={styles.label}>TARGET SLEEP (HOURS)</Text>
                <TextInput
                    value={formData.target_sleep}
                    placeholder="0"
                    keyboardType="numeric"
                    style={styles.input}
                    placeholderTextColor='#666'
                    onChangeText={(t) => updateForm('target_sleep', t)}
                />
            </FadeInView>

            <FadeInView delay={1100}>
                <View style={styles.infoBox}>
                    <Ionicons name="information-circle-outline" size={20} color="#888" />
                    <Text style={styles.infoText}>These targets will set the baseline for your daily tracking console.</Text>
                </View>
            </FadeInView>

        </View>
    );


    const renderStep6=()=>(
       <FadeInView delay={500}>
         <LoginPage formData={formData} colorScheme={colorScheme}/>
       </FadeInView>
    );

    
    return(
        <SafeAreaView style={styles.container} >
            
            <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':'height'} style={{flex:1}}>
                <View style={styles.header}>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, {width:`${(step/6) *100}%`}]}/>
                    </View>
                </View>

                <ScrollView contentContainerStyle={{flexGrow: 1, justifyContent: 'center'}}>
                    {step===1 && renderStep1()}
                    {step===2 && renderStep2()}
                    {step===3 && renderStep3()}
                    {step===4 && renderStep4()}
                    {step===5 && renderStep5()}
                    {step===6 && renderStep6()}

                </ScrollView>
                <View style={styles.footer}>
                    <TouchableOpacity onPress={handleBack} style={[styles.navBtn, styles.backBtn, step===1&&{opacity:0}]} disabled={step===1}>
                        <Text style={styles.backText}>BACK</Text>
                    </TouchableOpacity>
                   {step>2 && step <6 && <TouchableOpacity style={[styles.navBtn, styles.nextBtn]} onPress={handleNext}>
                        <Text style={styles.nextText}>{loading?'SAVING...':'NEXT'}</Text>
                    </TouchableOpacity>}
                </View>
                
            </KeyboardAvoidingView>
            <StatusBar style={colorScheme==='dark'?'light':'dark'} />
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

        footer: { padding: 10, flexDirection: 'row', justifyContent: 'space-between' },
        navBtn: { paddingVertical: 0, paddingHorizontal: 30, borderRadius: 30, minWidth: 120, alignItems: 'center' },
        backBtn: { backgroundColor: 'transparent' },
        nextBtn: { backgroundColor: primary },
        backText: { color: '#666', fontWeight: 'bold' },
        nextText: { color: '#FFF', fontWeight: 'bold', fontSize: 16, letterSpacing: 1, marginVertical: 10,},
        introContainer: {
            flex: 1,
            justifyContent: 'center',
            paddingHorizontal: 25,
            backgroundColor: isDark?'#000000':'#ffffff', // Forcing dark mode for the intro looks best
        },
        centerIcon: {
            textAlign: 'center',
            marginBottom: 20,
        },
        massiveTitle: {
            color: !isDark?'#000000':'#ffffff', 
            fontSize: 42,
            fontWeight: '900',
            textAlign: 'center',
            letterSpacing: 4,
            textTransform: 'uppercase',
        },
        introSubtitle: {
            color: '#888888',
            fontSize: 14,
            fontWeight: '800',
            textAlign: 'center',
            letterSpacing: 2,
            marginTop: 10,
            textTransform: 'uppercase',
        },
        featureList: {
            marginTop: 50,
            paddingHorizontal: 10,
        },
        featureItem: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 25,
        },
        featureText: {
            color: !isDark?'#000000': '#E0E0E0',
            fontSize: 16,
            fontWeight: '600',
            marginLeft: 15,
            flex: 1, // Ensures text wraps cleanly
        },
        bottomButtonContainer: {
            marginTop: 60,
        },
        primaryButton: {
            backgroundColor: '#D32F2F', // Your signature red
            paddingVertical: 18,
            borderRadius: 12,
            alignItems: 'center',
        },
        buttonText: {
            color: '#FFFFFF',
            fontSize: 16,
            fontWeight: '900',
            letterSpacing: 2,
        },
        appLogo: {
            width: 200,  // Slightly larger than the old size=60 icon to give it premium presence
            height: 200,
            alignSelf: 'center', // Centers the image perfectly
            marginBottom: 20,
        },
    })
}