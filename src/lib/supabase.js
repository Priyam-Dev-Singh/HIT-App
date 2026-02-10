import AsyncStorage from "@react-native-async-storage/async-storage";
import {createClient} from "@supabase/supabase-js";
import { AppState } from "react-native";
import 'react-native-url-polyfill/auto';

const supabaseURL = "https://zgmpgurqamgahiularvw.supabase.co";
const supabasePublishableKey = "sb_publishable_34zH5A4VrYrGkxZkoPOGrQ_xOnYR73w";

export const supabase = createClient(supabaseURL, supabasePublishableKey, {
    auth:{
        storage: AsyncStorage,
        autoRefreshToken:true,
        persistSession:true,
        detectSessionInUrl: false,
    }
});

AppState.addEventListener('change', (state)=>{
    if(state==='active'){
        supabase.auth.startAutoRefresh();
    }
    else{
        supabase.auth.stopAutoRefresh();
    }
})