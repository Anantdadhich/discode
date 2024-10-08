"use client"

import { cn } from "@/lib/utils";
import { Channel, ChannelType, MemberRole, Server } from "@prisma/client"
import { Camera, Edit, Hash, ListVideo, Lock, Mic, Trash } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Addtool } from "../Addtool";

interface ServerChannelProps{
    channel:Channel;
    server:Server;
    role?:MemberRole;
}
const iconmap={
    [ChannelType.TEXT]:Hash,
    [ChannelType.AUDIO]:Mic,
    [ChannelType.VEDIO]:Camera
}


export const ServerChannel = ({channel,server,role}:ServerChannelProps) => {
    const params=useParams()
    const router=useRouter()

    const Icon=iconmap[channel.type];
    
    const onClick=()=>{
      router.push(`/servers/${params?.serverId}/channels/${channel.id}`)
    }

 return (
     <button onClick={onClick}  className={cn("group px-2 py-2 rounded-md flex items-center gap-x-2 w-full hover:bg-zinc-700/10 dark:bg-zinc-700/50 transition mb-1  ",
         params?.channelId===channel.id && "bg-zinc-700/20 dark:bg-zinc-700"
     )}>
       <Icon className="flex-shrink-0  w-5 h-5 text-zinc-500 dark:text-zinc-400"></Icon>
         <p className={cn("line-clamp-1 font-semibold text-sm text-zinc-500 group-hover:text-zinc-600 dark:text-zinc-400 dark:group-hover:text-zinc-300 transition ",
            params?.channelId===channel.id && "text-primary dark:text-zinc-200 dark:group-hover:text-white"
         )} >{channel.name}</p>

         {channel.name!== "general" && role !== MemberRole.GUEST && (
            <div className="ml-auto flex items-center gap-x-2">
               <Addtool label="Edit">
                <Edit className="h-4 w-4 hidden group-hover:block text-zinc-500 hover:text-zinc-600 dark:text-zinc-400  dark:hover:text-zinc-300 transition"></Edit>
               </Addtool>
                <Addtool label="Delete">
                <Trash className="h-4 w-4 hidden group-hover:block text-zinc-500 hover:text-zinc-600 dark:text-zinc-400  dark:hover:text-zinc-300 transition"/>
               </Addtool>
            </div>
         )}
         {channel.name==="general" && (
            <Lock className="ml-auto h-4 w-4 text-zinc-500 dark:text-zinc-400" ></Lock>
         )}
         
     </button>
  )
}


