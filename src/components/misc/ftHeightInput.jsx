import { useContext, useState } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import { StyleSheet, Text, TextInput, View } from "react-native";

export default function FtHeightInput ({sendFtHeight, currentFt, currentInch}){

    const {colorScheme} = useContext(ThemeContext);
    const isDark = colorScheme==='dark';
    const styles = createStyles(isDark);
    const pastFt =  String(currentFt) || '';
    const pastInch = String(currentInch)||'';
    const [ft, setFt] = useState(pastFt||'');
    const [inch, setInch] = useState(pastInch||'');

    const handleFtChange = (text)=>{
        setFt(text);
        calculateAndSend(text, inch);
    }
    const handleInchChange = (text)=>{
        setInch(text);
        calculateAndSend(ft, text);
    }

    const calculateAndSend = (ft, inch)=>{
        const f = parseInt(ft)||0;
        const i = parseInt(inch)||0;
        const totalInches = (12*f)+i;
        sendFtHeight(totalInches);

    }

    return(
        <View style={{flexDirection:'row', justifyContent:'space-evenly'}}>
            <View style={{display:'flex', flexDirection:'row', margin: 5, gap: 10,}}>
                <Text style={styles.activeChoiceText}>FT</Text>
                    <TextInput
                    style={styles.input}
                    value= {ft}
                    onChangeText={(text)=>{handleFtChange(text) }}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={isDark ? '#555' : '#AAA'}
                    maxLength={1}
                    />
                </View>
            <View style={{display:'flex', flexDirection:'row', margin: 5, gap: 10,}}>
                <Text style={styles.activeChoiceText}>IN</Text>
                    <TextInput
                    style={styles.input}
                    value= {inch}
                    onChangeText={(text)=>{handleInchChange(text)}}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={isDark ? '#555' : '#AAA'}
                    maxLength={2}
                    />
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
    const text = isDark ? '#FFF' : '#000';

    return StyleSheet.create({
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
        choiceText: { fontSize: 16, fontWeight: '600', color: '#888' },
        activeChoiceText: { color: '#FFF' },
    })
}