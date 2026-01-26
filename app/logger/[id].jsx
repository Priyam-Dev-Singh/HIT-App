import { useLocalSearchParams } from "expo-router";
import { Appearance, StyleSheet, Text, View } from "react-native";
import { exercises } from "../../data/exercises";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoggingScreen(){
    const {id} = useLocalSearchParams();
    const currentExercise = exercises.find(item=>item.id === id);
    const colorScheme = Appearance.getColorScheme();
    const styles = createStyles(colorScheme);
    return(
       <SafeAreaView>
        <View></View>
        <View style={styles.name}>
            <Text>{currentExercise.name}</Text>
        </View>
        <View style={styles.muscleGroup}>
            <Text>{currentExercise.muscleGroup}</Text>
        </View>
        <View style={styles.description}>
            <Text>{currentExercise.description}</Text>
        </View>
       </SafeAreaView>
    );
}

function createStyles (colorScheme){
    return StyleSheet.create({

    })
}