import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';
import {Alert, Text} from 'react-native';
import React from 'react';
import { supabase } from './lib/supabase';

const workoutStorageKey = '@workoutLogs';
const macrosStorageKey = '@macrosLogs';
const routineIndexKey = '@HITroutine';
const historyKey = '@workoutHistory';
const weightStorageKey = '@weightData';
const sleepStorageKey = '@sleepData';

//workout functions starts here -----------------------------------------------------------------------------

export const saveSet = async (exerciseId, weight, reps)=>{
    try{
        const newId = uuid.v4();
        const timeStamp = new Date().toISOString();
        const newLog ={
            id: newId,
            exerciseId: exerciseId,
            date: timeStamp,
            weight: parseFloat(weight),
            reps: parseFloat(reps),
        };
        //reading current Logs
        const jsonValue = await AsyncStorage.getItem(workoutStorageKey);
        const currentLogs = jsonValue != null ? JSON.parse(jsonValue) : [];

        //updating
        const updatedLogs = [...currentLogs,newLog];
        console.log(JSON.stringify(updatedLogs));

        //saving to storage
        await AsyncStorage.setItem(workoutStorageKey,JSON.stringify(updatedLogs));
        

        console.log("Local DataBase updated");
        

        //supabase sync
        try{
            const {data:{user}} = await supabase.auth.getUser();
            if(!user){console.warn("No user logged in. Skipping cloud save");
                return;
            }

            const {error} = await supabase.from('workoutLogs').insert([
                {   
                    id: newId,
                    user_id : user.id,
                    exercise_id : exerciseId,
                    logged_at: timeStamp,
                    weight: parseFloat(weight),
                    reps : parseInt(reps),
                }
            ]);
            if(error){
                console.log("Supabase insert error", error);
            }
            else{
                console.log("Cloud sync successful");
            }

            return true;
        }catch(cloudError){console.error("Error updating cloud database", cloudError);}

    }catch(e){
        console.error("failed to log", e);
        return false;
    };
}

export const getLastLog = async (exerciseId) =>{
    try{
        const jsonValue = await AsyncStorage.getItem(workoutStorageKey);

        const allLogs = jsonValue != null ? JSON.parse(jsonValue):[];
        //getting the necessary log
        const lastLog = allLogs.filter(log => log.exerciseId === exerciseId);
        //sorting so the newest log is first
        lastLog.sort((a,b)=> new Date(b.date)-new Date(a.date));
        //if the last log exists then get the first log in the last log array
        return lastLog.length > 0 ? lastLog[0]: null;

    }catch(e){
        console.error("Error fetching last log", e);
    };
};

export const deleteLastLog = async (exerciseId) => {
   try{
    const jsonValue = await AsyncStorage.getItem(workoutStorageKey);
    const allLogs = jsonValue != null ? JSON.parse(jsonValue) : [];

    const exerciseLogs = allLogs.filter(log => log.exerciseId === exerciseId);
    if(exerciseLogs.length === 0){console.log("No logs are present");
        return false;
    }
    exerciseLogs.sort((a,b)=> new Date(b.date)- new Date(a.date));
    const lastLog = exerciseLogs[0];
    const updatedLogs = allLogs.filter(log=> log.id !== lastLog.id);
    
    await AsyncStorage.setItem(workoutStorageKey, JSON.stringify(updatedLogs));

    //deleting from the supabase cloud
    try{
        const {error} = await supabase.from('workoutLogs').delete().eq('id', lastLog.id);
        if(error){console.error("Error deleting from cloud", error);
            return false;
        }
        console.log('Last set was deleted');

    }catch(error){console.error("Error deleting workout from DB", error)}

    console.log("Last log deleted with log id: ",lastLog.id);
    return true;

   }catch(e){console.error("Error deleting the last log",e);
            return false;
   }
};

//macros functions start here -----------------------------------------------------------------------------

export const saveMacros = async (protein, carbs, fats, water) => {
    try{
        const newId = uuid.v4();
        const timeStamp = new Date().toISOString();
        const newLog = {
          id: newId,
          date : timeStamp,
          protein : parseFloat(protein),
          carbs : parseFloat(carbs),
          fats : parseFloat(fats),
          water: parseFloat(water),
        };

        //getting the current logs
        const jsonValue = await AsyncStorage.getItem(macrosStorageKey);

        const currentLogs = jsonValue != null ? JSON.parse(jsonValue):[];

        //updating the current log
        const updatedLogs = [...currentLogs, newLog];
        //saving the updated log
        await AsyncStorage.setItem(macrosStorageKey, JSON.stringify(updatedLogs));

        console.log("Local Database Updated");
        //supabase sync
        try{
            const {data:{user}} = await supabase.auth.getUser();
            if(!user){
                console.warn("User doesnt exists");
                return;
            }
            const {error} = await supabase.from('macrosLogs').insert([
                {   
                    id: newId,
                    logged_at: timeStamp,
                    protein:protein,
                    carbs: carbs,
                    fats: fats,
                    water: water,
                }
            ]);
            if(error){console.log("supabase macros cloud sync error");}
            else{console.log("Macros table updated successfully");}
    
        }catch(e){
            console.error("Error saving macros to cloud", e);
        }
        return true;
    }catch(e){
        console.error("Error saving Log", e);
        return false;
    };

};

export const deleteLastMacros = async()=>{
    try{
        const jsonValue = await AsyncStorage.getItem(macrosStorageKey);
        let allLogs = jsonValue != null ? JSON.parse(jsonValue):[];
        if(allLogs.length==0){
            console.log("no macro logs present to delete");
            return false;
        }
        allLogs.sort((a,b)=> new Date(b.date) - new Date(a.date));
        const recentLog = allLogs[0];
        allLogs.shift();
        await AsyncStorage.setItem(macrosStorageKey, JSON.stringify(allLogs));

        // supabase deletion 
        try{
            const {error} = await supabase.from('macrosLogs').delete().eq('id', recentLog.id);
            if(error){console.log("error in performing delete macros command", error);
                return false;
            }
            console.log("Last macro log deleted from cloud");
        }catch(e){console.log("Error deleting macros form cloud", e);}

        console.log("Last macros log was deleted from");

        return true;

    }catch(e){console.error("Error deleting last macros log", e);
        return false;
    }
};

// chart and calendar and helper functions start here --------------------------------------------------------

function calculate1RM(type, weight, reps ){
    const R = parseFloat(reps);
    const W = parseFloat(weight);
    if(R===1){
        return W;
    }
    if(type === 'compound'){
        if(R<=5){
            return W/(1-0.035*(R-1));
        }
        else if(R<=15){
            return W/(0.86-0.02*(R-5));
        }
        else if(R<=50){
            return W/(0.66-0.009*(R-15));
        }
    }
    else{
         if(R<=5){
            return W/(1-0.025*(R-1));
        }
        else if(R<=15){
            return W/(0.90-0.026*(R-5));
        }
        else if(R<=50){
            return W/(0.64-0.011*(R-15));
        }
    };
};
export const getProgressData = async (exerciseId, exerciseType)=>{
    try{

        const jsonValue = await AsyncStorage.getItem(workoutStorageKey);
        const allLogs = jsonValue != null ? JSON.parse(jsonValue):[];
        //console.log("Total Logs in DB:", allLogs.length);
        //console.log("Looking for ID:", exerciseId);
        let exerciseLogs = allLogs.filter(log => log.exerciseId === exerciseId);
        //console.log("Logs found for this exercise:", exerciseLogs.length);
        exerciseLogs.sort((a,b)=> new Date(a.date)-new Date(b.date));
        exerciseLogs = exerciseLogs.slice(0,10);
        const oneRepMaxes = exerciseLogs.map(log=>(
            {
            value : calculate1RM(exerciseType,log.weight,log.reps),
            label : `${new Date(log.date).getDate()}/${new Date(log.date).getMonth()+1}`
        }));

        return oneRepMaxes;

    }catch(e){console.error("error getting progress data", e);}

};

export const fetchLastGlobalWorkout = async () => {
    try{
     const jsonValue = await AsyncStorage.getItem(workoutStorageKey);
     const allLogs = jsonValue != null ? JSON.parse(jsonValue):[];
     if (allLogs.length === 0){ return null;}
     allLogs.sort((a,b)=> new Date(b.date)- new Date(a.date));
     
     return allLogs[0];
    }catch(e){console.error("error fetching last global log", e);}
};

export const getCurrentRoutine = async ()=>{
    try{
        const jsonValue = await AsyncStorage.getItem(routineIndexKey);
        const index = jsonValue != null ? JSON.parse(jsonValue):-1;
        return index;
        

        }catch(e){console.error("Error getting routine", e)}
};

export const saveNextRoutineIndex = async (newIndex)=>{
   try{
    await AsyncStorage.setItem(routineIndexKey, JSON.stringify(newIndex));
    
    insertRoutineInDB(newIndex).catch(e=> console.error(e));
       
    return true;
   }catch(e){console.error("error saving next routine index", e);
    return false;
   }
};

const getTodayString = ()=>{
    return new Date().toISOString().split('T')[0];
}

export const getWorkoutHistory = async()=>{
    try{
        const jsonValue = await AsyncStorage.getItem(historyKey);
        return jsonValue!=null?JSON.parse(jsonValue):{};

    }catch(e){console.error("error retreiving history",e);
        return {};
    }
}

export const markDayCompleted = async()=>{
    try{
        const currentHistory = await getWorkoutHistory();
        const today = getTodayString();
        const fullHistory={
            ...currentHistory,
            [today]:{
                selected:true,
                selectedColor: '#D32F2F',
                marked:true
            }
        };
       /* const allDates = Object.keys(fullHistory).sort();
        let finalHistory = fullHistory;
        
        if(allDates.length>31){
            const recentDates = allDates.slice(-31);
            finalHistory={};
            recentDates.forEach(date=>{
                finalHistory[date] = fullHistory[date];
            });
        }*/
        await AsyncStorage.setItem(historyKey, JSON.stringify(fullHistory));

        const{data:{user}} = await supabase.auth.getUser();
        if(user){
            const{error} =  await supabase.from('profiles').upsert({
                user_id : user.id,
                created_at: new Date().toISOString(),
                calendar_data: fullHistory,
            },{onConflict:'user_id'});

            if(error){console.log("Error putting calendar data in DB");}
            else{console.log("calendar data synced to DB");}
        }
        return true;
    }catch(e){console.error("error marking day completed", e);
        return false;
    }
};
const calculateTotalClaories = (protein, carbs, fats)=>{
    const P = parseFloat(protein)||0;
    const C = parseFloat(carbs) || 0;
    const F = parseFloat(fats)||0;
    return (P*4)+(C*4)+(F*9)
};

export const getWeeklyCalories = async()=>{
    try{

        const jsonValue = await AsyncStorage.getItem(macrosStorageKey);
        let allLogs = jsonValue != null? JSON.parse(jsonValue):[];
        allLogs.sort((a,b)=> new Date(a.date) - new Date(b.date));
        allLogs = allLogs.slice(-7);
        const dailyCaloricIntake = allLogs.map(log=>(
            {
                value: calculateTotalClaories(log.protein, log.carbs, log.fats),
                label: `${new Date(log.date).getDate()}/${new Date(log.date).getMonth()+1}`,
                frontColor: '#2E7D32',
                topLabelComponent:()=>(
                    <Text
                        style={{
                        color: '#00E676', // Match bar color
                        fontSize: 10,
                        fontWeight: 'bold',
                        marginBottom: 6,  // Push it up slightly
                        textAlign: 'center',
                        width: 30}}>{calculateTotalClaories(log.protein, log.carbs, log.fats)}</Text>
                )
            }
        ));
        //console.log(dailyCaloricIntake);
        return dailyCaloricIntake;
    }catch(e){console.error("Error fetching calories", e);
        return [];
    }
};

export const getWeeklyWater= async ()=>{
    try{
        const jsonValue = await AsyncStorage.getItem(macrosStorageKey);
        let allLogs = jsonValue != null ? JSON.parse(jsonValue):[];
        allLogs.sort((a,b)=>new Date(a.date) - new Date(b.date));
        allLogs.slice(-7);

        const dailyWaterIntake = allLogs.map(log => (
            {
                value: parseFloat(log.water||0),
                label: `${new Date(log.date).getDate()}/${new Date(log.date).getMonth()+1}`,
                frontColor: '#1976D2',
                topLabelComponent: ()=>(
                    <Text style={{
                        color: '#40C4FF', // Brighter Cyan for text visibility
                        fontSize: 10,
                        fontWeight: 'bold',
                        marginBottom: 6,
                        textAlign: 'center',
                        width: 30
                    }}>
                        {log.water}
                    </Text>
                )

            }
        ));
        //console.log(dailyWaterIntake);
        return dailyWaterIntake;
    }catch(e){console.error("Error fetching water", e);
        return [];}
}

export const logOut = async ()=>{
    const {error} = await supabase.auth.signOut();

    if(error){
        Alert.alert("Error signing out");
        console.log(error);
    }
    const keys = [
        '@workoutLogs',
        '@macrosLogs',      
        '@HITroutine',
        '@workoutHistory',
        '@weightData',
        '@sleepData',
        '@active_user'

    ];
    await AsyncStorage.multiRemove(keys);
    console.log("Logged out and data cleared"); 
};

export const insertRoutineInDB = async (newIndex)=>{

    try{
        const {data:{user}} = await supabase.auth.getUser();
        if(!user){
            console.log("This is a new user");
            return;
        }
        const {error} = await supabase.from('profiles').upsert({
            user_id: user.id,
            created_at: new Date().toISOString(),
            HIT_routine: newIndex,
        },{onConflict:'user_id'});

        if(error){console.log("Error inserting routine", e);}
        else{
            console.log("Hit routine inserted to the DB");
        }
    }catch(e){
        console.log("Error syncing routine to database");
    }
};

//weight logic --------------------------------------------------------------------------------------
export const saveWeight = async(weight)=>{
    const timeStamp = new Date().toISOString();
    const dateObj = new Date(timeStamp);
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0')
    try{
        const jsonValue = await AsyncStorage.getItem(weightStorageKey);
        const currentLogs = jsonValue != null ? JSON.parse(jsonValue):[];
        const newLog = {
            value: parseFloat(weight),
            label: `${day}/${month}`,
            createdAt: timeStamp 
        }
        const updatedLogs = [...currentLogs, newLog];
        await AsyncStorage.setItem(weightStorageKey, JSON.stringify(updatedLogs));
        console.log("weight data added sucessfully");

        try{
            const {data:{user}} = await supabase.auth.getUser();
            if(!user) return;
            const {error} = await supabase.from('dailyMetrics').upsert({
                user_id : user.id,
                weight_data : updatedLogs,
                updated_at : timeStamp
            });
            if(error) {console.error("error upserting weight data", error); }
           else console.log("weight_data updated successfully in supabase");

        }catch(e){console.error("error saving weight logs to DB",e);}

    }catch(e){console.error("Error saving weight logs", e);}
}

export const deleteLastWeight = async()=>{
    try{
        const jsonValue = await AsyncStorage.getItem(weightStorageKey);
        let allLogs = jsonValue != null ? JSON.parse(jsonValue):[];
        if(!allLogs || allLogs.length === 0){
            Alert.alert("Log weight first");
            return;
        }
        allLogs.pop(); 
        await AsyncStorage.setItem(weightStorageKey, JSON.stringify(allLogs));
        console.log("weight log deleted from async storage");

        try{
            const {data:{user}} = await supabase.auth.getUser();
            if(!user)return;
            const {error} = await supabase.from("dailyMetrics").upsert({
                user_id: user.id,
                weight_data: allLogs,
            });
            if(error)throw error;
            console.log("weight data updated successfully");
        }catch(e){console.error("error deleting weight from supabase", e)}
    }catch(e){console.error("error deleting last entry from wieght logs")}
}

//sleep logic ------------------------------------------------------------------------------------------

export const saveSleep = async(sleep)=>{
    const timeStamp = new Date().toISOString();
    const dateObj = new Date(timeStamp);
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0')
    try{
        const jsonValue = await AsyncStorage.getItem(sleepStorageKey);
        const currentLogs = jsonValue != null ? JSON.parse(jsonValue):[];

        const newLog = {
            value: parseFloat(sleep),
            label: `${day}/${month}`,
            createdAt: timeStamp
        }
        const updatedLogs = [...currentLogs, newLog];
        await AsyncStorage.setItem(sleepStorageKey, JSON.stringify(updatedLogs));
        console.log(" sleep data saved in async storage");
        try{
            const {data:{user}} = await supabase.auth.getUser();
            if(!user) return;
            
            const {error} = await supabase.from('dailyMetrics').upsert({
                user_id: user.id,
                sleep_data : updatedLogs,
                updated_at: timeStamp
            });
            if(error) console.log('error upserting sleep data', error);
            else {console.log("data updated in uspabase successfully");}
        }catch(e){console.error("error updating sleep data in DB")}
    }catch(e){console.error("error saving sleep in storage", e);}
}

export const deleteLastSleep = async()=>{
    try{
        const jsonValue = await AsyncStorage.getItem(sleepStorageKey);
        let allLogs = jsonValue != null ? JSON.parse(jsonValue):[];
        if(!allLogs || allLogs.length === 0){
            Alert.alert("Log sleep hours first");
            return;
        }
        allLogs.pop();
        await AsyncStorage.setItem(sleepStorageKey, JSON.stringify(allLogs));
        console.log("Last sleep log deleted successfully");

        try{
            const {data:{user}} = await supabase.auth.getUser();
            if(!user)return;
            const {error} = await supabase.from('dailyMetrics').upsert({
                user_id: user.id,
                sleep_data: allLogs,
            });
            if(error)throw error;
            console.log("Sleep data updated in DB");

        }catch(e){console.error("error deleting last sleep log from supabase", e);}
    }catch(e){console.error("error deleting last sleep");}
}