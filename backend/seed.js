require('dotenv').config();
const mongoose=require('mongoose');const bcrypt=require('bcryptjs');const connectDB=require('./config/db');
const User=require('./models/User');const Client=require('./models/Client');const TaskTemplate=require('./models/TaskTemplate');const ServiceType=require('./models/ServiceType');const Engagement=require('./models/Engagement');const Task=require('./models/Task');
const daysFromNow=n=>new Date(Date.now()+n*86400000);
async function seed(){try{await connectDB();await Promise.all([Task.deleteMany({}),Engagement.deleteMany({}),ServiceType.deleteMany({}),TaskTemplate.deleteMany({}),Client.deleteMany({}),User.deleteMany({})]);
const hash=await bcrypt.hash('123456',10);
const users=await User.insertMany([
{name:'Admin User',email:'admin@test.com',password:hash,role:'admin'},
{name:'Manager One',email:'manager1@test.com',password:hash,role:'manager'},
{name:'Manager Two',email:'manager2@test.com',password:hash,role:'manager'},
{name:'Team Member One',email:'member1@test.com',password:hash,role:'team member'},
{name:'Team Member Two',email:'member2@test.com',password:hash,role:'team member'},
{name:'Team Member Three',email:'member3@test.com',password:hash,role:'team member'},
{name:'Team Member Four',email:'member4@test.com',password:hash,role:'team member'}]);
const members=users.filter(u=>u.role==='team member');
const clients=await Client.insertMany(Array.from({length:8},(_,i)=>({name:`Client ${i+1}`,email:`client${i+1}@example.com`})));
const templateData=[
['Monthly GST Compliance Template',['Collect client information','Prepare GST return','Review GST return','Submit GST return']],
['GST Registration Template',['Collect registration information','Prepare registration application','Review registration application','Submit registration application']],
['GST Refund Template',['Collect refund information','Prepare refund application','Review refund application','Submit refund application']]];
const templates=await TaskTemplate.insertMany(templateData.map(([name,tasks])=>({name,tasks:tasks.map(title=>({title}))})));
const services=await ServiceType.insertMany([
{name:'Monthly GST Compliance',type:'Recurring',taskTemplate:templates[0]._id},
{name:'GST Registration',type:'One-time',taskTemplate:templates[1]._id},
{name:'GST Refund',type:'One-time',taskTemplate:templates[2]._id}]);
const engagements=await Engagement.insertMany([
{client:clients[0]._id,serviceType:services[0]._id,type:'Recurring',period:'2026-09'},
{client:clients[0]._id,serviceType:services[0]._id,type:'Recurring',period:'2026-10'},
{client:clients[1]._id,serviceType:services[0]._id,type:'Recurring',period:'2026-09'},
{client:clients[2]._id,serviceType:services[0]._id,type:'Recurring',period:'2026-09'},
{client:clients[3]._id,serviceType:services[1]._id,type:'One-time'},
{client:clients[4]._id,serviceType:services[1]._id,type:'One-time'},
{client:clients[5]._id,serviceType:services[2]._id,type:'One-time'},
{client:clients[6]._id,serviceType:services[2]._id,type:'One-time'}]);
const statuses=['Not Started','In Progress','Ready for Review','Completed','Waiting for Client','Changes Requested'];
const tasks=[]; engagements.forEach((e,ei)=>{const titles=e.serviceType.equals(services[0]._id)?templateData[0][1]:e.serviceType.equals(services[1]._id)?templateData[1][1]:templateData[2][1];titles.forEach((title,ti)=>{const status=statuses[(ei+ti)%statuses.length];tasks.push({engagement:e._id,title,assignedTo:members[(ei+ti)%members.length]._id,status,deadline:daysFromNow((ti%4)-1),history:[{action:'seeded',status,changedBy:users[1]._id,at:new Date()}]});});});
await Task.insertMany(tasks);
console.log('\nDATABASE SEEDED SUCCESSFULLY\n');
console.log('All passwords: 123456');
console.log('Admin:      admin@test.com');
console.log('Managers:   manager1@test.com, manager2@test.com');
console.log('Members:    member1@test.com, member2@test.com, member3@test.com, member4@test.com');
console.log(`Clients: ${clients.length} | Services: ${services.length} | Engagements: ${engagements.length} | Tasks: ${tasks.length}`);
await mongoose.disconnect();}catch(e){console.error('Seed failed:',e);process.exitCode=1;try{await mongoose.disconnect()}catch(_){}}}
seed();
