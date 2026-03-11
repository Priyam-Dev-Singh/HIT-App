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

    const startWorkout = (routineId)=>{
        setIsWorkoutActive(true);
        setRoutineId(routineId);
    };

    const endWorkout = ()=>{
        setIsWorkoutActive(false);
        setRoutineId(null);
    }

    useEffect(()=>{
        const initializeProtocol = async()=>{
            try{
                const cachedProtocol = await AsyncStorage.getItem('active_protocol');
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
        initializeProtocol();
    },[])

    return (
        <WorkoutContext.Provider value={{isWorkoutActive, routineId, startWorkout, endWorkout, isChecking, setIsChecking, fromLogin, setFromLogin, activeProtocol, setActiveProtocol, isProtocolLoading}}>
            {children}
        </WorkoutContext.Provider>
    );
};