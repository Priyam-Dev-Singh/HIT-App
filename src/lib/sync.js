import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "./supabase";

export const syncData = async()=>{

  const workoutStorageKey = '@workoutLogs';
    try{
        const {data:{user}} = await supabase.auth.getUser();
        if(!user){
            console.log("This is a New user");
            return;
        }
        const {data: cloudLogs, error} = await supabase.from('workoutLogs').select('*').eq('user_id', user.id).order('logged_at', {ascending: true});

        if(error){throw error};

        if(!cloudLogs || cloudLogs.length === 0){
            console.log("No user data available");
            return;
        }

        const localFormatLogs = cloudLogs.map(log=>({
            id: log.id,
            exerciseId : log.exercise_id,
            date: log.logged_at,
            weight: log.weight,
            reps: log.reps
        }));

        await AsyncStorage.setItem(workoutStorageKey, JSON.stringify(localFormatLogs));
        console.log(`Restored ${localFormatLogs.length} logs in the local storage`);
        return true;

    }catch(e){
        console.error("Error syncing data", e);
    }
}

export const syncMacros = async ()=>{
    const macrosStorageKey = '@macrosLogs';
    try{
        const {data:{user}} = await supabase.auth.getUser();
        if(!user){
            console.log('this is a new user');
            return;
        }
        const {data: macroLogs, error} = await supabase.from('macrosLogs').select('*').eq('user_id', user.id).order('logged_at',{ascending: true});

        if(error){throw error;}
        if(!macroLogs || macroLogs.length===0){
            console.log('No macros Data found for the user ');
            return;
        }
        const localFormatLogs = macroLogs.map(log=>({
            date: log.logged_at,
            protein: log.protein,
            carbs: log.carbs,
            fats: log.fats,
            water: log.water,
        }))

        await AsyncStorage.setItem(macrosStorageKey, JSON.stringify(localFormatLogs));
        console.log("Macros data synced successfully for the user");
        return true;

    }catch(e){
        console.error("Error syncing from database", e);
    }
};

export const syncHITRoutine = async ()=>{
    const routineIndexKey = '@HITroutine';
    
    try{
        const {data:{user}} = await supabase.auth.getUser();
        if(!user){
            console.log("user doesnt exists");
            return;
        }
        const {data, error} = await supabase.from('profiles').select('HIT_routine').eq('user_id', user.id).maybeSingle();
        if(!data){
            console.log("No routine index found");
        }
        if(error){
            console.error("Error getting the routine from supabase", error);
        }
        if(data){
            await AsyncStorage.setItem(routineIndexKey, JSON.stringify(data.HIT_routine));
            console.log("Routine retreived successfully");
        }
    }catch(e){
        console.log("Error syncing routine index");
    }
};

export const syncCalendarData = async()=>{
    const historyKey = '@workoutHistory';
    try{
        const {data:{user}} = await supabase.auth.getUser();
        if(!user)return;
        
        const {data, error} = await supabase.from('profiles').select('calendar_data').eq('user_id', user.id).maybeSingle();
        if(error && error.code !== 'PGRST116')throw error;

        if(data && data.calendar_data){
            await AsyncStorage.setItem(historyKey, JSON.stringify(data.calendar_data));
            console.log("calendar Data restored");
        }


    }catch(clouderror){console.error("Error syncing to cloud", clouderror);
        return false;
    }
}

export const syncWeightAndSleepData = async()=>{
    const weightStorageKey = '@weightData';
    const sleepStorageKey = '@sleepData';
    try{
        const {data:{user}} = await supabase.auth.getUser();
        if(!user)return;

        const {data, error} = await supabase.from('dailyMetrics').select('weight_data,sleep_data').eq('user_id', user.id).maybeSingle();
        if(error) console.error("error getting weight data from supabase");

        if(data && data.weight_data)await AsyncStorage.setItem(weightStorageKey, JSON.stringify(data.weight_data));
        if(data && data.sleep_data) await AsyncStorage.setItem(sleepStorageKey, JSON.stringify(data.sleep_data));

        console.log('sleep and weight data synced successfully');
    }catch(e){console.error("error syncing wegiht data");}
}

export const syncAllUserData = async ()=>{
    console.log('Starting data restore');
    await Promise.all([
        syncData(),
        syncMacros(),
        syncHITRoutine(),
        syncCalendarData(),
        syncWeightAndSleepData(),
    ]);
    console.log("All data restored");
    return true;
};

