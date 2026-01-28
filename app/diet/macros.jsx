import { useState } from "react";
import { Appearance, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { saveMacros } from "../../services/storage";


export default function macrosLoggingScreen(){
    const colorScheme = Appearance.getColorScheme();
    const [protein, setProtein] = useState('');
    const [carbs, setCarbs] = useState('');
    const [fats, setFats] = useState('');
    const [water, setWater] = useState('');

    const handleSave =  async () => {
        if(!protein || !carbs || !fats || !water){
            alert("Please enter all macros!");
            return;
        }
        const success = await saveMacros(protein, carbs, fats, water);
        if(success){
            setProtein('');
            setCarbs('');
            setFats('');
            setWater('');
            alert("Macros Saved!");

        }
    }
    return(
       <SafeAreaView style={{flex: 1, backgroundColor: colorScheme ==="dark"?'black':'white',}}>
        <View style={{backgroundColor:colorScheme==="dark"?'#333':'#999', height: 'auto', marginBottom: 10,}}>
            <Text style={{fontSize: 20, color: colorScheme==='dark'?'white':'black', margin: 10, padding: 10,}}>Log your Macros</Text>
        </View>
        <View style = {{display: 'flex', flexDirection: 'row', flexWrap: "wrap", justifyContent: 'space-evenly'}}>
        <View style={{height:'auto', width:'auto', backgroundColor: colorScheme==='dark'?'#222':'#999', display: 'flex', alignItems: 'center', gap: 10, margin: 10,padding: 10, borderWidth: 1, borderColor:'papayawhip', borderRadius: 10,}}>
            <Text style={{fontSize:20,color: colorScheme==='dark'?'white':'black', padding: 10, }}>Protein (gm)</Text>
            <TextInput
            style={{ width:100, color: colorScheme === "dark"?"white":"black",fontSize: 19, textAlign: 'center',padding: 10, borderWidth: 1, borderColor:'#999'}}
            placeholder="0"
            value={protein}
            onChangeText={setProtein}
            keyboardType="numeric"
            maxLength={5}
            placeholderTextColor='#999'
            />
        </View>
        <View style={{height:'auto', width:'auto', backgroundColor: colorScheme==='dark'?'#222':'#999', display: 'flex', alignItems: 'center', gap: 10, margin: 10,padding:10, borderWidth: 1, borderColor:'papayawhip', borderRadius: 10,}}>
            <Text style={{fontSize:20,color: colorScheme==='dark'?'white':'black', padding: 10, marginHorizontal: 5,}}>Carbs (gm)</Text>
            <TextInput
            style={{ width:100, color: colorScheme === "dark"?"white":"black", fontSize: 19, textAlign: 'center',padding: 10, borderWidth: 1, borderColor:'#999'}}
            placeholder="0"
            value={carbs}
            onChangeText={setCarbs}
            keyboardType="numeric"
            maxLength={5}
            placeholderTextColor='#999'
            />
        </View>
        <View style={{height:'auto', width:'auto', backgroundColor: colorScheme==='dark'?'#222':'#999', display: 'flex', alignItems: 'center', gap: 10, margin: 10,padding: 10, borderWidth: 1, borderColor:'papayawhip', borderRadius: 10,}}>
            <Text style={{fontSize:20,color: colorScheme==='dark'?'white':'black', padding: 10, marginHorizontal: 12, }}>Fats (gm)</Text>
            <TextInput
            style={{ width:100, color: colorScheme === "dark"?"white":"black", fontSize: 19, textAlign: 'center',padding: 10, borderWidth: 1, borderColor:'#999'}}
            placeholder="0"
            value={fats}
            onChangeText={setFats}
            keyboardType="numeric"
            maxLength={5}
            placeholderTextColor='#999'
            />
        </View>
        <View style={{height:'auto', width:'auto', backgroundColor: colorScheme==='dark'?'#222':'#999', display: 'flex', alignItems: 'center', gap: 10, margin: 10, padding: 10, borderWidth: 1, borderColor:'papayawhip', borderRadius: 10,}}>
            <Text style={{fontSize:20,color: colorScheme==='dark'?'white':'black', padding: 10,  marginHorizontal: 12,}}>Water (L)</Text>
            <TextInput
            style={{ width:100, color: colorScheme === "dark"?"white":"black", fontSize: 19, textAlign: 'center',padding: 10, borderWidth: 1, borderColor:'#999'}}
            placeholder="0"
            value={water}
            onChangeText={setWater}
            keyboardType="numeric"
            maxLength={4}
            placeholderTextColor='#999'
            />
        </View>

        </View>
       <TouchableOpacity style={{backgroundColor:'green', height: 'auto', width: 150, borderWidth: 1, borderColor: 'papayawhip', borderRadius: 10, alignSelf: 'center', alignItems: 'center', margin: 20,}}
        onPress={handleSave}>
        <Text style={{color: 'white', fontSize: 20, padding: 10,}}>Save Macros</Text>
        </TouchableOpacity>
       </SafeAreaView>
    )

}