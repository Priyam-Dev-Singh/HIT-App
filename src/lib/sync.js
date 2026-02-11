import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "./supabase";

export const syncData = async()=>{

  const workoutStorageKey = '@workoutLogs';
  const macrosStorageKey = '@macrosLogs';
  const routineIndexKey = '@HITroutine';
    try{
        const {data:{user}} = await supabase.auth.getUser();
        if(!user){
            console.log("New user");
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