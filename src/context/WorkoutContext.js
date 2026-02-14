import React, { createContext, useState } from 'react';

export const WorkoutContext = createContext();

export const WorkoutProvider=({children})=>{
    const [isWorkoutActive, setIsWorkoutActive] = useState(false);
    const [routineId, setRoutineId] = useState(null);
    const [isChecking, setIsChecking] = useState(false);
    const [fromLogin, setFromLogin] = useState(false);

    const startWorkout = (routineId)=>{
        setIsWorkoutActive(true);
        setRoutineId(routineId);
    };

    const endWorkout = ()=>{
        setIsWorkoutActive(false);
        setRoutineId(null);
    }

    return (
        <WorkoutContext.Provider value={{isWorkoutActive, routineId, startWorkout, endWorkout, isChecking, setIsChecking, fromLogin, setFromLogin}}>
            {children}
        </WorkoutContext.Provider>
    );
};