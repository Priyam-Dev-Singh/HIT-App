import { useContext, useEffect, useState } from "react";
import { Alert, Image, Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ThemeContext } from "../../src/context/ThemeContext";
import { supabase } from "../../src/lib/supabase";
import {Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from "expo-router";

export default function MenuScreen(){
    const router = useRouter();
    const {colorScheme, toggleTheme} = useContext(ThemeContext);
    let isDark = colorScheme==='dark';
    const styles = createStyles(isDark);
    const [avatar, setAvatar] = useState(null);

    const privacyPolicy = "https://intensity-privacy-policy.vercel.app";
    const deleteForm = 'https://forms.gle/PPjdkMiv1xdamQh48';

    useEffect(()=>{
        const getUser = async()=>{
            const {data:{user}} = await supabase.auth.getUser();
            if(!user)return;
            if(user.user_metadata?.avatar_url){
                setAvatar(user.user_metadata.avatar_url);
            }
        };
        getUser();
    },[]);

    const handleDelete = async()=>{
        Alert.alert("DANGER ZONE", "This will permanently delete your account, physical logs, and protocol streaks. This cannot be undone.",
            [
                {text:'cancel', style:'cancel'},
                {text:'DELETE DATA', style:'destructive', onPress:()=>{
                    console.log("Delete account button pressed");
                    Linking.openURL(deleteForm);
                }}
            ]
        )
    }

    const MenuItem = ({icon, label, onPress, isDanger})=>(
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <View style={styles.menuIconWrapper}>
                <FontAwesome5 name={icon} size={20} color={!isDanger?'#D32F2F':'#EF6C00'} />
            </View>
            <Text style={[styles.menuText, isDanger && styles.dangerText]}>{label}</Text>
            <FontAwesome5 name="chevron-right" size={16} color={isDark ? '#444' : '#CCC'} />
        </TouchableOpacity>
    )

    return(
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>COMMAND CENTER</Text>
                <TouchableOpacity style={styles.closeBtn} onPress={()=>router.back()}>
                    <FontAwesome5 name="times" size={24} color={isDark ? '#FFF' : '#000'} />
                </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.profileCard} onPress={()=>router.push('/profile')}>
                <View style={styles.profileImageContainer}>
                    {avatar ? 
                    (<Image source={{uri: avatar}} style={styles.profileImage}/>):
                    (<FontAwesome5 name="user-astronaut" size={24} color={isDark ? '#FFF' : '#121212'} />)
                }
                </View>
                <View style={styles.profileTextContainer}>
                    <Text style={styles.profileLabel}>OPERATOR</Text>
                    <Text style={styles.profileName}>PROFILE</Text>
                </View>
                <FontAwesome5 name="chevron-right" size={20} color='#D32F2F' />
            </TouchableOpacity>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>SYSTEM</Text>
                <MenuItem icon="moon" label="Toggle Theme" onPress={toggleTheme} />
            </View>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>INFORMATION</Text>
                <MenuItem icon="info-circle" label="About INTENSITY" onPress={() => router.push('/misc/aboutUs')} />
                <MenuItem icon="shield-alt" label="Privacy Policy" onPress={() => Linking.openURL(privacyPolicy)} />
            </View>
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: '#D32F2F' }]}>DANGER ZONE</Text>
                <MenuItem icon="skull" label="Delete Account" onPress={handleDelete} isDanger={true} />
            </View>
        </View>
    )
}

function createStyles(isDark){

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
            marginBottom: 30,
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
        profileCard: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isDark ? '#141414' : '#FFFFFF',
            padding: 20,
            borderRadius: 16,
            marginBottom: 35,
            borderWidth: 1,
            borderColor: '#D32F2F', 
            shadowColor: "#D32F2F", 
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isDark ? 0.3 : 0.2, 
            shadowRadius: 8,
            elevation: 5,
        },
        profileImageContainer: {
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: isDark ? '#222' : '#E0E0E0',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 20,
            overflow: 'hidden',
            borderWidth: 2,
            borderColor: isDark ? '#333' : '#CCC',
        },
        profileImage: {
            width: '100%',
            height: '100%',
        },
        profileTextContainer: {
            flex: 1,
        },
        profileLabel: {
            color: isDark ? '#888' : '#666',
            fontSize: 10,
            fontWeight: 'bold',
            letterSpacing: 1,
            marginBottom: 4,
        },
        profileName: {
            color: isDark ? '#FFF' : '#000',
            fontSize: 20,
            fontWeight: '900',
            letterSpacing: 1,
        },
        section: {
            marginBottom: 35,
        },
        sectionTitle: {
            color: isDark ? '#888' : '#888',
            fontSize: 12,
            fontWeight: 'bold',
            letterSpacing: 1.5,
            marginBottom: 15,
            paddingLeft: 5,
        },
        menuItem: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isDark ? '#141414' : '#FFFFFF',
            padding: 16,
            borderRadius: 12,
            marginBottom: 10,
            borderWidth: 1,
            borderColor: isDark ? '#222' : '#E0E0E0',
        },
        menuIconWrapper: {
            width: 30,
            alignItems: 'center',
            marginRight: 15,
        },
        menuText: {
            flex: 1,
            color: isDark ? '#FFF' : '#000',
            fontSize: 16,
            fontWeight: '700',
            letterSpacing: 0.5,
        },
        dangerText: {
            color: '#D32F2F',
        }
    })
}