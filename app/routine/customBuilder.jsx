import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Alert, FlatList, Image, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemeContext } from "../../src/context/ThemeContext";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Feather, FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { customExercises } from "../../data/customExercises";
import { supabase } from "../../src/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { WorkoutContext } from "../../src/context/WorkoutContext";
import { ActivityIndicator } from "react-native-web";

export default function CustomRoutineBuilderScreen(){

    const router = useRouter();
    const {colorScheme} = useContext(ThemeContext);
    const {setActiveProtocol} = useContext(WorkoutContext);
    const styles = createStyles(colorScheme);
    const isDark = colorScheme === 'dark';
    const[isModalVisible, setIsModalVisible]= useState(false);
    const [activeWorkoutId, setActiveWorkoutId] = useState(null);
    const [draftExercises, setDraftExercises] = useState([]);
    const[searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFiler] = useState('All');
    const[isSaving, setIsSaving] = useState(false);
    const [exerciseListLoading, setExerciseListLoading] = useState(false);

    const CATEGORIES = ['All','Chest','Back','Legs','Triceps','Biceps','Abs','Calves','Forearms'];

    const [workouts, setWorkouts] = useState([
        {id: new Date().toISOString(), title:'Workout 1', exercises:[]}
    ]);

    useEffect(()=>{
        const loadExistingRoutine = async()=>{
           try{
             const existingRoutine = await AsyncStorage.getItem('customRoutine');
            if(existingRoutine){
                const parsedData = JSON.parse(existingRoutine);
                if(parsedData && parsedData.workouts){
                    setWorkouts(parsedData.workouts);
                }
            }
           }catch(e){console.error('error getting current routine to update');}
        }
        loadExistingRoutine();
    },[])


    const updateWorkoutTitle = (id, newTitle)=>{
        setWorkouts(workouts.map(w=> w.id===id?{...w, title: newTitle}:w));
    }

    const removeWorkoutDay = (id)=>{
        if(workouts.length===1){
            Alert.alert('RESTRICTION', 'A routine must contain atleast one workout');
            return;
        }
        setWorkouts(workouts.filter(w=>w.id !== id));
    }

    const handleEditExercises = (id)=>{
        setExerciseListLoading(true);

        const workout = workouts.find(w=>w.id===id);
        setActiveWorkoutId(id);
        setDraftExercises([...workout.exercises]);
        setActiveFiler('All');
        setSearchQuery('');
        setIsModalVisible(true);

        setExerciseListLoading(false);
        console.log("edit exercise button pressed");
    }

    const addWorkoutDay = ()=>{
        setWorkouts([...workouts,{id: new Date().toISOString(), title:`Workout ${workouts.length+1}`, exercises:[]}]);
    }

    const saveRoutine = async ()=>{
        setIsSaving(true);
        try{
            const payload = {workouts};
            console.log('Workouts are these: ', JSON.stringify(payload));
            const hasEmptyWokrouts = workouts.some(w=> w.exercises.length===0);
            if(hasEmptyWokrouts){
                Alert.alert("Add exercises to each workout before saving routine");
                return;
            }
            
            await AsyncStorage.setItem("customRoutine", JSON.stringify(payload));
            await AsyncStorage.setItem('active_protocol','custom');
            setActiveProtocol('custom');
            const {data:{user}} = await supabase.auth.getUser();
            if(!user)return;

            const {error: routineSaveError} = await supabase.from('customRoutines').upsert({user_id : user.id, routine_data : payload}, {onConflict: 'user_id'});
            if(routineSaveError) throw routineSaveError;

            const {error: activeProtocolSaveError} = await supabase.from('profiles').update({active_protocol : 'custom'}).eq('user_id', user.id);
            if(activeProtocolSaveError) throw activeProtocolSaveError;

            router.replace('/');

        }catch(e){console.log("error saving routine");}finally{setIsSaving(false)}
    }

    const toggleExercise = (exerciseId)=>{
        if(draftExercises.includes(exerciseId)){
            setDraftExercises(draftExercises.filter(id=> id!== exerciseId));
        }
        else{
            setDraftExercises([...draftExercises, exerciseId]);
        }
    }

    const confirmSelection = ()=>{
        setWorkouts(workouts.map(w=>w.id===activeWorkoutId?{...w, exercises: draftExercises}:w));
        setIsModalVisible(false);
        setActiveWorkoutId(null);
       // console.log(workouts);
    }

    const filteredExercises = useMemo(()=>{
        return customExercises.filter(ex => activeFilter==='All'|| ex.muscleGroup===activeFilter).filter(ex=>ex.name.toLowerCase().includes(searchQuery.toLowerCase()));
    },[activeFilter, searchQuery, customExercises]);

    const renderExerciseRow = useCallback(({item: exercise})=>{
        const isSelected = draftExercises.includes(exercise.id);

        return(
            <TouchableOpacity onPress={()=>toggleExercise(exercise.id)} activeOpacity={0.7} style={[styles.exerciseRow, isSelected && styles.exerciseRowSelected]} >
                <View style={styles.exerciseImagePlaceholder}>
                    <Image 
                        source={isDark ? exercise.imageD : exercise.imageL} 
                        style={{ width: '100%', height: '100%', borderRadius: 8, resizeMode: 'cover' }}
                    />
                </View>
                <View style={styles.exerciseInfo}>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <Text style={styles.exerciseTarget}>{exercise.muscleGroup}</Text>
                </View>
                <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                    {isSelected && <Feather name="check" size={16} color="#FFF" />}
                </View>
            </TouchableOpacity>
        )
    },[draftExercises, isDark, toggleExercise])
    
    return(
        <SafeAreaView style={styles.container}>
            <StatusBar style={isDark ? 'light':'dark'}/>
            <View style={styles.header}>
                <TouchableOpacity onPress={()=>router.back()}>
                    <Feather name="chevron-left" size={28} color={isDark ? '#FFF' : '#000'} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>CUSTOM ROUTINE</Text>
                <View style={{width: 28,}}/>
            </View>
        <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':'height'} keyboardVerticalOffset={Platform.OS==='ios'?10:0}>
           <ScrollView contentContainerStyle={{flexGrow: 1, paddingBottom: 50}} keyboardShouldPersistTaps='always' showsVerticalScrollIndicator={false}>
           
                 <View style={styles.warningBanner}>
                <View style={styles.warningHeader}>
                    <Feather name="info" size={18} color="#D32F2F" />
                    <Text style={styles.warningTitle}>THE INTENSITY RULE</Text>
                </View>
                <Text style={styles.warningText}>This system tracks only your absolute heaviest Top Set to failure to diagnose plateaus. Warm-ups are ignored. Build your loop accordingly.</Text>
            </View>

            <View style={styles.loopContainer}>
                {workouts.map((workout, index)=>(

                    <View key={workout.id} style={styles.workoutCard}>
                        <View style={styles.cardHeader}>
                            <View style={styles.titleContainer}>
                                <View style={styles.indexBadge}>
                                    <Text style={styles.indexText}>{index+1}</Text>
                                </View>
                                <TextInput
                                    value={workout.title}
                                    placeholder="Name this workout..."
                                    style={styles.titleInput}
                                    onChangeText={(text)=> updateWorkoutTitle(workout.id, text)}
                                    placeholderTextColor={isDark ? '#555' : '#AAA'}
                                    maxLength={25}
                                />
                            </View>
                            <TouchableOpacity style={styles.deleteBtn} onPress={()=> removeWorkoutDay(workout.id)}>
                                <Feather name="trash-2" size={18} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.cardBody}>
                            <View style={styles.exerciseData}>
                                <MaterialIcons name="fitness-center" size={18} color={isDark ? '#888' : '#666'} />
                                <Text style={styles.exerciseCount}>{(workout.exercises.length===0 || !workout.exercises)?'No movements assigned': `${workout.exercises.length} movemments assigned`}</Text>
                            </View>
                            <TouchableOpacity style={styles.editBtn} onPress={()=> handleEditExercises(workout.id)}>
                                <Text style={styles.editBtnText}>EDIT WORKOUT</Text>
                                <Feather name="plus" size={16} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                        
                            {(workout.exercises||[]).map((exId)=>{
                                const exercise = customExercises.find(e=>e.id===exId);
                                if(!exercise) return null;
                                return(
                                    <View key={exId} style={{flexDirection:'row', alignItems:'center', gap: 8,}}>
                                        <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#D32F2F' }} />
                                        <Text style={{ color: isDark ? '#CCC' : '#444', fontSize: 13, fontWeight: '500' }}>{exercise.name}</Text>
                                    </View>
                                )
                            })}
                        
                    </View>
                ))}
            </View>
          
            <TouchableOpacity style={styles.addBtn} onPress={addWorkoutDay}>
                <Feather name="plus-circle" size={20} color={isDark ? '#FFF' : '#000'} />
                <Text style={styles.addBtnText}>ADD WORKOUT TO THE ROUTINE</Text>
            </TouchableOpacity>
           
             </ScrollView>
             <TouchableOpacity style={styles.saveBtn} onPress={saveRoutine}>
              <Text style={styles.saveBtnText}>{isSaving? 'INITIALIZING...':'INITIALIZE SYSTEM'}</Text>
                <Ionicons name="shield-checkmark" size={20} color="#FFF" />
            </TouchableOpacity>
        </KeyboardAvoidingView>

            <Modal animationType='slide' transparent={true} visible={isModalVisible} onRequestClose={()=>setIsModalVisible(false)}>
                <View style={styles.modalContainer}>
                    <SafeAreaView style={styles.modalContent} >
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>THE ARSENAL</Text>
                            <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.closeBtn}>
                                <Feather name="x" size={24} color={isDark ? '#FFF' : '#000'} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.searchContainer}>
                            <Feather name="search" size={20} color={isDark ? '#888' : '#666'} />
                            <TextInput
                            style={styles.searchInput}
                            placeholder="Search exercises..."
                            value={searchQuery}
                            placeholderTextColor={isDark ? '#888' : '#666'}
                            onChangeText={setSearchQuery}
                            />
                        </View>

                        <View style={styles.filterWrapper}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                                {CATEGORIES.map(cat=>(
                                    <TouchableOpacity key={cat} style={[styles.filterChip, activeFilter===cat && styles.activeFilterChip]} onPress={()=>setActiveFiler(cat)}>
                                        <Text style={[styles.filterText, activeFilter===cat && styles.activeFilterText]}>{cat.toUpperCase()}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                       <FlatList
                        style={styles.exerciseList}
                        contentContainerStyle={{paddingBottom: 100}}
                        data={filteredExercises}
                        keyExtractor={(item)=> item.id}
                        renderItem={renderExerciseRow}

                        initialNumToRender={10}
                        maxToRenderPerBatch={10}
                        windowSize={5}
                        removeClippedSubviews={true}
                        showsVerticalScrollIndicator={false}
                       />

                        <View style={styles.floatingFooter}>
                            <TouchableOpacity style={styles.confirmBtn} onPress={confirmSelection}>
                                <Text style={styles.confirmBtnText}>LOCK IN</Text>
                                <Feather name="shield" size={18} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </View>
            </Modal>
        </SafeAreaView>
    )
}

function createStyles(colorScheme){
    const isDark = colorScheme === 'dark';
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: isDark ? '#000000' : '#F5F5F5',
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingVertical: 15,
            borderBottomWidth: 1,
            borderBottomColor: isDark ? '#222' : '#E0E0E0',
        },
        headerTitle: {
            color: isDark ? '#FFF' : '#000',
            fontSize: 18,
            fontWeight: '900',
            letterSpacing: 2,
        },
        scrollContent: {
            padding: 20,
            paddingBottom: 40,
        },
        warningBanner: {
            backgroundColor: isDark ? 'rgba(211, 47, 47, 0.1)' : 'rgba(211, 47, 47, 0.05)',
            borderWidth: 1,
            borderColor: 'rgba(211, 47, 47, 0.4)',
            borderRadius: 12,
            padding: 15,
            marginBottom: 25,
        },
        warningHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            marginBottom: 6,
        },
        warningTitle: {
            color: '#D32F2F',
            fontSize: 12,
            fontWeight: '900',
            letterSpacing: 1,
        },
        warningText: {
            color: isDark ? '#AAA' : '#666',
            fontSize: 13,
            lineHeight: 18,
        },
        loopContainer: {
            gap: 16,
            marginBottom: 20,
        },
        workoutCard: {
            backgroundColor: isDark ? '#141414' : '#FFFFFF',
            borderWidth: 1,
            borderColor: isDark ? '#333' : '#E0E0E0',
            borderRadius: 12,
            padding: 16,
        },
        cardHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
            borderBottomWidth: 1,
            borderBottomColor: isDark ? '#222' : '#F0F0F0',
            paddingBottom: 12,
        },
        titleContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            flex: 1,
        },
        indexBadge: {
            backgroundColor: '#D32F2F',
            width: 28,
            height: 28,
            borderRadius: 6,
            justifyContent: 'center',
            alignItems: 'center',
        },
        indexText: {
            color: '#FFF',
            fontSize: 14,
            fontWeight: '900',
        },
        titleInput: {
            color: isDark ? '#FFF' : '#000',
            fontSize: 18,
            fontWeight: '800',
            flex: 1,
            paddingVertical: 0,
        },
        deleteBtn: {
            padding: 5,
        },
        cardBody: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        exerciseData: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
        exerciseCount: {
            color: isDark ? '#888' : '#666',
            fontSize: 13,
            fontWeight: '600',
        },
        editBtn: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            backgroundColor: isDark ? '#2A2A2A' : '#E0E0E0',
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 6,
        },
        editBtnText: {
            color: isDark ? '#FFF' : '#000',
            fontSize: 10,
            fontWeight: 'bold',
            letterSpacing: 1,
        },
        addBtn: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            padding: 16,
            borderWidth: 1,
            borderColor: isDark ? '#444' : '#CCC',
            borderStyle: 'dashed',
            borderRadius: 12,
            marginBottom: 30,
        },
        addBtnText: {
            color: isDark ? '#FFF' : '#000',
            fontSize: 14,
            fontWeight: 'bold',
            letterSpacing: 1,
        },
        saveBtn: {
            backgroundColor: '#D32F2F',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 18,
            borderRadius: 12,
            gap: 10,
            margin: 10,
        },
        saveBtnText: {
            color: '#FFF',
            fontSize: 16,
            fontWeight: '900',
            letterSpacing: 1.5,
        },
// MODAL STYLES
        modalContainer: {
            flex: 1,
            backgroundColor: isDark ? '#000' : '#F5F5F5',
        },
        modalContent: {
            flex: 1,
        },
        modalHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingVertical: 15,
            borderBottomWidth: 1,
            borderBottomColor: isDark ? '#222' : '#E0E0E0',
        },
        modalTitle: {
            color: isDark ? '#FFF' : '#000',
            fontSize: 20,
            fontWeight: '900',
            letterSpacing: 2,
        },
        closeBtn: {
            padding: 5,
            backgroundColor: isDark ? '#222' : '#E0E0E0',
            borderRadius: 20,
        },
        searchContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isDark ? '#1A1A1A' : '#E8E8E8',
            margin: 15,
            paddingHorizontal: 15,
            borderRadius: 12,
            height: 50,
        },
        searchInput: {
            flex: 1,
            marginLeft: 10,
            color: isDark ? '#FFF' : '#000',
            fontSize: 16,
        },
        filterWrapper: {
            height: 50,
            marginBottom: 10,
        },
        filterScroll: {
            paddingHorizontal: 15,
            gap: 10,
            alignItems: 'center',
        },
        filterChip: {
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            backgroundColor: isDark ? '#222' : '#E0E0E0',
            borderWidth: 1,
            borderColor: 'transparent',
        },
        activeFilterChip: {
            backgroundColor: 'rgba(211, 47, 47, 0.15)',
            borderColor: '#D32F2F',
        },
        filterText: {
            color: isDark ? '#888' : '#666',
            fontSize: 12,
            fontWeight: 'bold',
            letterSpacing: 1,
        },
        activeFilterText: {
            color: '#D32F2F',
        },
        exerciseList: {
            flex: 1,
            paddingHorizontal: 15,
        },
        exerciseRow: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isDark ? '#141414' : '#FFF',
            padding: 15,
            borderRadius: 12,
            marginBottom: 10,
            borderWidth: 1,
            borderColor: isDark ? '#333' : '#E0E0E0',
        },
        exerciseRowSelected: {
            borderColor: '#D32F2F',
            backgroundColor: isDark ? '#1A0A0A' : '#FFF5F5',
        },
        exerciseImagePlaceholder: {
            width: 50,
            height: 50,
            borderRadius: 8,
            backgroundColor: isDark ? '#222' : '#F0F0F0',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 15,
        },
        exerciseInfo: {
            flex: 1,
        },
        exerciseName: {
            color: isDark ? '#FFF' : '#000',
            fontSize: 16,
            fontWeight: 'bold',
            marginBottom: 4,
        },
        exerciseTarget: {
            color: isDark ? '#888' : '#888',
            fontSize: 12,
            textTransform: 'uppercase',
            letterSpacing: 1,
        },
        checkbox: {
            width: 24,
            height: 24,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: isDark ? '#444' : '#CCC',
            justifyContent: 'center',
            alignItems: 'center',
        },
        checkboxSelected: {
            backgroundColor: '#D32F2F',
            borderColor: '#D32F2F',
        },
        floatingFooter: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: 20,
            backgroundColor: isDark ? 'rgba(0,0,0,0.9)' : 'rgba(245,245,245,0.9)',
            borderTopWidth: 1,
            borderTopColor: isDark ? '#333' : '#E0E0E0',
        },
        confirmBtn: {
            backgroundColor: '#D32F2F',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 18,
            borderRadius: 12,
            gap: 10,
        },
        confirmBtnText: {
            color: '#FFF',
            fontSize: 16,
            fontWeight: '900',
            letterSpacing: 1,
        },        
    })
}