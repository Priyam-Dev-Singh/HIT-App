import { useContext } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ThemeContext } from "../../context/ThemeContext";

export default function UnitSwitcher({currentUnit, onToggle, activeColor}){

    const {colorScheme} = useContext(ThemeContext);
    const isDark = colorScheme==='dark';
    const styles = createStyles(isDark, activeColor);

    return(
        <View style= {styles.container}>
        
            <View style={styles.segmentedControl}>
                <TouchableOpacity style={[styles.segment, currentUnit==='kg' && styles.activeSegment]}
                                  onPress={()=>onToggle('kg')}
                                  activeOpacity={0.8}
                >
                    <Text style={[styles.segmentText, currentUnit === 'kg' && styles.activeText]}>KG</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.segment, currentUnit==='lbs' && styles.activeSegment]}
                                  onPress={()=>onToggle('lbs')}
                                  activeOpacity={0.8}
                >
                    <Text style={[styles.segmentText, currentUnit === 'lbs' && styles.activeText]}>LBS</Text>
                </TouchableOpacity>

            </View>
        </View>
    )
}

function createStyles(isDark, activeColor){

    return StyleSheet.create({
        container: {
            margin: 10,
            width: '25%',
        },
        label: {
            color: isDark ? '#888' : '#666',
            fontSize: 10,
            fontWeight: '900',
            letterSpacing: 1.5,
            marginBottom: 4,
            marginLeft: 4,
        },
        segmentedControl: {
            flexDirection: 'row',
            backgroundColor: isDark ? '#1C1C1E' : '#E5E5EA',
            borderRadius: 10,
            padding: 4,
            borderWidth: 1,
            borderColor: isDark ? '#333' : '#D1D1D6',
        },
        segment: {
            flex: 1,
            paddingVertical: 8,
            alignItems: 'center',
            borderRadius: 8,
        },
        activeSegment: {
            backgroundColor: activeColor, // Your Hero Red
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 3,
        },
        segmentText: {
            color: isDark ? '#888' : '#999',
            fontSize: 10,
            fontWeight: 'bold',
            letterSpacing: 1,
        },
        activeText: {
            color: '#FFFFFF',
        },
    })
}