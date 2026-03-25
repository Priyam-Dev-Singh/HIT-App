import { useContext, useEffect, useState } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { LayoutAnimation, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, UIManager, View } from "react-native";
import { FontAwesome5, Feather } from '@expo/vector-icons';
import { PerformanceAnalysis } from "../performanceAnalysis";

if(Platform.OS==='android' && UIManager.setLayoutAnimationEnabledExperimental){
    UIManager.setLayoutAnimationEnabledExperimental(true);
}
export default function PerformanceLog({routine, activeProtocol}){

    const {colorScheme} = useContext(ThemeContext);
    const isDark = colorScheme === 'dark';
    const styles=  createStyles(isDark);

    const [analysisData, setAnalysisData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandId, setExpandId] = useState(false);

    useEffect(()=>{
        const fetchData = async()=>{
            setIsLoading(true);
            try{
                const data = await PerformanceAnalysis(routine, activeProtocol);
                setAnalysisData(data);
            }catch(e){console.error("Failed to load performance ui", e);}finally{setIsLoading(false)}
        }
        if(routine && routine.length>0){
            fetchData();
        }
        else{
            setIsLoading(false);
        }
    },[routine, activeProtocol]);

    const onToggleExpand =(id)=>{
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandId(expandId===id?null:id);
    }

    const getStatusStyles = (status)=>{
        switch(status){
            case 'growth': return{color: '#00E676', icon: 'trending-up', bg: 'rgba(0, 230, 118, 0.1)'};
            case 'stall' : return{color: '#FFA726', icon: 'minus', bg: 'rgba(255, 167, 38, 0.1)'};
            case 'regression': return{color: '#D32F2F', icon: 'trending-down', bg: 'rgba(211, 47, 47, 0.1)'};
            case 'pending': return{color: '#888888', icon: 'clock', bg: 'rgba(136, 136, 136, 0.1)'};
            default: return{color: '#555', icon: 'alert-circle', bg: 'transparent'}
        }
    }

    return(
        <ScrollView stlye={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.headerBox}>
                <View style={styles.headerTitleRow}>
                    <FontAwesome5 name="satellite-dish" size={18} color={isDark ? '#FFF' : '#000'} />
                    <Text style={styles.headerTitle}>PERFORMANCE ANALYSIS</Text>
                </View>
                <Text style={styles.subtitle}>Analysis of Estimated 1RM across last 3 logs.</Text>
            </View>
            {analysisData.length === 0?(
                <View>
                    <Feather name="database" size={40} color={isDark ? '#333' : '#CCC'} />
                    <Text style={styles.emptyText}>No routine data detected for analysis.</Text>
                </View>
            ):(
                <View style={styles.cardContainer}>
                    {analysisData.map((ex)=>{
                        const isExpanded = expandId === ex.exId;
                        const config = getStatusStyles(ex.status);
                        const isPending = ex.status === 'pending';
                        return(
                            <View key={ex.exId} style={styles.rowWrapper}>
                                <TouchableOpacity style={styles.exerciseRow} activeOpacity={0.7} onPress={()=> onToggleExpand(ex.exId)}>
                                    <View style={styles.nameGroup}>
                                        <Text style={styles.exerciseName}>{ex.name || 'UNKNOWN EXERCISE'}</Text>
                                        <Feather name={ isExpanded ? "chevron-up" : "chevron-down"} size={14} color={isDark ? '#555' : '#AAA'} />
                                    </View>
                                    <View style={[styles.badge,{backgroundColor: config.bg}]}>
                                        <Feather name={config.icon} size={14} color={config.color} />
                                        <Text style={[styles.badgeText, {color: config.color}]}>{isPending?'N/A':`${ex.delta > 0?'+':''} ${ex.delta}%`}</Text>
                                    </View>
                                </TouchableOpacity>

                                {isExpanded && (
                                    <View style={styles.expandedBox}>
                                        <View style={[styles.indicatorLine,{backgroundColor: config.bg}]} />
                                        <Text style={styles.analysisText}>{ex.analysis}</Text>
                                    </View>
                                )}
                            </View>
                        )
                    })}
                </View>
            )}
            <View style={{height:60}}/>

        </ScrollView>
    )
}
function createStyles(isDark){

    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: isDark ? '#0A0A0C' : '#F5F5F5',
            paddingHorizontal: 20,
        },
        centerAll: {
            justifyContent: 'center',
            alignItems: 'center',
        },
        loadingText: {
            color: isDark ? '#888' : '#666',
            marginTop: 15,
            fontSize: 12,
            fontWeight: '900',
            letterSpacing: 2,
        },
        headerBox: {
            marginBottom: 25,
            paddingTop: 10,
            paddingHorizontal: 10,
        },
        headerTitleRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            marginBottom: 6,
        },
        headerTitle: {
            color: isDark ? '#FFF' : '#000',
            fontSize: 18,
            fontWeight: '900',
            letterSpacing: 1.5,
        },
        subtitle: {
            color: isDark ? '#888' : '#666',
            fontSize: 12,
        },
        emptyState: {
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 60,
            gap: 15,
        },
        emptyText: {
            color: isDark ? '#555' : '#999',
            fontSize: 14,
            fontWeight: '600',
        },
        cardContainer: {
            backgroundColor: isDark ? '#141416' : '#FFFFFF',
            borderRadius: 16,
            borderWidth: 1,
            borderColor: isDark ? '#2A2A2C' : '#EAEAEA',
            overflow: 'hidden',
            
        },
        rowWrapper: {
            borderBottomWidth: 1,
            borderBottomColor: isDark ? '#222' : '#F0F0F0',
        },
        exerciseRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 18,
            paddingHorizontal: 16,
        },
        nameGroup: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            flex: 1,
        },
        exerciseName: {
            color: isDark ? '#FFF' : '#000',
            fontSize: 14,
            fontWeight: '700',
        },
        badge: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 5,
            paddingHorizontal: 10,
            borderRadius: 6,
            gap: 6,
            minWidth: 70,
            justifyContent: 'center',
        },
        badgeText: {
            fontSize: 13,
            fontWeight: '900',
        },
        expandedBox: {
            backgroundColor: isDark ? '#0A0A0C' : '#FAFAFA',
            padding: 16,
            paddingLeft: 20,
            flexDirection: 'row',
            alignItems: 'center',
        },
        indicatorLine: {
            width: 3,
            height: '100%',
            borderRadius: 2,
            marginRight: 12,
        },
        analysisText: {
            color: isDark ? '#AAA' : '#555',
            fontSize: 13,
            lineHeight: 20,
            flex: 1,
            fontStyle: 'italic',
        }
    })
}