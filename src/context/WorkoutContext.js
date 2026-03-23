import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { cache, createContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { fetchLastGlobalWorkout } from '../storage';

export const WorkoutContext = createContext();

export const WorkoutProvider=({children})=>{
    const [isWorkoutActive, setIsWorkoutActive] = useState(false);
    const [routineId, setRoutineId] = useState(null);
    const [isChecking, setIsChecking] = useState(false);
    const [fromLogin, setFromLogin] = useState(false);
    const [activeProtocol, setActiveProtocol] = useState(null);
    const [isProtocolLoading, setIsProtocolLoading] = useState(true);
    const [weightUnit, setWeightUnit] = useState('kg');
    const [heightUnit, setHeightUnit] = useState('cm');

    const startWorkout = (routineId)=>{
        setIsWorkoutActive(true);
        setRoutineId(routineId);
    };

    const endWorkout = ()=>{
        setIsWorkoutActive(false);
        setRoutineId(null);
    }

    const changeWeightUnit = async(newUnit)=>{
        try{
            setWeightUnit(newUnit);
            await AsyncStorage.setItem('weightUnit', newUnit);
        }catch(e){console.error("error changing weight unit", e)}
    }

    const changeHeightUnit = async(newUnit)=>{
        try{
            setHeightUnit(newUnit);
            await AsyncStorage.setItem("heightUnit", newUnit);
            console.log("changed Unit: ", newUnit);
        }catch(e){console.error("error changing height unit", e)}
    }

    const initializeProtocol = async()=>{
            try{
                const storedUnit = await AsyncStorage.getItem('weightUnit');
                //console.log("saved weight unit is ", storedUnit);
                if(storedUnit) setWeightUnit(storedUnit);

                const storedHeightUnit = await AsyncStorage.getItem("heightUnit");
                //console.log('Saved unit in async storage: ', storedHeightUnit);
                if(storedHeightUnit) setHeightUnit(storedHeightUnit);
                const cachedProtocol = await AsyncStorage.getItem('active_protocol');
                //console.log("Workout context here this is the cached active Protocol",cachedProtocol)
                if(cachedProtocol){
                    setActiveProtocol(cachedProtocol);
                    setIsProtocolLoading(false);
                    return;
                }

                const {data:{user}} = await supabase.auth.getUser();
                if(!user){
                    setIsProtocolLoading(false);
                    return;
                }
                const {data:profile} = await supabase.from('profiles').select('active_protocol').eq('user_id', user.id).maybeSingle();

                if(profile && profile.active_protocol){
                    if(cachedProtocol != profile.active_protocol){
                    setActiveProtocol(profile.active_protocol);
                    await AsyncStorage.setItem('active_protocol', profile.active_protocol);
                }}
                else if(!cachedProtocol){
                    const lastLog = await fetchLastGlobalWorkout();
                    if(lastLog && lastLog.length>0){
                        setActiveProtocol('hit');
                        await AsyncStorage.setItem('active_protocol','hit');
                        await supabase.from('profiles').update({active_protocol:'hit'}).eq('user_id', user.id);
                    }
                }
                setIsProtocolLoading(false);

            }catch(e){console.log("error setting up protocol",e); setIsProtocolLoading(false);}
        }

    useEffect(()=>{
        initializeProtocol();
    },[])

    return (
        <WorkoutContext.Provider value={{isWorkoutActive, routineId, startWorkout, endWorkout, 
                                         isChecking, setIsChecking,fromLogin, setFromLogin, 
                                         activeProtocol, setActiveProtocol, initializeProtocol,isProtocolLoading,
                                         weightUnit, changeWeightUnit, heightUnit, changeHeightUnit
                                         }}>
            {children}
        </WorkoutContext.Provider>
    );
};