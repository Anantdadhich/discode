
import { CurrentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db"
import { redirectToSignIn } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { ServerSidebar } from "@/components/server/ServerSidebar"



const ServerIdPage=async({children,params}:{children:React.ReactNode,params:{serverId:string}})=>{

    const profile=await CurrentProfile()

    if(!profile){
        return redirectToSignIn()
    }

    const server=await db.server.findUnique({
        where:{
            id:params.serverId,
            members:{
                some:{
                    profileId:profile.id
                }
            }
        }
    })

    if(!server){
        return redirect("/")
    }
   return (
    <div className="h-full">
        <div className="h-full md:flex hidden w-60 z-20 flex-col fixed inset-y-0">
          <ServerSidebar serverId={params.serverId}></ServerSidebar>
        </div>
         <main className="h-full md:pl-60">
             {children}
         </main>
    </div>
   )
}

export default ServerIdPage