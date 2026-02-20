import { FlatList, Pressable, View, Text, StyleSheet, Appearance, Image } from "react-native";
import {SafeAreaView} from 'react-native-safe-area-context'
import { exercises } from "../../data/exercises";
import { routines } from "../../data/routines";
import { useRouter } from "expo-router";
import { useContext } from "react";
import { ThemeContext } from "../../src/context/ThemeContext";
import Octicons from '@expo/vector-icons/Octicons';
import { WorkoutContext } from "../../src/context/WorkoutContext";

export default function WorkoutSelectionScreen (){

    const router = useRouter();
    const {colorScheme, toggleTheme} = useContext(ThemeContext);
    const {setIsChecking} = useContext(WorkoutContext);
    const styles = createStyles(colorScheme);
    const selectWorkout = (id)=>{
        console.log(id);
        router.push(`/workout/${id}`);
    }
    const renderItem = ({item, index})=>(
        <Pressable onPress={()=>{selectWorkout(item.id); setIsChecking(true);}}
        style={({pressed})=>[styles.card, pressed && {opacity: 0.7}]}>
            <View style={styles.thumbnailContainer}>
                {item.image?
                    <Image source={item.image} style={styles.thumbnail} resizeMode='cover'/>
                    : 
                     <View style={styles.numberBox}>
                        <Text style={styles.numberText}>I</Text>
                    </View>
                        }
            </View>
            <View style = {styles.textContainer}>
                <Text style={styles.workoutSubtext}>Routine {item.id} :</Text>
                <Text style={styles.workoutText}>{item.name}</Text>   
            </View>
            <Octicons 
                name="chevron-right" 
                size={24} 
                color={colorScheme === 'dark' ? '#555' : '#CCC'} 
            />
        </Pressable>
    )
   
    return(
       <SafeAreaView style={styles.container}>
        <View style={styles.header}> 
            <Pressable onPress={()=>{router.push("/")}}>
                <Octicons name="home" size={33} color={colorScheme==='dark'?'white':'black'} selectable={undefined} style={{width: 36, marginHorizontal: 10,}}/>
            </Pressable>
            <Text style = {styles.headerText}>Select a Workout</Text>
            <Pressable onPress={toggleTheme}>
                {colorScheme==='dark'?
                <Octicons name="moon" size={36} color='white' selectable={undefined} style={{width: 36, marginHorizontal: 10,}}/>:<Octicons name="sun" size={36} color='black' selectable={undefined} style={{width: 36, marginHorizontal: 10,}}/>}
            </Pressable>
        </View>
        <FlatList
        data = {routines}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        style={styles.list}
        
        />
       </SafeAreaView>
    )
}

function createStyles(colorScheme){
    return StyleSheet.create({
    container:{
        flex: 1,
        backgroundColor: colorScheme === 'dark' ? '#000000' : '#F2F2F7',
    },
    header:{
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        backgroundColor: colorScheme === 'dark' ? '#111111' : '#FFFFFF',
        flexDirection: 'row',
        justifyContent: "space-between",
        alignItems: 'center',
        borderBottomColor: colorScheme === 'dark' ? '#333' : '#E5E5EA',
    },
    list:{
        flex: 1,
        marginTop: 10,
    },
    textContainer:{
        flex: 1,
        marginLeft: 15,
    },
    id:{
        fontWeight: '400',
        margin: 10,
    },
    workoutText:{
        color: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
            fontSize: 17,
            fontWeight: '600',
            marginBottom: 2,
        },
    workoutSubtext: {
            color: colorScheme === 'dark' ? '#888' : '#666',
            fontSize: 12,
            textTransform: 'uppercase',
            letterSpacing: 1,
        },
    headerText:{
        color: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
        fontSize: 20,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    numberBox: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: colorScheme === 'dark' ? '#330000' : '#FFEBEE',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colorScheme === 'dark' ? '#D32F2F' : 'transparent',
        },
    numberText: {
        color: '#D32F2F', // Hero Red
        fontSize: 18,
        fontWeight: 'bold',
    },
    card: {
            backgroundColor: colorScheme === 'dark' ? '#1C1C1E' : '#FFFFFF',
            borderRadius: 16,
            marginHorizontal: 16,
            marginTop: 12,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            
            // Shadows
            boxShadow: '0px 2px 5px rgba(0,0,0,0.1)',
            elevation: 3,
        },
        thumbnailContainer: {
        width: 130,     
        height: 100,
        borderRadius: 12,
        marginRight: 15, 
        backgroundColor: colorScheme === 'dark' ? '#333' : '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden', 
        borderWidth: 1,
        borderColor: colorScheme === 'dark' ? '#444' : '#E0E0E0',
    },
    thumbnail: {
        width: '100%',
        height: '100%',
    },
    
})}