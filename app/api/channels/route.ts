import { CurrentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";
import { NextResponse } from "next/server";

export async function POST(req:Request
){
   try {
       
    const profile=await CurrentProfile()
    const {name,type}=await req.json()
    const {searchParams}=new URL(req.url)

    const serverId=searchParams.get("serverId")
    if(!profile){
        return new NextResponse("unauthorized",{status:401})
    }

       if(!serverId){
        return new NextResponse("server unauth",{status:404})
    }
    
    if(name==="general"){
        return new NextResponse("name not general",{status:404})
    }

    const server=await db.server.update({
        where:{
            id:serverId,
            members:{
                some:{
                    profileId:profile.id,
                    role:{
                        in:[MemberRole.ADMIN,MemberRole.MODERATOR]
                    }
                }
            }
        },
        data:{
            channel:{
                create:{
                    profileId:profile.id,
                    name,
                    type
                }
            }
        }
    })

return NextResponse.json(server)

   } catch (error) {
       console.log(error)
        return new NextResponse("internal error",{status:500})
   }
}