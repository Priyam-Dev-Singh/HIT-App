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