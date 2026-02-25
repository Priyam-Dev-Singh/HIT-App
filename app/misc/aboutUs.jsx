import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemeContext } from '../../src/context/ThemeContext';
import { FontAwesome5 } from '@expo/vector-icons';

export default function AboutScreen() {
    const router = useRouter();
    const { colorScheme } = useContext(ThemeContext);
    const isDark = colorScheme === 'dark';
    const styles = createStyles(isDark);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>ABOUT INTENSITY</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
                    <FontAwesome5 name="times" size={24} color={isDark ? '#FFF' : '#000'} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                
                {/* --- ORIGINAL TACTICAL CARDS --- */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <FontAwesome5 name="crosshairs" size={16} color="#D32F2F" />
                        <Text style={styles.cardTitle}>THE MISSION</Text>
                    </View>
                    <Text style={styles.paragraph}>
                        INTENSITY was engineered to eradicate the noise, rumors, and "gym hippie" culture of modern fitness. We operate on one undeniable truth: High-Intensity Training (H.I.T.) is the only righteous, biologically optimal path to size and strength. We replace the irrational meathead philosophy with cold, calculated data.
                    </Text>
                </View>

                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <FontAwesome5 name="dna" size={16} color="#D32F2F" />
                        <Text style={styles.cardTitle}>THE STIMULUS PROTOCOL</Text>
                    </View>
                    <Text style={styles.paragraph}>
                        The gym is not where you grow. The gym is solely for providing the body with the maximum stimulus required to force an adaptation. Contrary to popular belief, growth happens strictly during sleep and rest. 
                    </Text>
                    <Text style={styles.paragraph}>
                        This is why INTENSITY enforces strict recovery blocks. The larger the stimulus, the larger the requirement for rest. We eliminate junk volume so you can focus entirely on maximum mechanical tension.
                    </Text>
                </View>

                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <FontAwesome5 name="chart-line" size={16} color="#D32F2F" />
                        <Text style={styles.cardTitle}>THE DATA ADVANTAGE</Text>
                    </View>
                    <Text style={styles.paragraph}>
                        Average lifters go to the gym blindly. They don't track variables, they don't understand their plateaus, and they rely on guesswork. 
                    </Text>
                    <Text style={styles.paragraph}>
                        By centralizing your metrics—tracking morning weight, sleep verification, macro fuel, and simplifying your logs to only track your true top sets—you gain absolute visibility over your physiology. When a plateau hits, you look at the matrix, identify the failed variable, correct it, and guarantee your progress.
                    </Text>
                </View>

                {/* --- NEW FOUNDER MESSAGE CARD --- */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <FontAwesome5 name="quote-left" size={16} color="#D32F2F" />
                        <Text style={styles.cardTitle}>MESSAGE FROM THE FOUNDER</Text>
                    </View>
                    
                    <Text style={styles.paragraph}>
                        The main goal for building this app was to introduce people to High-Intensity Training (H.I.T.) principles. Modern gym hippie culture is mixed with a lot of noise and rumors about what is right and what is wrong, but the only righteous way of training for true size and strength is H.I.T.
                    </Text>
                    
                    <Text style={styles.paragraph}>
                        The addition of the 2-day rest blocks was designed to make people understand the critical importance of growth and recovery. The app was built to educate people on the fact that the gym is solely for providing the body with the stimulus to grow. The bigger the stimulus, the bigger the need to recover, and doing all that without pointless junk volume.
                    </Text>
                    
                    <Text style={styles.paragraph}>
                        I have read multiple books dedicated entirely to these principles and consumed over 30 hours of dense fitness content related to exercise and training physiology to build this system.
                    </Text>

                    <Text style={styles.paragraph}>
                        The main problem this app solves is providing the user with optimal routines tailored to their goals, replacing the meathead philosophy with the mindset of a rational being who does things the right way. The irrational lifter just goes to the gym for the sake of it, doesn't track anything, and doesn't even know if they are growing. 
                    </Text>

                    <Text style={styles.paragraph}>
                        An INTENSITY user tracks all of their variables in the same place every day. This enables you to see everything at once: What are the reasons for your plateaus? Why did your weight drop? Why did your lifts decrease? When you look at the graphs, you can pinpoint exactly what variables led to that dip in growth or surge in strength. 
                    </Text>

                    <Text style={styles.paragraph}>
                        We simplify logging your sets. Instead of logging every single warm-up, you just log the top lift—the H.I.T. way. 
                    </Text>

                    <Text style={styles.highlightText}>
                        Many more features are in the making, so stay on the protocol. INTENSITY is what differentiates average lifters from focused operators. An increase in size and strength is guaranteed while using this app.
                    </Text>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.versionText}>INTENSITY CONSOLE v1.0.0</Text>
                </View>

            </ScrollView>
        </View>
    );
}

function createStyles(isDark) {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: isDark ? '#0A0A0A' : '#F5F5F5',
            paddingTop: 60,
            paddingHorizontal: 20,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
            borderBottomWidth: 1,
            borderBottomColor: isDark ? '#222' : '#E0E0E0',
            paddingBottom: 20,
        },
        title: {
            color: isDark ? '#FFF' : '#000',
            fontSize: 24,
            fontWeight: '900',
            letterSpacing: 2,
        },
        closeBtn: {
            padding: 10,
        },
        scrollContent: {
            paddingBottom: 40,
        },
        card: {
            backgroundColor: isDark ? '#141414' : '#FFFFFF',
            borderRadius: 12,
            padding: 20,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: isDark ? '#222' : '#E0E0E0',
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isDark ? 0.3 : 0.1,
            shadowRadius: 6,
            elevation: 4,
        },
        cardHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 20,
            borderBottomWidth: 1,
            borderBottomColor: isDark ? '#222' : '#F0F0F0',
            paddingBottom: 15,
        },
        cardTitle: {
            color: '#D32F2F', // Intensity Red
            fontSize: 15,
            fontWeight: '900',
            letterSpacing: 1.5,
            marginLeft: 12,
        },
        paragraph: {
            color: isDark ? '#CCC' : '#444',
            fontSize: 15,
            lineHeight: 24,
            marginBottom: 18,
            fontWeight: '500',
        },
        highlightText: {
            color: isDark ? '#FFF' : '#000',
            fontSize: 15,
            lineHeight: 24,
            fontWeight: 'bold',
            fontStyle: 'italic',
            marginTop: 10,
            borderLeftWidth: 3,
            borderLeftColor: '#D32F2F',
            paddingLeft: 12,
            paddingVertical: 6,
            backgroundColor: isDark ? 'rgba(211, 47, 47, 0.05)' : 'rgba(211, 47, 47, 0.05)',
        },
        footer: {
            alignItems: 'center',
            marginTop: 20,
            marginBottom: 40,
        },
        versionText: {
            color: isDark ? '#555' : '#AAA',
            fontSize: 12,
            fontWeight: 'bold',
            letterSpacing: 2,
        }
    });
}