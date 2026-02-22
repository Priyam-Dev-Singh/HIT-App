import { useEffect, useRef } from "react";
import { Animated } from "react-native";

export default function FadeInView({delay=0, duration = 600, translateYOffset=20, children, style}){
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(translateYOffset)).current;

    useEffect(()=>{
        Animated.parallel([
            Animated.timing(fadeAnim,{
                toValue: 1,
                duration: duration,
                delay: delay,
                useNativeDriver: true,
            }),
            Animated.timing(translateY,{
                toValue: 0,
                duration: duration,
                delay: delay,
                useNativeDriver: true,
            })
        ]).start();
    },[]);

    return(
        <Animated.View style={[{opacity: fadeAnim, transform:[{translateY}]}, style]}>{children}</Animated.View>
    );
}