import { NextApiRequest } from "next";
import { MemberRole } from "@prisma/client";

import { NextApiResponseServerIo } from "@/types";
import { CurrentProfilePages } from "@/lib/current-profilepages";
import { db } from "@/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIo,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const profile = await CurrentProfilePages(req);
    const { content, fileUrl } = req.body;
    const { serverId, channelId } = req.query;

    if (!profile) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!serverId) {
      return res.status(400).json({ error: "Server ID is missing" });
    }

    if (!channelId) {
      return res.status(400).json({ error: "Channel ID is missing" });
    }

    if (!content) {
      return res.status(400).json({ error: "Content or file is missing" });
    }

    const server = await db.server.findFirst({
      where: {
        id: serverId as string,
        members: {
            some: {
                profileId: profile.id,
            }
        }
      },
      include: {
        members: true,
      }
    });

    if (!server) {
      return res.status(404).json({ message: "Server not found" });
    }

    const Channel = await db.channel.findFirst({
        where: {
            id: channelId as string,
            serverId: server.id,
        }
    });

    if (!Channel) {
        return res.status(404).json({ message: "Channel not found" });
    }

    const member = server.members.find((member) => member.profileId === profile.id);

    if (!member) {
        return res.status(401).json({ message: "Member not found" });
    }

    const message = await db.message.create({
        data: {
            content,
            fileUrl,
            channelId: channelId as string,
            memberId: member.id,
        },
        include: {
            member: {
                include: {
                    profile: true,
                }
            }
        }
    });

    const channelKey = `chat:${channelId}:messages`;

    res?.socket?.server?.io?.emit(channelKey, message);

    return res.status(200).json({ message });

    } catch (error) {
    console.log("[MESSAGE_POST]", error);
    return res.status(500).json({ message: "Internal Error" });
  }
}