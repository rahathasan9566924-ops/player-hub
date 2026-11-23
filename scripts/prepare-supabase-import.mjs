#!/usr/bin/env node
/**
 * Convert a permission-cleared catalog JSON into Supabase CSV import batches.
 * No network access and no database writes. All records remain unpublished.
 * Usage: node scripts/prepare-supabase-import.mjs catalog.json [output-dir]
 */
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const inputPath=process.argv[2];
const outputDir=resolve(process.argv[3] || 'supabase-import');
if(!inputPath){console.error('Usage: node scripts/prepare-supabase-import.mjs catalog.json [output-dir]');process.exit(2);}
const input=JSON.parse(await readFile(inputPath,'utf8'));
const validation=spawnSync(process.execPath,[new URL('./validate-catalog.mjs',import.meta.url).pathname,inputPath],{encoding:'utf8'});
if(validation.status!==0){process.stderr.write(validation.stderr||validation.stdout);process.exit(validation.status||1);}
const source=input.source;
const csv=(headers,rows)=>[headers,...rows.map(row=>headers.map(h=>cell(row[h])))].map(r=>r.join(',')).join('\n')+'\n';
function cell(value){
  if(value===null||value===undefined)return '';
  const text=typeof value==='object'?JSON.stringify(value):String(value);
  return /[",\r\n]/.test(text)?'"'+text.replaceAll('"','""')+'"':text;
}
const verification=v=>v==='verified'?'verified':v==='unverified'?'unverified':'pending';
const identities=new Map();
for(const p of (input.identities||[])){
  if(!p.playerId)throw new Error('Each identity requires playerId.');
  identities.set(String(p.playerId),p);
}
for(const p of input.players||[]){
  if(!p.playerId)throw new Error('Player card '+p.cardId+' is missing playerId; add a matching identity record.');
  const id=String(p.playerId);
  if(!identities.has(id)) identities.set(id,{playerId:id,name:p.name,pos:p.pos,nationality:p.nationality||'',club:p.club||'',height:p.height??null,weight:p.weight??null,foot:p.foot||'',source:p.source,sourceUrl:p.sourceUrl});
}
const identityRows=[...identities.entries()].map(([id,p])=>({
  konami_id:id,name:p.name||'',position:p.pos||p.position||'',country:p.nationality||p.country||'',
  payload:{team:p.club||p.team||'',height:p.height??null,weight:p.weight??null,foot:p.foot||'',source:p.source||source.name,sourceUrl:p.sourceUrl||source.url},
  published:false
}));
const cardRows=(input.players||[]).map(p=>({
  card_id:String(p.cardId),konami_id:String(p.playerId),card_name:p.cardName||p.name,card_type:p.cardType||'',
  overall:p.ovr??null,position:p.pos,release_date:p.releaseDate??null,image_url:p.image||'',
  source_url:p.sourceUrl,verification:verification(p.verification),published:false,
  payload:{pack:p.pack||'',databaseVersion:p.databaseVersion||'',playstyle:p.playstyle||'',maxOvr:p.maxOvr??null,age:p.age??null,height:p.height??null,weight:p.weight??null,foot:p.foot||'',nationality:p.nationality||'',club:p.club||'',league:p.league||'',source:p.source,retrievedAt:p.retrievedAt,notes:p.notes||''}
}));
const attrRows=[],skillRows=[],positionRows=[];
for(const p of input.players||[]){
  for(const [key,value] of Object.entries(p.attributes||{})) if(value!==null) attrRows.push({card_id:p.cardId,attribute_key:key,attribute_value:value,source_url:p.sourceUrl,verification:verification(p.verification)});
  for(const skill of p.skills||[]) skillRows.push({card_id:p.cardId,skill_name:skill,source_url:p.sourceUrl,verification:verification(p.verification)});
  for(const [position,value] of Object.entries(p.positions||{})) if(value!==null) positionRows.push({card_id:p.cardId,position,proficiency:value,source_url:p.sourceUrl,verification:verification(p.verification)});
}
const managerRows=(input.managers||[]).map(m=>({
  manager_id:String(m.managerId),name:m.name,team:m.team||'',formation:m.formation||'',
  playstyle:m.attackingPlaystyle||'',source_url:m.sourceUrl,verification:verification(m.verification),published:false,
  payload:{nationality:m.nationality||'',buildUp:m.buildUp||'',attackingArea:m.attackingArea||'',positioning:m.positioning||'',defensivePlaystyle:m.defensivePlaystyle||'',containmentArea:m.containmentArea||'',pressuring:m.pressuring||'',defensiveLine:m.defensiveLine??null,compactness:m.compactness??null,boosters:m.boosters||[],linkUp:m.linkUp||[],source:m.source,retrievedAt:m.retrievedAt,notes:m.notes||''}
}));
const tacticRows=[];
for(const m of input.managers||[]){
  const values={buildUp:m.buildUp,attackingArea:m.attackingArea,positioning:m.positioning,defensivePlaystyle:m.defensivePlaystyle,containmentArea:m.containmentArea,pressuring:m.pressuring,defensiveLine:m.defensiveLine,compactness:m.compactness,boosters:m.boosters,linkUp:m.linkUp};
  for(const [key,value] of Object.entries(values)) if(value!==undefined&&value!==null&&value!=='') tacticRows.push({manager_id:m.managerId,tactic_key:key,tactic_value:typeof value==='object'?JSON.stringify(value):String(value),source_url:m.sourceUrl,verification:verification(m.verification)});
}
const batches={
 'player_identities.csv':[['konami_id','name','position','country','payload','published'],identityRows],
 'player_cards.csv':[['card_id','konami_id','card_name','card_type','overall','position','release_date','image_url','source_url','verification','published','payload'],cardRows],
 'player_card_attributes.csv':[['card_id','attribute_key','attribute_value','source_url','verification'],attrRows],
 'player_card_skills.csv':[['card_id','skill_name','source_url','verification'],skillRows],
 'player_card_positions.csv':[['card_id','position','proficiency','source_url','verification'],positionRows],
 'managers.csv':[['manager_id','name','team','formation','playstyle','source_url','verification','published','payload'],managerRows],
 'manager_tactics.csv':[['manager_id','tactic_key','tactic_value','source_url','verification'],tacticRows]
};
await mkdir(outputDir,{recursive:true});
for(const [name,[headers,rows]] of Object.entries(batches)) await writeFile(resolve(outputDir,name),csv(headers,rows),'utf8');
const manifest={source,generatedAt:new Date().toISOString(),counts:Object.fromEntries(Object.entries(batches).map(([name,[,rows]])=>[name,rows.length])),note:'All rows are unpublished. Import identities before cards, then child tables. Verify permissions and records before publishing.'};
await writeFile(resolve(outputDir,'manifest.json'),JSON.stringify(manifest,null,2)+'\n','utf8');
console.log('IMPORT PACKAGE READY');
for(const [name,count] of Object.entries(manifest.counts)) console.log(name+': '+count);
console.log('Output: '+outputDir);
console.log('Order: player_identities -> player_cards -> card attributes/skills/positions; managers -> manager_tactics.');
console.log('No database was changed. All generated records have published=false.');
