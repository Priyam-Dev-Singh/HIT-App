import AsyncStorage from "@react-native-async-storage/async-storage";
import { customExercises } from "../data/customExercises";



export const PerformanceAnalysis = async (routine, activeProtocol)=>{
   
    const isCustomUser = activeProtocol === 'custom';

   try{
    const jsonValue = await AsyncStorage.getItem('@workoutLogs');
    const storedLogs = jsonValue != null ? JSON.parse(jsonValue):[];
    let allExercises = [];
    if(isCustomUser){
        routine.forEach((w)=> {
        if(w.exercises){
            w.exercises.forEach(exId=>{
                if(!allExercises.includes(exId)){
                    allExercises.push(exId);
                }
            })
        }
    } );
    }else{
       // console.log("inside hit routine");
        routine.forEach((w)=>{
            w.exerciseIds.forEach(exId=>{
                if(!allExercises.includes(exId)){
                    allExercises.push(exId);
                }
            })
        })

    }
    //console.log(routine);
   const performanceData = allExercises.map((exId)=>analyseLast3Lifts(exId,storedLogs));
   //console.log(performanceData);
   return performanceData;

   }catch(e){console.error("Error analysing performance", e); return [];}
}

const analyseLast3Lifts = (exId, storedLogs)=>{
    
  const exData = customExercises.find(ex=>ex.id===exId);
  //console.log(exData);
  if(!exData){
    return {exId, status:'error', analysis:'Exercise missing'}
  }
  const exType = exData.type;

  const exerciseLogs = storedLogs.filter(log=>log.exerciseId===exId);
  //console.log(exerciseLogs);
  if(exerciseLogs.length<3){
   return {exId, status : 'pending', analysis:'Awaiting more data (atleast 3 logs)', name: exData.name}
  }
  const sortedLogs = exerciseLogs.sort((a,b)=>new Date(b.date)- new Date(a.date));
  const last3Logs = sortedLogs.slice(0,3);
  const oneRMforEachLog = last3Logs.map((log)=>calculate1RM( exType, log.weight, log.reps));

  const pastAvg = (oneRMforEachLog[1]+oneRMforEachLog[2])/2;
  const today1RM = oneRMforEachLog[0];

  const delta = ((today1RM - pastAvg)/pastAvg)*100;

  let analysisStatement='';
  let statusFlag='';

  if(delta >= 1){
    statusFlag = 'growth';
    analysisStatement = `Strength increase by ${delta.toFixed(1)}% compared to prev avg`
  }
  else if(delta <= -1){
    statusFlag = 'regression';
    analysisStatement = `Decrease in Strength by ${Math.abs(delta).toFixed(1)}%. Increase intensity of workouts and recovery.`;
  }
  else{
    statusFlag = 'stall';
    analysisStatement = `Performance plateaued (Growth : ${delta.toFixed(1)}). Check diet and recovery. `;
  }
 

  return {exId: exId, status : statusFlag, name: exData.name, delta: delta.toFixed(1), analysis: analysisStatement }
  
}

function calculate1RM(type, weight, reps ){
    const R = parseFloat(reps);
    const W = parseFloat(weight);
    let oneRm;
    if(R===1){
        return  W;
    }
    if(type === 'compound'){
        if(R<=5){
         oneRm = W/(1-0.035*(R-1));
        }
        else if(R<=15){
            oneRm = W/(0.86-0.02*(R-5));
        }
        else if(R<=50){
            oneRm= W/(0.66-0.009*(R-15));
        }
    }
    else{
         if(R<=5){
            oneRm = W/(1-0.025*(R-1));
        }
        else if(R<=15){
            oneRm = W/(0.90-0.026*(R-5));
        }
        else if(R<=50){
            oneRm = W/(0.64-0.011*(R-15));
        }
    };
    return  oneRm;
};

