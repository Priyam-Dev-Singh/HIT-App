import { useContext, useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { ThemeContext } from "../../context/ThemeContext";
import { FontAwesome5 } from '@expo/vector-icons';
import { customExercises } from "../../../data/customExercises";

export default function CustomMissionExerciseList ({exerciseIds}){

    const {colorScheme} = useContext(ThemeContext);
    const isDark = colorScheme==='dark';
    const styles=  createStyles(isDark);

    if(!exerciseIds || exerciseIds.length===0){
        return null;
    }

   const userExercises = 
    useMemo(()=>{
        return exerciseIds.map((id)=> customExercises.find(ex=>ex.id===id));
    },[exerciseIds]);


    return(

        <View style={styles.container}>
            <View style={styles.headerRow}>
                <FontAwesome5 name="crosshairs" size={14} color="#D32F2F" />
                <Text style={styles.headerText}>TARGET LOADOUT</Text>
            </View>
            <ScrollView style={styles.listContainer} contentContainerStyle={{flexGrow:1,paddingBottom: 20,}}>
                {userExercises.map((exercise,index)=>{
                   return(
                    <View key={index} style={styles.exerciseRow}>
                        <View style={styles.tacticalDotOuter}>
                            <View style={styles.tacticalDotInner}/>
                        </View>
                        <Text style={styles.exerciseName} numberOfLines={1}>{exercise?.name}</Text>
                    </View>
                   )
})}
            </ScrollView>
        </View>
    )
}

function createStyles(isDark){

    return StyleSheet.create({
        container: {
            width: '92%',
            maxHeight: 200,
            alignSelf: 'center',
            marginTop: 5,
            marginBottom: 20, // Gives breathing room at the bottom of the scroll
        },
        headerRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 10,
            paddingHorizontal: 5,
        },
        headerText: {
            color: isDark ? '#888' : '#666',
            fontSize: 10,
            fontWeight: '900',
            letterSpacing: 2,
            marginLeft: 8,
        },
        listContainer: {
            borderRadius: 16,
            padding: 10,
            borderWidth: 1,
            borderColor: isDark ? '#2A2A2C' : '#EAEAEA',
        },
        exerciseRow: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: isDark ? '#2A2A2C' : '#EAEAEA',
        },
        tacticalDotOuter: {
            width: 14,
            height: 14,
            borderRadius: 7,
            backgroundColor: isDark ? 'rgba(211, 47, 47, 0.25)' : 'rgba(211, 47, 47, 0.15)', // Translucent Halo
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 15,
            marginLeft: 5, // Slight indent to align nicely
        },
        tacticalDotInner: {
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: '#D32F2F', // Solid Hero Red Core
            
            // Subtle Glow Effect
            shadowColor: '#D32F2F',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 4,
            elevation: 3,
        },
        exerciseName: {
            color: isDark ? '#E0E0E0' : '#222',
            fontSize: 12,
            fontWeight: '600',
            flex: 1,
        },
    })
}