import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import WeightComponent from "../../src/components/wieght";
import { useContext, useEffect, useState } from "react";
import { ThemeContext } from "../../src/context/ThemeContext";
import { StyleSheet } from "react-native";
import SleepComponent from "../../src/components/sleep";
import { supabase } from "../../src/lib/supabase";

export default function CalibrationLogger(){
    const [targetWeight, setTargetWeight] = useState(0);
    const [targetSleep, setTargetSleep] = useState(0);
    const {colorScheme} = useContext(ThemeContext);
    const styles = createStyles(colorScheme);
    const [activeTab, setActiveTab] = useState('weight');
   useEffect(()=>{
     const passTargets = async()=>{
        try{
            const {data:{user}} = await supabase.auth.getUser();
            if(!user)return;
            const {data: profiles, error} = await supabase.from('profiles').select("goal_weight, target_sleep").eq('user_id', user.id).maybeSingle();
            if(error) throw error;
           // console.log(profiles.goal_weight);
            if(profiles){
                setTargetWeight(profiles.goal_weight || 0);
                setTargetSleep(profiles.target_sleep || 0);
            }else{return;}

        }catch(e){console.error(e);}
    };
    passTargets();
   },[])
  
    return(
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>CALIBRATION</Text>
                <Text style={styles.headerSubtitle}>Daily Metrics & Recovery</Text>
            </View>
            <View style={styles.tabContainer}>
                <TouchableOpacity style={[styles.tab, activeTab==='weight' && styles.activeWeightTab]} onPress={()=>setActiveTab('weight')} activeOpacity={0.7}>
                    <Text style={[styles.tabText, activeTab==='weight' && styles.activeWeightText]}>WEIGHT</Text>
                </TouchableOpacity>

                 <TouchableOpacity style={[styles.tab, activeTab==='sleep' && styles.activeSleepTab]} onPress={()=>setActiveTab('sleep')} activeOpacity={0.7}>
                    <Text style={[styles.tabText, activeTab==='sleep' && styles.activeSleepText]}>SLEEP</Text>
                </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="always">
                {activeTab==='weight'?(<WeightComponent targetWeight={targetWeight}/>):(<SleepComponent targetSleep={targetSleep}/>)}
            </ScrollView>
        </SafeAreaView>
    );
}

function createStyles(colorScheme){
    const isDark = colorScheme === 'dark';
    const weightAccent = isDark ? '#00FF66' : '#00C851'; // Neon Green
    const sleepAccent = isDark ? '#0088FF' : '#0066CC';  // Restorative Blue
    const inactiveText = isDark ? '#666666' : '#A0A0A0';
    const inactiveBorder = isDark ? '#222222' : '#E0E0E0';
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: isDark ? '#000000' : '#F5F5F5',
        },
        // Header Styles
        header: {
            paddingHorizontal: 20,
            paddingTop: 10,
            paddingBottom: 20,
        },
        headerTitle: {
            color: isDark ? '#FFFFFF' : '#121212',
            fontSize: 28,
            fontWeight: '900',
            letterSpacing: 1,
            textTransform: 'uppercase',
        },
        headerSubtitle: {
            color: isDark ? '#888888' : '#666666',
            fontSize: 14,
            fontWeight: '600',
            marginTop: 4,
        },
        // Tab Bar Styles
        tabContainer: {
            flexDirection: 'row',
            borderBottomWidth: 1,
            borderBottomColor: inactiveBorder,
            marginBottom: 10,
        },
        tab: {
            flex: 1,
            alignItems: 'center',
            paddingVertical: 16,
            borderBottomWidth: 3,
            borderBottomColor: 'transparent', // Invisible by default
        },
        tabText: {
            fontSize: 15,
            fontWeight: '800',
            letterSpacing: 1,
            color: inactiveText,
        },
        // Active Tab Dynamic Styles
        activeWeightTab: {
            borderBottomColor: weightAccent,
        },
        activeWeightText: {
            color: weightAccent,
        },
        activeSleepTab: {
            borderBottomColor: sleepAccent,
        },
        activeSleepText: {
            color: sleepAccent,
        },
        // ScrollView Container
        scrollContent: {
            paddingHorizontal: 20,
            paddingBottom: 40,
            paddingTop: 10,
        }
    })
}