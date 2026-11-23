import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const root=new URL('..',import.meta.url);
const generator=new URL('./prepare-supabase-import.mjs',import.meta.url);
const validator=new URL('./validate-catalog.mjs',import.meta.url);
function sample(){
 return {source:{name:'Licensed test fixture',url:'https://example.org/catalog',reusePermission:'permitted'},
 players:[{cardId:'card-1',playerId:'player-1',name:'Test Player',cardName:'Standard',cardType:'Standard',pos:'CF',ovr:90,maxOvr:92,attributes:{speed:88},skills:['First-time Shot'],positions:{CF:100},source:'Licensed test fixture',sourceUrl:'https://example.org/card-1',retrievedAt:'2026-11-23',verification:'verified'}],
 managers:[{managerId:'manager-1',name:'Test Manager',team:'Test FC',formation:'4-2-2-2',attackingPlaystyle:'Quick Counter',buildUp:'Short Pass',defensivePlaystyle:'Frontline Pressure',defensiveLine:65,compactness:70,boosters:['Test Booster'],linkUp:[],source:'Licensed test fixture',sourceUrl:'https://example.org/manager-1',retrievedAt:'2026-11-23',verification:'partial'}]};
}
test('generates schema-aligned CSV batches and keeps all rows unpublished',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'player-hub-import-'));
 try{
  const input=join(dir,'catalog.json'),out=join(dir,'out');
  await writeFile(input,JSON.stringify(sample()));
  const run=spawnSync(process.execPath,[generator.pathname,input,out],{encoding:'utf8'});
  assert.equal(run.status,0,run.stderr);
  const cards=await readFile(join(out,'player_cards.csv'),'utf8');
  assert.match(cards,/card-1,player-1/);
  assert.match(cards,/verified,false/);
  const identities=await readFile(join(out,'player_identities.csv'),'utf8');
  assert.match(identities,/player-1,Test Player/);
  const tactics=await readFile(join(out,'manager_tactics.csv'),'utf8');
  assert.match(tactics,/manager-1,defensiveLine,65/);
  const manifest=JSON.parse(await readFile(join(out,'manifest.json'),'utf8'));
  assert.equal(manifest.counts['player_cards.csv'],1);
  assert.equal(manifest.counts['player_card_attributes.csv'],1);
  assert.equal(manifest.counts['player_card_skills.csv'],1);
  assert.equal(manifest.counts['player_card_positions.csv'],1);
  assert.equal(manifest.counts['managers.csv'],1);
 }finally{await rm(dir,{recursive:true,force:true});}
});
test('rejects a player card without a stable identity ID',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'player-hub-import-'));
 try{
  const input=join(dir,'catalog.json');
  const data=sample(); delete data.players[0].playerId;
  await writeFile(input,JSON.stringify(data));
  const run=spawnSync(process.execPath,[generator.pathname,input,join(dir,'out')],{encoding:'utf8'});
  assert.notEqual(run.status,0);
  assert.match(run.stderr,/missing playerId/);
 }finally{await rm(dir,{recursive:true,force:true});}
});
