import React, { useContext, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, LayoutAnimation, UIManager, Platform } from "react-native";

import { FontAwesome5, Feather } from '@expo/vector-icons';
import { ThemeContext } from "../../context/ThemeContext";

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width } = Dimensions.get('window');

// The Fixed HIT Routine Data for the UI Pitch
const hitSplit = [
    { id: 'workout1', title: 'CHEST & BACK', exercises: ['Chest Flyes','Incline Chest Press', 'Lat Pullover', 'Palms-Up Pulldowns', 'Deadlift'] },
    { id: 'workout2', title: 'LEGS & ABS', exercises: ['Leg Extenstions', 'Leg Press', 'Calf Raises', 'Crunches'] },
    { id: 'workout3', title: 'ARMS', exercises: ['Lateral Raises', 'Reverse Delt Fly', 'Tricep Pushdowns', 'Dips','Palms-Up Pulldowns'] },
    { id: 'workout4', title: 'LEGS & ABS', exercises: ['Leg Extenstions', 'Leg Press', 'Calf Raises', 'Crunches'] },
];

export default function IntensityDossier({ onSelect, isBottomSheet = false }) {
    const { colorScheme } = useContext(ThemeContext);
    const isDark = colorScheme === 'dark';
    const styles = createStyles(isDark, isBottomSheet);
    
    const [expandedDay, setExpandedDay] = useState(null);

    const toggleExpand = (id) => {
        // Configures a smooth spring animation for the dropdown
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedDay(expandedDay === id ? null : id);
    };

    return (
        <View style={styles.cardContainer}>
            {/* BACKGROUND WATERMARK */}
            <FontAwesome5 name="fire-alt" size={200} color={isDark ? '#D32F2F' : '#FFCDD2'} style={styles.watermark} />

            <ScrollView 
                contentContainerStyle={styles.scrollContent} 
                showsVerticalScrollIndicator={false}
                bounces={false}
            >
                {/* TOP BADGE */}
                <View style={styles.headerRow}>
                    <View style={styles.recommendedBadge}>
                        <FontAwesome5 name="crosshairs" size={12} color="#FFF" />
                        <Text style={styles.recommendedText}>PRIMARY DIRECTIVE</Text>
                    </View>
                </View>

                {/* MAIN TITLE BLOCK */}
                <View style={styles.titleBlock}>
                    <Text style={styles.protocolTitle}>THE INTENSITY</Text>
                    <Text style={styles.protocolSubtitle}>PROTOCOL</Text>
                    <Text style={styles.manifesto}>
                        One set to absolute failure. Maximum mechanical tension. Zero junk volume.
                    </Text>
                </View>
                {/* THE PROTOCOL ADVANTAGES */}
                <View style={styles.advantagesGrid}>
                    <View style={styles.advantageItem}>
                        <FontAwesome5 name="dumbbell" size={16} color="#D32F2F" />
                        <View style={styles.advantageTextWrap}>
                            <Text style={styles.advantageTitle}>HYPERTROPHY</Text>
                            <Text style={styles.advantageDesc}>100% of energy deployed only on the muscle-building reps.</Text>
                        </View>
                    </View>

                    <View style={styles.advantageItem}>
                        <FontAwesome5 name="shield-alt" size={16} color="#D32F2F" />
                        <View style={styles.advantageTextWrap}>
                            <Text style={styles.advantageTitle}>JOINT ARMOR</Text>
                            <Text style={styles.advantageDesc}>Fewer sets mean drastically less wear-and-tear on your joints.</Text>
                        </View>
                    </View>

                    <View style={styles.advantageItem}>
                        <FontAwesome5 name="chart-line" size={16} color="#D32F2F" />
                        <View style={styles.advantageTextWrap}>
                            <Text style={styles.advantageTitle}>PURE DATA</Text>
                            <Text style={styles.advantageDesc}>Low volume makes tracking progressive overload mathematically flawless.</Text>
                        </View>
                    </View>

                    <View style={styles.advantageItem}>
                        <FontAwesome5 name="clock" size={16} color="#D32F2F" />
                        <View style={styles.advantageTextWrap}>
                            <Text style={styles.advantageTitle}>TIME LETHALITY</Text>
                            <Text style={styles.advantageDesc}>In and out in 45 minutes. Maximum stimulus, zero wasted time.</Text>
                        </View>
                    </View>
                </View>

                {/* THE WORKOUT SPLIT (ACCORDIONS) */}
                <View style={styles.splitContainer}>
                    <Text style={styles.sectionHeader}>TARGET LOADOUTS</Text>
                    
                    {hitSplit.map((day) => {
                        const isExpanded = expandedDay === day.id;
                        return (
                            <View key={day.id} style={styles.accordionBox}>
                                <TouchableOpacity 
                                    style={styles.accordionHeader} 
                                    onPress={() => toggleExpand(day.id)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.dayTitle}>{day.title}</Text>
                                    <Feather name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color={isDark ? '#FFF' : '#000'} />
                                </TouchableOpacity>

                                {isExpanded && (
                                    <View style={styles.dropdownContent}>
                                        {day.exercises.map((ex, idx) => (
                                            <View key={idx} style={styles.exerciseRow}>
                                                <View style={styles.tacticalDot} />
                                                <Text style={styles.exerciseName}>{ex}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </View>

                {/* MANDATORY RECOVERY WARNING */}
                <View style={styles.recoveryWarningBox}>
                    <View style={styles.warningHeader}>
                        <FontAwesome5 name="exclamation-triangle" size={14} color="#FFA726" />
                        <Text style={styles.warningTitle}>MANDATORY RECOVERY</Text>
                    </View>
                    <Text style={styles.warningText}>
                        You MUST take 48-72 hours (2 to 3 days) of rest between sessions. Do not train muscle groups if soreness persists.
                    </Text>
                </View>

                {/* ACTION BUTTON */}
                <TouchableOpacity 
                    style={styles.actionButton} 
                    onPress={onSelect}
                    activeOpacity={0.8}
                >
                    <Text style={styles.actionButtonText}>INITIATE PROTOCOL</Text>
                    <FontAwesome5 name="chevron-right" size={16} color="#FFF" />
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
}

function createStyles(isDark, isBottomSheet) {
    return StyleSheet.create({
        cardContainer: {
            width: isBottomSheet ? '100%' : width * 0.80, 
            height: isBottomSheet ? '100%' : '100%', // Ensures it fills the carousel height
            backgroundColor: isDark ? '#0A0A0C' : '#FFFFFF',
            borderRadius: 20,
            borderWidth: 1,
            borderColor: '#D32F2F',
            marginLeft: isBottomSheet ? 0 : width * 0.02,
            overflow: 'hidden',
            position: 'relative',
            shadowColor: '#D32F2F',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.3,
            shadowRadius: 15,
            elevation: 10,
        },
        watermark: {
            position: 'absolute',
            top: -20,
            right: -40,
            opacity: 0.05,
            transform: [{ rotate: '15deg' }],
            zIndex: 0,
        },
        scrollContent: {
            padding: 25,
            paddingBottom: 40, // Breathing room at the bottom
            flexGrow: 1,
            zIndex: 1,
        },
        headerRow: {
            flexDirection: 'row',
            marginBottom: 20,
        },
        recommendedBadge: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#D32F2F',
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 6,
            gap: 8,
        },
        recommendedText: {
            color: '#FFF',
            fontSize: 10,
            fontWeight: '900',
            letterSpacing: 1.5,
        },
        titleBlock: {
            marginBottom: 25,
        },
        protocolTitle: {
            color: isDark ? '#FFF' : '#000',
            fontSize: 32,
            fontWeight: '900',
            letterSpacing: -1,
        },
        protocolSubtitle: {
            color: '#D32F2F',
            fontSize: 32,
            fontWeight: '900',
            letterSpacing: 2,
            marginTop: -5,
        },
        manifesto: {
            color: isDark ? '#AAA' : '#555',
            fontSize: 14,
            fontWeight: '600',
            lineHeight: 22,
            marginTop: 10,
            fontStyle: 'italic',
        },
        
        // --- ACCORDION STYLES ---
        splitContainer: {
            marginBottom: 25,
        },
        sectionHeader: {
            color: isDark ? '#666' : '#999',
            fontSize: 11,
            fontWeight: '900',
            letterSpacing: 2,
            marginBottom: 10,
        },
        accordionBox: {
            backgroundColor: isDark ? '#141416' : '#F5F5F5',
            borderWidth: 1,
            borderColor: isDark ? '#2A2A2C' : '#EAEAEA',
            borderRadius: 12,
            marginBottom: 10,
            overflow: 'hidden', // Keeps the inner dropdown contained
        },
        accordionHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 15,
        },
        dayTitle: {
            color: isDark ? '#FFF' : '#000',
            fontSize: 14,
            fontWeight: 'bold',
            letterSpacing: 1,
        },
        dropdownContent: {
            paddingHorizontal: 15,
            paddingBottom: 15,
            paddingTop: 5,
        },
        exerciseRow: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 6,
            gap: 10,
        },
        tacticalDot: {
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: '#D32F2F',
        },
        exerciseName: {
            color: isDark ? '#CCC' : '#555',
            fontSize: 13,
            fontWeight: '600',
        },

        // --- RECOVERY WARNING STYLES ---
        recoveryWarningBox: {
            backgroundColor: isDark ? 'rgba(255, 167, 38, 0.1)' : '#FFF3E0',
            borderLeftWidth: 4,
            borderLeftColor: '#FFA726',
            padding: 15,
            borderRadius: 8,
            marginBottom: 30,
        },
        warningHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            marginBottom: 6,
        },
        warningTitle: {
            color: '#FFA726',
            fontSize: 12,
            fontWeight: '900',
            letterSpacing: 1,
        },
        warningText: {
            color: isDark ? '#DDD' : '#666',
            fontSize: 12,
            lineHeight: 18,
            fontWeight: '500',
        },

        // --- BUTTON STYLES ---
        actionButton: {
            backgroundColor: '#D32F2F',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 18,
            borderRadius: 12,
            gap: 10,
            marginTop: 'auto', // Pushes button to the bottom if there's extra space
        },
        actionButtonText: {
            color: '#FFF',
            fontSize: 16,
            fontWeight: '900',
            letterSpacing: 2,
        },
        // --- ADVANTAGES GRID STYLES ---
        advantagesGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            marginTop: 20,
            marginBottom: 25,
            paddingTop: 20,
            borderTopWidth: 1,
            borderTopColor: isDark ? '#222' : '#EAEAEA',
        },
        advantageItem: {
            width: '47%', // Creates a perfect 2x2 grid
            flexDirection: 'column',
            alignItems: 'flex-start',
            marginBottom: 20,
            gap: 8,
        },
        advantageTextWrap: {
            flex: 1,
        },
        advantageTitle: {
            color: isDark ? '#FFF' : '#000',
            fontSize: 11,
            fontWeight: '900',
            letterSpacing: 1,
            marginBottom: 4,
        },
        advantageDesc: {
            color: isDark ? '#888' : '#666',
            fontSize: 11,
            lineHeight: 16,
        },
    });
}