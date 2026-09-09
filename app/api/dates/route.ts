import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { initialActivities } from '@/lib/activities';
export async function GET(){
 if(!process.env.DATABASE_URL)return NextResponse.json([]);
 const dates=await prisma.date.findMany({include:{activity:true,reviews:true},orderBy:{scheduledAt:'desc'}});return NextResponse.json(dates);
}
export async function POST(req:Request){
 if(!process.env.DATABASE_URL)return NextResponse.json({error:'DATABASE_URL no configurada'},{status:503});
 const {activityId,date,time,createdBy}=await req.json();
 let activity=await prisma.activity.findUnique({where:{id:activityId}});
 if(!activity){ const seed=initialActivities.find((x,i)=>`seed-${i}`===activityId); if(seed) activity=await prisma.activity.create({data:{...seed,isCustom:false}}); else return NextResponse.json({error:'Actividad no encontrada'},{status:404}); }
 const scheduledAt=new Date(`${date}T${time}:00`);
 const item=await prisma.date.create({data:{activityId:activity.id,scheduledAt,createdBy},include:{activity:true,reviews:true}});return NextResponse.json(item);
}
