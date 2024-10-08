"use client"
import { UploadDropzone } from "@/lib/uploadthing";
import "@uploadthing/react/styles.css"
import { FileIcon, X } from "lucide-react";
import Image from "next/image";

interface FileUploaderProps {
  onChange:(url?:string)=>void;
  value:string;
  endpoint:"messagefile" |"serverImage"
}


export const FileUploader = ({onChange,value,endpoint}:FileUploaderProps) => {
 
  const fileType=value?.split(".").pop()

  if(value && fileType !== "pdf"){
      return (
        <div className="relative h-20 w-20">
           <Image fill src={value} alt="upload" className="rounded-full">

           </Image>
           <button className="rounded-full absolute p-1 top-0 right-0 bg-rose-500 text-white shadow-sm" onClick={()=>onChange("")} type="button"><X className="h-4 w-4"></X></button>


        </div>
      )
  }

  if(value&& fileType=="pdf"){
    return (
      <div className="relative flex items-center p-2 mt-2 rounded-md  bg-background/10">
        <FileIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400" />
                <a
                    href={value}
                    target="_blank"
                    className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline"
                    rel="noopener noreferrer"
                >
                    {value}
                </a>
                <button
                    onClick={() => onChange("")}
                    className="bg-rose-500 text-white p-1 rounded-full 
                    absolute -top-2 -right-2 shadow-sm"
                >
                    <X className="h-4 w-4"/>
                </button>
      </div>
    )
  }
 
  return (
   <UploadDropzone endpoint={endpoint} onClientUploadComplete={(res)=>{
    onChange(res?.[0].url)
   }}
   onUploadError={(error:Error)=>{
     console.log(error)
   }}
   ></UploadDropzone>
  )
}


