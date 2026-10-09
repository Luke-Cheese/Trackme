import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const LOCATION_TASK='mtb-background-location';
export const TRACK_KEY='@mtb_current_track';
TaskManager.defineTask(LOCATION_TASK,async({data,error})=>{
  if(error)return;
  const locations=(data as any)?.locations||[];
  if(!locations.length)return;
  const old=JSON.parse((await AsyncStorage.getItem(TRACK_KEY))||'[]');
  const fresh=locations.map((l:any)=>({lat:l.coords.latitude,lon:l.coords.longitude,altitude:l.coords.altitude,accuracy:l.coords.accuracy,speed:l.coords.speed,heading:l.coords.heading,timestamp:l.timestamp}));
  await AsyncStorage.setItem(TRACK_KEY,JSON.stringify([...old,...fresh]));
});
export async function startBackgroundTracking(){
 const fg=await Location.requestForegroundPermissionsAsync();
 if(fg.status!=='granted')throw new Error('Permesso posizione non concesso');
 const bg=await Location.requestBackgroundPermissionsAsync();
 if(bg.status!=='granted')throw new Error('Permesso posizione in background non concesso');
 const running=await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK);
 if(!running)await Location.startLocationUpdatesAsync(LOCATION_TASK,{accuracy:Location.Accuracy.Highest,timeInterval:2000,distanceInterval:3,pausesUpdatesAutomatically:false,showsBackgroundLocationIndicator:true,activityType:Location.ActivityType.Fitness,foregroundService:{notificationTitle:'MTB GPS Tracker',notificationBody:'Registrazione GPS in corso',notificationColor:'#e11d48'}});
}
export async function stopBackgroundTracking(){if(await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK))await Location.stopLocationUpdatesAsync(LOCATION_TASK)}
export async function getTrack(){return JSON.parse((await AsyncStorage.getItem(TRACK_KEY))||'[]')}
export async function clearTrack(){await AsyncStorage.setItem(TRACK_KEY,'[]')}
