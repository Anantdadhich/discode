import { NextApiRequest } from "next";
import { MemberRole } from "@prisma/client";

import { NextApiResponseServerIo } from "@/types";
import { CurrentProfilePages } from "@/lib/current-profilepages";
import { db } from "@/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIo,
) {
  if (req.method !== "DELETE" && req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const profile = await CurrentProfilePages(req);
    const { directMessageId,conversationId } = req.query;
    const { content } = req.body;

    if (!profile) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!conversationId) {
      return res.status(400).json({ error: "Server ID missing" });
    }

   
     const conversation=await db.conversation.findFirst({
      where:{
        id:conversationId as string,
        OR:[
          {
            memberone:{
              profileId:profile.id
            }
          },{
            membertwo:{
              profileId:profile.id
            }
          }
        ]
      },include:{
        memberone:{
          include:{
            profile:true
          }
        },
        membertwo:{
          include:{
            profile:true
          }
        }
      }
     })

        if (!conversation) {
      return res.status(404).json({ error: "Member not found" });
    }

    const member = conversation.memberone.profileId ===profile.id ? conversation.memberone : conversation.membertwo

    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }

    let message = await db.directmessage.findFirst({
      where: {
        id: directMessageId as string,
        converationId: conversationId as string,
      },
      include: {
        member: {
          include: {
            profile: true,
          }
        }
      }
    })

    if (!message || message.deleted) {
      return res.status(404).json({ error: "Message not found" });
    }

    const isMessageOwner = message.memberId === member.id;
    const isAdmin = member.role === MemberRole.ADMIN;
    const isModerator = member.role === MemberRole.MODERATOR;
    const canModify = isMessageOwner || isAdmin || isModerator;

    if (!canModify) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (req.method === "DELETE") {
      message = await db.directmessage.update({
        where: {
          id: directMessageId as string,
        },
        data: {
          fileUrl: null,
          content: "This message has been deleted.",
          deleted: true,
        },
        include: {
          member: {
            include: {
              profile: true,
            }
          }
        }
      })
    }

    if (req.method === "PATCH") {
      if (!isMessageOwner) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      message = await db.directmessage.update({
        where: {
          id: directMessageId as string,
        },
        data: {
          content,
        },
        include: {
          member: {
            include: {
              profile: true,
            }
          }
        }
      })
    }

    const updateKey = `chat:${conversation.id}:messages:update`;

    res?.socket?.server?.io?.emit(updateKey, message);

    return res.status(200).json(message);
  } catch (error) {
    console.log("[MESSAGE_ID]", error);
    return res.status(500).json({ error: "Internal Error" });
  }
}