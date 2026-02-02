import { useContext, useState } from "react";
import {Text, TextInput, TouchableOpacity, View, Pressable, KeyboardAvoidingView, ScrollView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { saveMacros } from "../../src/storage";
import { ThemeContext } from "../../src/context/ThemeContext";
import Octicons from '@expo/vector-icons/Octicons';
import { useRouter } from "expo-router";



export default function macrosLoggingScreen(){
    const router = useRouter();
    const {colorScheme, toggleTheme} = useContext(ThemeContext);
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
        <KeyboardAvoidingView
            style={{flex:1}}
            behavior = {Platform.OS==='ios'?'padding':'height'}
            keyboardVerticalOffset={Platform.OS==='ios'?10:0}>
            <ScrollView
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }} 
                keyboardShouldPersistTaps="handled">
                 <View style={{height: '7%', backgroundColor:colorScheme==='dark'?'grey':'#dddddd', display: 'flex', flexDirection:'row', justifyContent:"space-between", alignItems:'center', marginBottom:'15'
               }}> 
               <Pressable onPress={()=>{router.push("/")}}>
                    <Octicons name="home" size={33} color={colorScheme==='dark'?'white':'black'} selectable={undefined} style={{width: 36, marginHorizontal: 10,}}/>
                </Pressable>
                <Text style = {{color: colorScheme==='dark'?'white':'black', padding: 10, fontSize: 22,fontWeight: '600'}}>Save your Macros</Text>
                <Pressable onPress={toggleTheme}>
                       {colorScheme==='dark'?
                    <Octicons name="moon" size={36} color='white' selectable={undefined} style={{width: 36, marginHorizontal: 10,}}/>:<Octicons name="sun" size={36} color='black' selectable={undefined} style={{width: 36, marginHorizontal: 10,}}/>}
                </Pressable>
               </View>
        <View style = {{display: 'flex', flexDirection: 'row', flexWrap: "wrap", justifyContent: 'space-evenly'}}>
        <View style={{height:'auto', width:'auto', backgroundColor: colorScheme==='dark'?'#222':'#f1f1f1', display: 'flex', alignItems: 'center', gap: 10, margin: 10,padding: 10, borderWidth: 1, borderColor: colorScheme==='dark'?'papayawhip':'black', borderRadius: 10,}}>
            <Text style={{fontSize:20,color: colorScheme==='dark'?'white':'black', padding: 10, }}>Protein (gm)</Text>
            <TextInput
            style={{ width:100, color: colorScheme === "dark"?"white":"black",fontSize: 19, textAlign: 'center',padding: 10, borderWidth: 1, borderColor: colorScheme==='dark'?'papayawhip':'black'}}
            placeholder="0"
            value={protein}
            onChangeText={setProtein}
            keyboardType="numeric"
            maxLength={5}
            placeholderTextColor='#999'
            />
        </View>
        <View style={{height:'auto', width:'auto', backgroundColor: colorScheme==='dark'?'#222':'#f1f1f1', display: 'flex', alignItems: 'center', gap: 10, margin: 10,padding:10, borderWidth: 1,  borderColor: colorScheme==='dark'?'papayawhip':'black', borderRadius: 10,}}>
            <Text style={{fontSize:20,color: colorScheme==='dark'?'white':'black', padding: 10, marginHorizontal: 5,}}>Carbs (gm)</Text>
            <TextInput
            style={{ width:100, color: colorScheme === "dark"?"white":"black", fontSize: 19, textAlign: 'center',padding: 10, borderWidth: 1,  borderColor: colorScheme==='dark'?'papayawhip':'black'}}
            placeholder="0"
            value={carbs}
            onChangeText={setCarbs}
            keyboardType="numeric"
            maxLength={5}
            placeholderTextColor='#999'
            />
        </View>
        <View style={{height:'auto', width:'auto', backgroundColor: colorScheme==='dark'?'#222':'#f1f1f1', display: 'flex', alignItems: 'center', gap: 10, margin: 10,padding: 10, borderWidth: 1,  borderColor: colorScheme==='dark'?'papayawhip':'black', borderRadius: 10,}}>
            <Text style={{fontSize:20,color: colorScheme==='dark'?'white':'black', padding: 10, marginHorizontal: 12, }}>Fats (gm)</Text>
            <TextInput
            style={{ width:100, color: colorScheme === "dark"?"white":"black", fontSize: 19, textAlign: 'center',padding: 10, borderWidth: 1, borderColor: colorScheme==='dark'?'papayawhip':'black'}}
            placeholder="0"
            value={fats}
            onChangeText={setFats}
            keyboardType="numeric"
            maxLength={5}
            placeholderTextColor='#999'
            />
        </View>
        <View style={{height:'auto', width:'auto', backgroundColor: colorScheme==='dark'?'#222':'#f1f1f1', display: 'flex', alignItems: 'center', gap: 10, margin: 10, padding: 10, borderWidth: 1,  borderColor: colorScheme==='dark'?'papayawhip':'black', borderRadius: 10,}}>
            <Text style={{fontSize:20,color: colorScheme==='dark'?'white':'black', padding: 10,  marginHorizontal: 12,}}>Water (L)</Text>
            <TextInput
            style={{ width:100, color: colorScheme === "dark"?"white":"black", fontSize: 19, textAlign: 'center',padding: 10, borderWidth: 1, borderColor: colorScheme==='dark'?'papayawhip':'black'}}
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
        <Text style={{color: 'white', fontSize: 15, padding: 10,}}>Save Macros</Text>
        </TouchableOpacity>
      
            </ScrollView>
        </KeyboardAvoidingView>
       </SafeAreaView>
    )

}