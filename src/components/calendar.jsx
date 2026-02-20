import { useContext, useEffect, useState } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { View } from "react-native";
import { Calendar } from "react-native-calendars";
import { getWorkoutHistory } from "../storage";

export default function DataCalendar(){

    const {colorScheme} = useContext(ThemeContext);
    const [markedDates, setMarkedDates] = useState({});
    useEffect(()=>{
       const loadCalendar = async()=>{
         const history = await getWorkoutHistory();
        setMarkedDates(history);
       }
       loadCalendar();
    },[])
    return(
        <View style={{width:'100%', borderRadius:15, overflow:'hidden'}}>
              <Calendar
              markedDates={markedDates}
              key={colorScheme}
              theme={{
                backgroundColor: colorScheme === 'dark' ? '#1A1A1A' : '#f2f2f2',
                calendarBackground: colorScheme === 'dark' ? '#1A1A1A' : '#f2f2f2',
                textSectionTitleColor: '#b6c1cd',
                selectedDayBackgroundColor: '#D32F2F', // Red Circle
                selectedDayTextColor: '#ffffff',
                todayTextColor: '#D32F2F',
                dayTextColor: colorScheme === 'dark' ? '#ffffff' : '#2d4150',
                textDisabledColor: '#d9e1e8',
                monthTextColor: colorScheme === 'dark' ? '#ffffff' : 'black',
                arrowColor: '#D32F2F',
                textDayFontWeight: '300',
                textMonthFontWeight: 'bold',
                textDayHeaderFontWeight: '300',
                textDayFontSize: 16,
                textMonthFontSize: 16,
                textDayHeaderFontSize: 14
              }}/>
            </View>
    );
}