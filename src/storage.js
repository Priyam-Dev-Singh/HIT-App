import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';

const workoutStorageKey = '@workoutLogs';
const macrosStorageKey = '@macrosLogs';

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

}