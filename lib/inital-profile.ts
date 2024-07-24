import { currentUser,auth } from "@clerk/nextjs/server";

import { db } from "@/lib/db";


export const initalprofile=async()=>{
    const user=await currentUser()

    if(!user){
      return auth().redirectToSignIn()
    }

    const profile=await db.profile.findUnique({
        where:{
            userId:user.id
        }
    })
    if(profile){
        return profile
    }

    const newprofile=await db.profile.create({
        data:{
            userId:user.id,
            name:`${user.firstName} ${user.lastName}`,
            imageId:user.imageUrl,
            emaliId:user.emailAddresses[0].emailAddress
        }
    })
    return newprofile
}