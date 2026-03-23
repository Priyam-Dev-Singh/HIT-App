import React, { useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from "react-native";

import { FontAwesome5, Feather } from '@expo/vector-icons';
import { ThemeContext } from "../../context/ThemeContext";

const { width } = Dimensions.get('window');

export default function CustomDossier({ onSelect, isBottomSheet = false }) {
    const { colorScheme } = useContext(ThemeContext);
    const isDark = colorScheme === 'dark';
    const styles = createStyles(isDark, isBottomSheet);

    return (
        <View style={styles.cardContainer}>
            {/* BACKGROUND WATERMARK (STEALTH) */}
            <FontAwesome5 name="sliders-h" size={200} color={isDark ? '#222' : '#EAEAEA'} style={styles.watermark} />

            <ScrollView 
                contentContainerStyle={styles.scrollContent} 
                showsVerticalScrollIndicator={false}
                bounces={false}
            >
                
                <View style={styles.headerRow}>
                    <View style={styles.overrideBadge}>
                        <FontAwesome5 name="unlock-alt" size={12} color={isDark ? '#000' : '#FFF'} />
                        <Text style={styles.overrideText}>MANUAL OVERRIDE</Text>
                    </View>
                </View>

                {/* MAIN TITLE BLOCK */}
                <View style={styles.titleBlock}>
                    <Text style={styles.protocolTitle}>THE CUSTOM</Text>
                    <Text style={styles.protocolSubtitle}>PROTOCOL</Text>
                    <Text style={styles.manifesto}>
                        Total operational control. Forge your own split using our calibrated 190+ movement database.
                    </Text>
                </View>

                {/* TACTICAL INTEL (STATIC LIST) */}
                <View style={styles.intelContainer}>
                    <View style={styles.intelRow}>
                        <View style={styles.iconBox}>
                            <Feather name="database" size={18} color={isDark ? '#FFF' : '#000'} />
                        </View>
                        <View style={styles.intelTextGroup}>
                            <Text style={styles.intelTitle}>THE FULL ARSENAL</Text>
                            <Text style={styles.intelDesc}>Unrestricted access to every movement. Filter by muscle group and build your perfect loadout.</Text>
                        </View>
                    </View>

                    <View style={styles.intelRow}>
                        <View style={styles.iconBox}>
                            <Feather name="git-branch" size={18} color={isDark ? '#FFF' : '#000'} />
                        </View>
                        <View style={styles.intelTextGroup}>
                            <Text style={styles.intelTitle}>UNRESTRICTED SPLITS</Text>
                            <Text style={styles.intelDesc}>Bro split, PPL, or Upper/Lower. The volume, frequency, and scheduling are entirely in your hands.</Text>
                        </View>
                    </View>

                    <View style={styles.intelRow}>
                        <View style={styles.iconBox}>
                            <Feather name="activity" size={18} color={isDark ? '#FFF' : '#000'} />
                        </View>
                        <View style={styles.intelTextGroup}>
                            <Text style={styles.intelTitle}>ADVANCED TELEMETRY</Text>
                            <Text style={styles.intelDesc}>Seamlessly track progressive overload, PRs, and total volume across your custom configurations.</Text>
                        </View>
                    </View>
                </View>

                {/* ACTION BUTTON */}
                <TouchableOpacity 
                    style={styles.actionButton} 
                    onPress={onSelect}
                    activeOpacity={0.8}
                >
                    <Text style={styles.actionButtonText}>{isBottomSheet?'SWITCH TO CUSTOM':'BUILD LOADOUT'}</Text>
                    <FontAwesome5 name="tools" size={14} color={isDark ? '#000' : '#FFF'} />
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
}

function createStyles(isDark, isBottomSheet) {
    return StyleSheet.create({
        cardContainer: {
            width: isBottomSheet ? '100%' : width * 0.80, 
            height: isBottomSheet ? '100%' : '100%', 
            backgroundColor: isDark ? '#111111' : '#F9F9F9', // Slightly lighter/different than the pitch-black Intensity card
            borderRadius: 20,
            borderWidth: 1,
            borderColor: isDark ? '#333' : '#D1D1D6', // Stealth border, no glowing red
            marginHorizontal: isBottomSheet ? 0 : width * 0.02,
            overflow: 'hidden',
            position: 'relative',
            // A subtle, tight shadow instead of a glowing one
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 5,
            elevation: 5,
        },
        watermark: {
            position: 'absolute',
            top: 20,
            right: -30,
            opacity: 0.08,
            transform: [{ rotate: '-10deg' }],
            zIndex: 0,
        },
        scrollContent: {
            padding: 25,
            paddingBottom: 40, 
            flexGrow: 1,
            zIndex: 1,
        },
        headerRow: {
            flexDirection: 'row',
            marginBottom: 20,
        },
        overrideBadge: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isDark ? '#E0E0E0' : '#111', // Inverted contrast for the veteran badge
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 6,
            gap: 8,
        },
        overrideText: {
            color: isDark ? '#000' : '#FFF',
            fontSize: 10,
            fontWeight: '900',
            letterSpacing: 1.5,
        },
        titleBlock: {
            marginBottom: 35,
        },
        protocolTitle: {
            color: isDark ? '#AAA' : '#555', // Muted top text
            fontSize: 32,
            fontWeight: '900',
            letterSpacing: -1,
        },
        protocolSubtitle: {
            color: isDark ? '#FFF' : '#000', // Crisp, high-contrast bottom text
            fontSize: 32,
            fontWeight: '900',
            letterSpacing: 2,
            marginTop: -5,
        },
        manifesto: {
            color: isDark ? '#888' : '#666',
            fontSize: 14,
            fontWeight: '600',
            lineHeight: 22,
            marginTop: 10,
            fontStyle: 'italic',
        },
        
        // --- TACTICAL INTEL STYLES ---
        intelContainer: {
            gap: 25,
            marginBottom: 30,
        },
        intelRow: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: 15,
        },
        iconBox: {
            width: 32,
            height: 32,
            borderRadius: 8,
            backgroundColor: isDark ? '#222' : '#EAEAEA', // Gives the icons a dedicated mounting plate
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 2,
        },
        intelTextGroup: {
            flex: 1,
        },
        intelTitle: {
            color: isDark ? '#FFF' : '#000',
            fontSize: 12,
            fontWeight: '900',
            letterSpacing: 1,
            marginBottom: 4,
        },
        intelDesc: {
            color: isDark ? '#888' : '#666',
            fontSize: 13,
            lineHeight: 18,
        },

        // --- BUTTON STYLES ---
        actionButton: {
            backgroundColor: isDark ? '#FFF' : '#111', // High contrast, stark button
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 18,
            borderRadius: 12,
            gap: 10,
            marginTop: 'auto', 
        },
        actionButtonText: {
            color: isDark ? '#000' : '#FFF',
            fontSize: 16,
            fontWeight: '900',
            letterSpacing: 2,
        },
    });
}