import React,{useEffect,useMemo,useState}from'react';
import{View,Text,Pressable,StyleSheet,Alert,ScrollView}from'react-native';
import Mapbox from'@rnmapbox/maps';
import * as Location from'expo-location';
import * as FileSystem from'expo-file-system';
import * as Sharing from'expo-sharing';
import AsyncStorage from'@react-native-async-storage/async-storage';
import{startBackgroundTracking,stopBackgroundTracking,getTrack,clearTrack}from'./src/tracking';
Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN||'');
const R=6371000;
const dist=(a:any,b:any)=>{const p=Math.PI/180,d1=(b.lat-a.lat)*p,d2=(b.lon-a.lon)*p,x=Math.sin(d1/2)**2+Math.cos(a.lat*p)*Math.cos(b.lat*p)*Math.sin(d2/2)**2;return 2*R*Math.asin(Math.sqrt(x))};
const fmt=(ms:number)=>{let s=Math.floor(ms/1000),h=Math.floor(s/3600),m=Math.floor(s%3600/60),q=s%60;return[h,m,q].map(x=>String(x).padStart(2,'0')).join(':')};
const gpx=(t:any[])=>`<?xml version="1.0" encoding="UTF-8"?><gpx version="1.1" creator="MTB GPS Tracker Pro" xmlns="http://www.topografix.com/GPX/1/1"><trk><name>MTB Ride</name><trkseg>${t.map(p=>`<trkpt lat="${p.lat}" lon="${p.lon}"><ele>${p.altitude??0}</ele><time>${new Date(p.timestamp).toISOString()}</time></trkpt>`).join('')}</trkseg></trk></gpx>`;
function Stat({v,l}:{v:string,l:string}){return <View style={s.stat}><Text style={s.value}>{v}</Text><Text style={s.label}>{l}</Text></View>}
export default function App(){
 const[state,setState]=useState('idle'),[track,setTrack]=useState<any[]>([]),[last,setLast]=useState<any>(),[elapsed,setElapsed]=useState(0),[started,setStarted]=useState<number>(),[paused,setPaused]=useState(0),[autoPause,setAutoPause]=useState(true);
 useEffect(()=>{getTrack().then(t=>{if(t.length){setTrack(t);setLast(t[t.length-1])}})},[]);
 useEffect(()=>{if(state!=='tracking')return;const i=setInterval(()=>started&&setElapsed(paused+Date.now()-started),500);return()=>clearInterval(i)},[state,started,paused]);
 useEffect(()=>{let sub:any;if(state==='tracking')Location.watchPositionAsync({accuracy:Location.Accuracy.Highest,timeInterval:1000,distanceInterval:2},p=>{const q={lat:p.coords.latitude,lon:p.coords.longitude,altitude:p.coords.altitude,accuracy:p.coords.accuracy,speed:p.coords.speed,heading:p.coords.heading,timestamp:p.timestamp};if(autoPause&&q.speed!=null&&q.speed<0.7)return;setLast(q);setTrack(x=>[...x,q])}).then(x=>sub=x);return()=>sub?.remove()},[state,autoPause]);
 const distance=useMemo(()=>track.reduce((z,p,i)=>i?z+dist(track[i-1],p):0,0),[track]);
 const dplus=useMemo(()=>track.reduce((z,p,i)=>i&&p.altitude!=null&&track[i-1].altitude!=null?z+Math.max(0,p.altitude-track[i-1].altitude):z,0),[track]);
 const speeds=track.map(p=>p.speed).filter((x:any)=>typeof x==='number'&&x>=0),avg=speeds.length?speeds.reduce((a,b)=>a+b,0)/speeds.length*3.6:0,max=speeds.length?Math.max(...speeds)*3.6:0;
 const coords=track.map(p=>[p.lon,p.lat]),geo={type:'Feature',geometry:{type:'LineString',coordinates:coords}};
 const start=async()=>{try{await clearTrack();setTrack([]);setElapsed(0);setPaused(0);setStarted(Date.now());await startBackgroundTracking();setState('tracking')}catch(e:any){Alert.alert('GPS',e.message)}};
 const pause=async()=>{if(started)setPaused(x=>x+Date.now()-started);await stopBackgroundTracking();setStarted(undefined);setState('paused')};
 const stop=async()=>{if(started)setPaused(x=>x+Date.now()-started);await stopBackgroundTracking();setStarted(undefined);setState('stopped')};
 const resume=async()=>{await startBackgroundTracking();setStarted(Date.now());setState('tracking')};
 const exportGPX=async()=>{const t=await getTrack();const uri=FileSystem.documentDirectory+'mtb-ride.gpx';await FileSystem.writeAsStringAsync(uri,gpx(t),{encoding:FileSystem.EncodingType.UTF8});if(await Sharing.isAvailableAsync())await Sharing.shareAsync(uri,{mimeType:'application/gpx+xml'})};
 return <View style={s.root}><Mapbox.MapView style={s.map} styleURL={Mapbox.StyleURL.Outdoors}>{last&&<Mapbox.Camera centerCoordinate={[last.lon,last.lat]}zoomLevel={16}/>}<Mapbox.UserLocation visible/>{coords.length>1&&<Mapbox.ShapeSource id="track" shape={geo as any}><Mapbox.LineLayer id="line" style={{lineColor:'#e11d48',lineWidth:5,lineCap:'round',lineJoin:'round'}}/></Mapbox.ShapeSource>}</Mapbox.MapView>
 <ScrollView style={s.card}><Text style={s.title}>MTB GPS TRACKER PRO</Text><View style={s.grid}><Stat v={last?.speed!=null?(last.speed*3.6).toFixed(1):'0.0'} l="KM/H"/><Stat v={(distance/1000).toFixed(2)} l="DISTANZA KM"/><Stat v={fmt(elapsed)} l="TEMPO"/><Stat v={Math.round(dplus)+' m'} l="D+"/><Stat v={avg.toFixed(1)} l="MEDIA"/><Stat v={max.toFixed(1)} l="MAX"/></View>
 <View style={s.row}><Btn t="▶ START"f={start} d={state==='tracking'}/><Btn t="Ⅱ PAUSA"f={pause} d={state!=='tracking'}/><Btn t={state==='paused'?'▶ RIPRENDI':'■ STOP'}f={state==='paused'?resume:stop} d={state==='idle'||state==='stopped'}/></View>
 <Pressable style={s.gpx} onPress={exportGPX} disabled={!track.length}><Text style={s.gtxt}>⬇ ESPORTA GPX</Text></Pressable>
 <Pressable style={s.auto} onPress={()=>setAutoPause(!autoPause)}><Text>Auto-pausa: {autoPause?'ON':'OFF'}</Text></Pressable>
 <Text style={s.status}>{state==='tracking'?'● REGISTRAZIONE IN CORSO':state==='paused'?'Ⅱ PAUSA':state==='stopped'?'✓ ATTIVITÀ TERMINATA':'PRONTO'}</Text>
 <Text style={s.extra}>Altitudine: {last?.altitude!=null?Math.round(last.altitude)+' m':'—'}   •   Direzione: {last?.heading!=null?Math.round(last.heading)+'°':'—'}   •   GPS: {last?.accuracy!=null?Math.round(last.accuracy)+' m':'—'}</Text>
 </ScrollView></View>
}
function Btn({t,f,d}:{t:string,f:()=>void,d:boolean}){return <Pressable disabled={d} onPress={f} style={[s.btn,d&&s.dis]}><Text style={s.bt}>{t}</Text></Pressable>}
const s=StyleSheet.create({root:{flex:1,backgroundColor:'#111'},map:{flex:1},card:{position:'absolute',left:8,right:8,bottom:8,maxHeight:310,backgroundColor:'#fff',borderRadius:18,padding:12},title:{fontWeight:'900',fontSize:16,textAlign:'center',marginBottom:4},grid:{flexDirection:'row',flexWrap:'wrap'},stat:{width:'33.33%',alignItems:'center',padding:6},value:{fontSize:20,fontWeight:'900'},label:{fontSize:9,color:'#666'},row:{flexDirection:'row',gap:6,marginTop:6},btn:{flex:1,padding:12,borderRadius:10,backgroundColor:'#111',alignItems:'center'},dis:{opacity:.3},bt:{color:'#fff',fontWeight:'900',fontSize:11},gpx:{marginTop:8,padding:12,borderRadius:10,backgroundColor:'#e11d48',alignItems:'center'},gtxt:{color:'#fff',fontWeight:'900'},auto:{marginTop:7,padding:9,alignItems:'center',backgroundColor:'#eee',borderRadius:9},status:{textAlign:'center',fontWeight:'800',marginTop:7},extra:{fontSize:10,color:'#666',textAlign:'center',marginTop:5}});
