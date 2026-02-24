import {v} from "convex/values";
import {mutation,query} from "./_generated/server"

// Get or create a conversation between two users
export const getOrcreateConversation = mutation({
  args:{
    currentUserId:v.string(),
    otherUserId:v.string(),
  },
  handler:async(ctx,args)=>{
    // checking whether conversation already exist or not
    const existing = await ctx.db.query("conversation").collect();
    const found = existing.find(
      (c)=>
        c.participantIds.includes(args.currentUserId) &&
      c.participantIds.includes(args.otherUserId)
    );
    if(found) return found._id

    // creating conversation 
    return await ctx.db.insert("conversation",{
      participantIds:[args.currentUserId,args.otherUserId],
      lastMessageTime:Date.now(),
    })
  }
});


export const getUserConversations = query({
  args:{userId:v.string()},
  handler:async(ctx,args)=>{
    const conversations = await ctx.db.query("conversation").collect();
    const userConvos = conversations.filter((c)=>
    c.participantIds.includes(args.userId)
  )

  // Adding other users info and last message
  const enriched = await Promise.all(
    userConvos.map(async (convo)=>{
      const otherUserId = convo.participantIds.find(
      (id) => id!== args.userId
      )!;
      const otherUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id",(q)=>q.eq("clerkId",otherUserId))
      .first();


      // Getting last message
      const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation",(q)=>q.eq("conversationId",convo._id)
    )
    .collect();
    const lastMessage = messages[messages.length-1];

    // Getting unread count
    const readStatus = await ctx.db.query("readStatus")
    .withIndex("by_conversation_and_user",(q)=>q.eq("conversationId",convo._id).eq("userId",args.userId)
  )
  .first();

  const unreadCount = messages.filter(
    (m)=>
      m.senderId !== args.userId &&
      (!readStatus || m._creationTime > readStatus.lastReadTime)
  ).length;

  return {
    ...convo,
    otherUser,
    lastMessage,
    unreadCount,
  };
  })
  );

  // Sorting by most resent message
  return enriched.sort((a,b)=>b.lastMessageTime - a.lastMessageTime)
  }
})