import { CurrentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

import { NextResponse } from "next/server";

export  async function PATCH(req:Request,
    {params}:{params:{serverId:string}}
) {
    
  try {
      const profile=await CurrentProfile()

    if(!profile){
        return new NextResponse("unauth",{status:403})
    }
    if(!params.serverId){
     return new NextResponse("unauth",{status:403})  
    }
    
    const server=await db.server.update({
        where:{
            id:params.serverId,
            profileId:{
                not:profile.id
            },
            members:{
                some:{
                    profileId:profile.id
                }
            }
        },
        data:{
            members:{
                deleteMany:{
                    profileId:profile.id
                }
            }
        }
    })

    return NextResponse.json(server)
    

  } catch (error) {
      console.log(error)
        return new NextResponse("internal",{status:500})
  }

}