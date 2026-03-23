import { useContext, useEffect, useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from "react-native";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemeContext } from "../context/ThemeContext";
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import Feather from '@expo/vector-icons/Feather';
import { supabase } from "../lib/supabase";
import { WorkoutContext } from "../context/WorkoutContext";
import  DateTimePicker from "@react-native-community/datetimepicker";
import HeightSwitcher from "./misc/heightSwitcher";
import FtHeightInput from "./misc/ftHeightInput";
import UnitSwitcher from "./misc/unitSwitcher";


export default function ProfileCard(){
 const {colorScheme} = useContext(ThemeContext);
 const {activeProtocol,heightUnit, changeHeightUnit, weightUnit, changeWeightUnit} = useContext(WorkoutContext);
 const isDark = colorScheme==='dark';
 const styles = createStyles(isDark);
 const [isLoading, setIsLoading] = useState(false);
 const [isSaveProfileLoading,  setIsSaveProfileLoading] = useState(false);
 const [showProfileEditModal, setShowProfileEditModal] = useState(false);
 const [showDatePicker, setShowDatePicker] = useState(false);
//console.log(heightUnit);
 
 const handleFtHeight = (data)=>{
    updateForm('height',data);
 }

 const [operator, setOperator]= useState({
    name:'--',
    gender:'--',
    dob: null,
    current_weight: '--',
    goal_weight:'--',
    height:'--',
    target_sleep:'--',

 });

 const updateForm = (key, value)=>{
    setOperator(prev=>({...prev, [key]: value}));
 }

 const handleDateChange = (event, selectedDate)=>{
        setShowDatePicker(false);
        if(selectedDate) {
            const year = selectedDate.getFullYear();
            const month = String(selectedDate.getMonth()+1).padStart(2,'0');
            const day = String(selectedDate.getDate()).padStart(2,'0');
            const formattedDate = `${year}-${month}-${day}`;
            setOperator(prev=>({...prev,dob: formattedDate}));
        }
    }

 const getProfileData = async()=>{
    setIsLoading(true);
    let weight = null;
        
  try{
      const {data:{user}} = await supabase.auth.getUser();
    if(!user)return;
    const {data: metricsRecord} = await supabase.from('dailyMetrics').select('weight_data').eq('user_id', user.id).maybeSingle();
    const weightLogs = metricsRecord?.weight_data || [];
    const lastWeightObject = weightLogs.length > 0? weightLogs[weightLogs.length - 1]:null;
   
     
    const {data: profile, error} =  await supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle();
    if(error) throw error;
     
        
    setOperator({
        name: profile?.name || 'UNKOWN OPERATOR',
        gender: profile?.gender || 'N/A',
        dob: profile?.dob|| new Date().toDateString(),
        current_weight: lastWeightObject? lastWeightObject.value:(profile?.current_weight || '--'),
        goal_weight: profile?.goal_weight || '--',
        height: profile?.height || '--',
        target_sleep: profile?.target_sleep || '--',

    });
    //console.log(operator);
  }catch(e){console.error("Error getting profile data", e);}finally{setIsLoading(false);}
 } 

 const handleSaveProfile = async()=>{
    setIsSaveProfileLoading(true);
    const isInvalid = (val)=> !val || val === '--' || val === '';
    if(isInvalid(operator.current_weight)|| isInvalid(operator.dob) || isInvalid(operator.gender)||isInvalid(operator.goal_weight)||isInvalid(operator.height)||isInvalid(operator.height)||isInvalid(operator.name)||isInvalid(operator.target_sleep)){
        Alert.alert("Please enter all values");
        return;
    }
    try{
        const {data:{user}} = await supabase.auth.getUser();
        if(!user) return;

        const {error} = await supabase.from('profiles').update({
            name: operator.name,
            gender: operator.gender,
            height: parseFloat(operator.height),
            goal_weight: parseFloat(operator.goal_weight),
            dob: operator.dob,
            target_sleep: parseFloat(operator.target_sleep),
        }).eq('user_id', user.id);

        if (error){ console.error("error upserting data to profile edits")}
        else console.log("Profile updated successfully");

    }catch(e){console.error('error saving the profile to DB', e)}finally{setIsSaveProfileLoading(false); setShowProfileEditModal(false);}
 }

 const calculateAge =(dobString)=>{
    if(!dobString){ return '--'}
    const today = new Date();
    const birthDate = new Date(dobString);
    let age = today.getFullYear()- birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if(m<0 || m===0 && today.getDate()<birthDate.getDate() ){
        age--;
    }
    return age;
 }
 useEffect(()=>{
   getProfileData();
 },[])

    return(
       
        <View style={styles.card}>
         <View style={styles.cardHeader}>
           {isLoading?<ActivityIndicator size={50} color='#D32F2F'/> : <Ionicons name="finger-print" size={40} color="#D32F2F" />}
            <View style={{}}>
                <Text style={styles.operatorName}>{operator.name.toUpperCase()}</Text>
                <Text style={styles.operatorTags}>
                    {operator.gender.toUpperCase()} // {calculateAge(operator.dob)} YRS
                </Text>
            </View>
           <TouchableOpacity style={{}} onPress={()=>setShowProfileEditModal(true)}>
                <Feather name="edit" size={24} color="white"/>
           </TouchableOpacity>
         </View>
         <View style={styles.divider}/>
         <View style={styles.telemetryGrid}>
            <View style={styles.gridItem}>
                <Text style={styles.gridLabel} >WEIGHT (KG)</Text>
                <Text style={styles.gridValue}>{operator.current_weight} <Text style={styles.gridTarget}>/ {operator.goal_weight}</Text></Text>
            </View>
            <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>{heightUnit==='cm'?'HEIGHT (CM)':'HEIGHT (Ft)'}</Text>
                <Text style={styles.gridValue}>{heightUnit==='cm'? operator.height:`${Math.floor(operator.height/12)}' ${operator.height%12}''`}</Text>
            </View>
            <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>SLEEP TARGET</Text>
                <Text style={styles.gridValue}>{operator.target_sleep} <Text style={styles.gridTarget}>HRS</Text></Text>
            </View>
            <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>PROTOCOL</Text>
                <Text style={[styles.gridValue, {color:'#D32F2F'}]}>{activeProtocol==='custom'?'CUSTOM':'INTENSITY'}</Text>
            </View>
            <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>STATUS</Text>
                <Text style={[styles.gridValue, { color: '#4CAF50' }]}>ACTIVE</Text>
            </View>

         </View>

         <Modal animationType="slide" transparent={true} visible={showProfileEditModal} onRequestClose={()=> setShowProfileEditModal(false)}>

            <View style={styles.modalOverlay}>
                <KeyboardAvoidingView style={{flex: 1, justifyContent:'flex-end'}} behavior={'padding'} keyboardVerticalOffset={0}>
                <View style={[styles.modalContent,{maxHeight:'85%', height:'auto'}]}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>UPDATE PROFILE</Text>
                        <TouchableOpacity onPress={()=> setShowProfileEditModal(false)} style={styles.closeButton}>
                            <Feather name="x" size={24} color={isDark ? '#FFF' : '#000'} />
                        </TouchableOpacity>
                    </View>

                  
                     <ScrollView contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps='handled'>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>OPERATOR NAME</Text>
                            <TextInput
                                style={styles.input}
                                value={operator.name}
                                placeholder="Enter Name"
                                placeholderTextColor={isDark ? '#555' : '#AAA'}
                                onChangeText={t=>updateForm('name', t)}
                            />
                        </View>
                        <View style={styles.rowInputs}>

                           <View style={[styles.inputGroup, styles.halfInput]}>
                             <Text style={styles.inputLabel}>GENDER</Text>
                            <View style={styles.row}>{
                                ['Male', 'Female'].map(g=>(
                                    <TouchableOpacity key={g} style={[styles.choiceBtn, operator.gender===g && styles.activeChoice]} onPress={()=> updateForm('gender', g)}>
                                        <Text style={[styles.choiceText, operator.gender===g && styles.activeChoiceText]}>{g}</Text>
                                    </TouchableOpacity>
                                ))
                            }</View>
                           </View>

                            <View style={[styles.halfInput, styles.inputGroup]}>
                                <Text style={styles.inputLabel}>DATE OF BIRTH</Text>
                                <TouchableOpacity style = {styles.dateBtn} onPress={()=> setShowDatePicker(true)}>
                                    <Text style = {styles.dateText}>{operator?.dob ||'Select Date'}</Text>
                                    <FontAwesome5 name='calendar-alt' size={20} color = '#666'/>
                                </TouchableOpacity>
                                { showDatePicker && (
                                <DateTimePicker
                                value={operator.dob && operator.dob !== '--'? new Date(operator.dob): new Date()}
                                mode='date'
                                display='default'
                                onChange={handleDateChange}
                                maximumDate={new Date()}
                                />)
                                }
                            </View>
                        </View>
                        <View style={[styles.divider,{marginBottom: 5}]}/>
                        
                        <View style={styles.inputGroup}>
                            <View style={[styles.rowInputs,{alignItems:'center'}]}>
                                <Text style={styles.inputLabel}>HEIGHT ({heightUnit})</Text>
                                <HeightSwitcher currentUnit={heightUnit} onToggle={(unit)=>{changeHeightUnit(unit)}}/>
                            </View>
                           
                            {heightUnit==='cm'?(
                                <TextInput
                                style={styles.input}
                                defaultValue= {operator.height !== '--'? operator.height.toString():''}
                                keyboardType="numeric"
                                onChangeText={t=> updateForm('height', t)}
                                placeholder="0"
                                placeholderTextColor={isDark ? '#555' : '#AAA'}
                                />
                            ):(
                                <FtHeightInput sendFtHeight={handleFtHeight} currentFt = {Math.floor(operator.height/12)} currentInch = {operator.height%12}/>
                            )}
                        </View>

                        <View style={styles.divider}/>

                        <View style={[styles.rowInputs,{alignItems:'center'}]}>
                            <Text style={styles.activeChoiceText}>WEIGHT</Text>
                            <UnitSwitcher currentUnit={weightUnit} onToggle={changeWeightUnit} activeColor={'#D32F2F'}/>
                        </View>
                        <View style={styles.rowInputs}>
                            <View style={[styles.inputGroup, styles.halfInput]}>
                                <Text style={styles.inputLabel}>TARGET WEIGHT</Text>
                                <TextInput
                                style={styles.input}
                                value={operator.goal_weight !== '--' ? operator.goal_weight.toString():''}
                                placeholder="0.0"
                                keyboardType="numeric"
                                placeholderTextColor={isDark ? '#555' : '#AAA'}
                                onChangeText={(text)=> updateForm('goal_weight', text)}
                                />
                            </View>
                        </View>

                        <View style={styles.divider}/>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>TARGET SLEEP (HRS)</Text>
                            <TextInput
                            style={styles.input}
                            value={operator.target_sleep !== '--' ? operator.target_sleep.toString():''}
                            placeholder="0"
                            keyboardType="numeric"
                            placeholderTextColor={isDark ? '#555' : '#AAA'}
                            onChangeText={(text)=> updateForm('target_sleep', text)}
                            />
                        </View>

                        <TouchableOpacity style={styles.saveActionBtn} onPress={handleSaveProfile}>
                            {isSaveProfileLoading?<ActivityIndicator color={'white'} size={25}/>:<Text style={styles.saveActionText}>SAVE PARAMETERS</Text>}    
                        </TouchableOpacity>  
                       
                    </ScrollView>

                </View>
                </KeyboardAvoidingView>
            </View>
            
         </Modal>
        </View>
       
    )
}

function createStyles(isDark){
    const bg = isDark ? '#000000' : '#F5F5F5';
    const cardBg = isDark ? '#111111' : '#FFFFFF';
    const textMain = isDark ? '#FFFFFF' : '#000000';
    const textMuted = isDark ? '#666666' : '#888888';
    const primary = '#D32F2F';
    const border = isDark ? '#222222' : '#E0E0E0';
    const text = isDark ? '#FFF' : '#000';

    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: bg,
        },
        headerBar: {
            paddingHorizontal: 20,
            paddingVertical: 15,
            borderBottomWidth: 1,
            borderBottomColor: border,
        },
        screenTitle: {
            fontSize: 22,
            fontWeight: '900',
            color: primary,
            letterSpacing: 2,
            fontStyle: 'italic',
        },
        // --- CARD STYLES ---
        card: {
            marginHorizontal: 10,
            backgroundColor: cardBg,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: border,
            padding: 20,
            marginBottom: 30,
        },
        cardHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent:'space-around',
            marginBottom: 20,
        },
        operatorName: {
            fontSize: 20,
            fontWeight: 'bold',
            color: textMain,
            letterSpacing: 1,
        },
        operatorTags: {
            fontSize: 12,
            color: textMuted,
            fontWeight: 'bold',
            marginTop: 4,
            letterSpacing: 1,
        },
        divider: {
            height: 1,
            backgroundColor: border,
            marginBottom: 20,
        },
        
        // --- GRID STYLES ---
        telemetryGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
        },
        gridItem: {
            width: '48%', // Creates the 2x2 layout
            marginBottom: 20,
        },
        gridLabel: {
            fontSize: 10,
            color: textMuted,
            fontWeight: '900',
            letterSpacing: 1,
            marginBottom: 5,
        },
        gridValue: {
            fontSize: 20,
            color: textMain,
            fontWeight: 'bold',
            fontFamily: 'monospace', // Gives it that raw data look
        },
        gridTarget: {
            fontSize: 14,
            color: textMuted,
        },
// --- MODAL STYLES ---
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.85)',
            justifyContent: 'flex-end', // Slides up from the bottom
        },
        modalContent: {
            backgroundColor: cardBg,
          //  height: '85%', // Takes up most of the screen but leaves a bit of the background
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            borderWidth: 1,
            borderColor: border,
            borderBottomWidth: 0,
            padding: 20,
        },
        modalHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
            paddingBottom: 15,
            borderBottomWidth: 1,
            borderBottomColor: border,
        },
        modalTitle: {
            color: primary,
            fontSize: 18,
            fontWeight: '900',
            letterSpacing: 2,
        },
        closeButton: {
            padding: 5,
        },
        modalScroll: {
            paddingBottom: 40,
        },
        inputGroup: {
            marginBottom: 20,
        },
        rowInputs: {
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
        halfInput: {
            width: '48%',
        },
        inputLabel: {
            fontSize: 10,
            color: textMuted,
            fontWeight: '900',
            letterSpacing: 1,
            marginBottom: 8,
        },
        input: {
            backgroundColor: isDark ? '#1A1A1C' : '#F9F9F9',
            borderWidth: 1,
            borderColor: border,
            borderRadius: 8,
            paddingHorizontal: 15,
            paddingVertical: 12,
            color: textMain,
            fontSize: 16,
            fontFamily: 'monospace', // Keeps that raw data tactical look
        },
        unitPlaceholderBox: {
            backgroundColor: isDark ? '#2A2A2C' : '#EAEAEA',
            borderWidth: 1,
            borderColor: textMuted,
            borderStyle: 'dashed',
            borderRadius: 8,
            padding: 15,
            alignItems: 'center',
            marginBottom: 15,
        },
        unitPlaceholderText: {
            color: textMuted,
            fontSize: 10,
            fontWeight: 'bold',
            letterSpacing: 1,
        },
        saveActionBtn: {
            backgroundColor: primary,
            borderRadius: 12,
            paddingVertical: 18,
            alignItems: 'center',
            marginTop: 10,
            shadowColor: primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 5,
        },
        saveActionText: {
            color: '#FFFFFF',
            fontSize: 14,
            fontWeight: '900',
            letterSpacing: 2,
        },
         row: { flexDirection: 'row', gap: 15 },
        choiceBtn: { 
            flex: 1, 
            padding: 10, 
            backgroundColor: cardBg, 
            borderRadius: 12, 
            alignItems: 'center', 
            borderWidth: 1, 
            borderColor: border 
        },
        activeChoice: { backgroundColor: primary, borderColor: primary },
        choiceText: { fontSize: 14, fontWeight: '600', color: '#888' },
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
    });
}