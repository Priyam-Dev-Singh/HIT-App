import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';

const storageKey = '@workoutLogs';

export const saveSet = async (exerciseId, weight, reps)=>{
    try{
        const newId = uuid.v4();
        const newLog ={
            id: newId,
            exerciseId: exerciseId,
            date: new Date().toISOString(),
            weight: parseFloat(weight),
            reps: parseFloat(reps)
        };
        //reading current Logs
        const jsonValue = await AsyncStorage.getItem(storageKey);
        const currentLogs = jsonValue != null ? JSON.parse(jsonValue) : [];

        //updating
        const updatedLogs = [...currentLogs,newLog];
        //console.log(JSON.stringify(updatedLogs));

        //saving to storage
        await AsyncStorage.setItem(storageKey,JSON.stringify(updatedLogs));
        

        console.log("DataBase updated");
        return true;


    }catch(e){
        console.error("failed to log", e);
        return false;
    };
}

export const getLastLog = async (exerciseId) =>{
    try{
        const jsonValue = await AsyncStorage.getItem(storageKey);

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