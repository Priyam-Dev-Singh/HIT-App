import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';
import {Text} from 'react-native';
import React from 'react';

const workoutStorageKey = '@workoutLogs';
const macrosStorageKey = '@macrosLogs';
const routineIndexKey = '@HITroutine';
const historyKey = '@workoutHistory';

export const saveSet = async (exerciseId, weight, reps)=>{
    try{
        const newId = uuid.v4();
        const newLog ={
            id: newId,
            exerciseId: exerciseId,
            date: new Date().toISOString(),
            weight: parseFloat(weight),
            reps: parseFloat(reps),
        };
        //reading current Logs
        const jsonValue = await AsyncStorage.getItem(workoutStorageKey);
        const currentLogs = jsonValue != null ? JSON.parse(jsonValue) : [];

        //updating
        const updatedLogs = [...currentLogs,newLog];
        //console.log(JSON.stringify(updatedLogs));

        //saving to storage
        await AsyncStorage.setItem(workoutStorageKey,JSON.stringify(updatedLogs));
        

        console.log("DataBase updated");
        return true;


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
    if(exerciseId.length === 0){console.log("No logs are present");
        return false;
    }
    exerciseLogs.sort((a,b)=> new Date(b.date)- new Date(a.date));
    const lastLog = exerciseLogs[0];
    const updatedLogs = allLogs.filter(log=> log.id !== lastLog.id);
    
    await AsyncStorage.setItem(workoutStorageKey, JSON.stringify(updatedLogs));

    console.log("Last log deleted with log id: ",lastLog.id);
    return true;

   }catch(e){console.error("Error deleting the last log");
            return false;
   }

};

export const saveMacros = async (protein, carbs, fats, water) => {
    try{
        const newLog = {
          date : new Date().toISOString(),
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

        console.log("Database Updated");
        return true;


    }catch(e){
        console.error("Error saving Log", e);
        return false;
    };

};

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
        const allDates = Object.keys(fullHistory).sort();
        let finalHistory = fullHistory;
        
        if(allDates.length>31){
            const recentDates = allDates.slice(-31);
            finalHistory={};
            recentDates.forEach(date=>{
                finalHistory[date] = fullHistory[date];
            });
        }
        await AsyncStorage.setItem(historyKey, JSON.stringify(finalHistory));
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
