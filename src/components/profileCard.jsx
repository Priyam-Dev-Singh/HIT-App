import { useContext, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text } from "react-native";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemeContext } from "../context/ThemeContext";
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { supabase } from "../lib/supabase";

export default function ProfileCard(){
 const {colorScheme} = useContext(ThemeContext);
 const isDark = colorScheme==='dark';
 const styles = createStyles(isDark);
 const [isLoading, setIsLoading] = useState(false);

 const [operator, setOperator]= useState({
    name:'--',
    gender:'--',
    dob: null,
    current_weight: '--',
    goal_weight:'--',
    height:'--',
    target_sleep:'--',

 })
 const getProfileData = async()=>{
    setIsLoading(true);
  try{
      const {data:{user}} = await supabase.auth.getUser();
    if(!user)return;
    const {data: profile, error} =  await supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle();
    if(error) throw error;

    setOperator({
        name: profile?.name || 'UNKOWN OPERATOR',
        gender: profile?.gender || 'N/A',
        dob: profile?.dob,
        current_weight: profile?.current_weight || '--',
        goal_weight: profile?.goal_weight || '--',
        height: profile?.height || '--',
        target_sleep: profile?.target_sleep || '--',

    });
    //console.log(operator);
  }catch(e){console.error("Error getting profile data", e);}finally{setIsLoading(false);}
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
            <View style={{ marginLeft: 15 }}>
                <Text style={styles.operatorName}>{operator.name.toUpperCase()}</Text>
                <Text style={styles.operatorTags}>
                    {operator.gender.toUpperCase()} // {calculateAge(operator.dob)} YRS
                </Text>
            </View>
         </View>
         <View style={styles.divider}/>
         <View style={styles.telemetryGrid}>
            <View style={styles.gridItem}>
                <Text style={styles.gridLabel} >WEIGHT (KG)</Text>
                <Text style={styles.gridValue}>{operator.current_weight} <Text style={styles.gridTarget}>/ {operator.goal_weight}</Text></Text>
            </View>
            <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>HEIGHT (CM)</Text>
                <Text style={styles.gridValue}>{operator.height}</Text>
            </View>
            <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>SLEEP TARGET</Text>
                <Text style={styles.gridValue}>{operator.target_sleep} <Text style={styles.gridTarget}>HRS</Text></Text>
            </View>
            <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>STATUS</Text>
                <Text style={[styles.gridValue, { color: '#4CAF50' }]}>ACTIVE</Text>
            </View>

         </View>
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
        },});
}