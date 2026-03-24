import React, { useContext } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';

import { FontAwesome5, Feather } from '@expo/vector-icons';
import { ThemeContext } from '../../context/ThemeContext';

const { width, height } = Dimensions.get('window');

// You can update this array every time you push a new version!
const updates = [
     {
        icon: 'sliders-h',
        title: 'CUSTOM ROUTINE',
        desc: 'Users can now forge custom training splits from our 190+ exercise database. Go to Menu -> Switch Protocol'
    },
    {
        icon: 'tachometer-alt',
        title: 'EDIT PROFILE',
        desc: 'User can now edit their Profile Data based on their goals'
    },
    {
        icon: 'bolt',
        title: 'SYSTEM OPTIMIZATION',
        desc: 'Bug fixes and major interface improvements'
    }
];

export default function WhatsNewModal({ visible, onClose, version = "1.1.0" }) {
    const { colorScheme } = useContext(ThemeContext);
    const isDark = colorScheme === 'dark';
    const styles = createStyles(isDark);

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalCard}>
                    
                    {/* WATERMARK */}
                    <FontAwesome5 name="satellite-dish" size={150} color={isDark ? '#D32F2F' : '#FFCDD2'} style={styles.watermark} />

                    {/* HEADER */}
                    <View style={styles.header}>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>SYSTEM PATCH DEPLOYED</Text>
                        </View>
                        <Text style={styles.title}>VERSION {version}</Text>
                    </View>

                    {/* CONTENT LIST */}
                    <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollArea}>
                        <Text style={styles.manifesto}>
                            INTENSITY has been upgraded. What's new :
                        </Text>

                        <View style={styles.updateList}>
                            {updates.map((item, index) => (
                                <View key={index} style={styles.updateRow}>
                                    <View style={styles.iconBox}>
                                        <FontAwesome5 name={item.icon} size={16} color={isDark ? '#FFF' : '#000'} />
                                    </View>
                                    <View style={styles.textGroup}>
                                        <Text style={styles.updateTitle}>{item.title}</Text>
                                        <Text style={styles.updateDesc}>{item.desc}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </ScrollView>

                    {/* ACTION BUTTON */}
                    <TouchableOpacity 
                        style={styles.actionButton} 
                        onPress={onClose} // <-- You will run your AsyncStorage logic inside the parent component when this fires
                        activeOpacity={0.8}
                    >
                        <Text style={styles.actionButtonText}>UNDERSTOOD</Text>
                        <Feather name="check" size={18} color="#FFF" />
                    </TouchableOpacity>

                </View>
            </View>
        </Modal>
    );
}

function createStyles(isDark) {
    return StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.85)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        modalCard: {
            width: width * 0.90,
            maxHeight: height * 0.80,
            backgroundColor: isDark ? '#0A0A0C' : '#FFFFFF',
            borderRadius: 20,
            borderWidth: 1,
            borderColor: '#D32F2F',
            padding: 25,
            overflow: 'hidden',
            position: 'relative',
            // Aggressive Glow
            shadowColor: '#D32F2F',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.4,
            shadowRadius: 20,
            elevation: 15,
        },
        watermark: {
            position: 'absolute',
            top: -20,
            right: -30,
            opacity: 0.05,
            transform: [{ rotate: '15deg' }],
            zIndex: 0,
        },
        header: {
            marginBottom: 20,
            zIndex: 1,
        },
        badge: {
            alignSelf: 'flex-start',
            backgroundColor: '#D32F2F',
            paddingVertical: 4,
            paddingHorizontal: 10,
            borderRadius: 4,
            marginBottom: 8,
        },
        badgeText: {
            color: '#FFF',
            fontSize: 10,
            fontWeight: '900',
            letterSpacing: 1.5,
        },
        title: {
            color: isDark ? '#FFF' : '#000',
            fontSize: 28,
            fontWeight: '900',
            letterSpacing: 2,
        },
        scrollArea: {
            marginBottom: 20,
            zIndex: 1,
        },
        manifesto: {
            color: isDark ? '#AAA' : '#666',
            fontSize: 14,
            fontWeight: '600',
            lineHeight: 22,
            fontStyle: 'italic',
            marginBottom: 25,
        },
        updateList: {
            gap: 20,
        },
        updateRow: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: 15,
        },
        iconBox: {
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: isDark ? '#222' : '#F0F0F0',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 2,
        },
        textGroup: {
            flex: 1,
        },
        updateTitle: {
            color: isDark ? '#FFF' : '#000',
            fontSize: 13,
            fontWeight: '900',
            letterSpacing: 1,
            marginBottom: 4,
        },
        updateDesc: {
            color: isDark ? '#888' : '#666',
            fontSize: 13,
            lineHeight: 18,
        },
        actionButton: {
            backgroundColor: '#D32F2F',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 18,
            borderRadius: 12,
            gap: 10,
            zIndex: 1,
        },
        actionButtonText: {
            color: '#FFF',
            fontSize: 16,
            fontWeight: '900',
            letterSpacing: 2,
        },
    });
}