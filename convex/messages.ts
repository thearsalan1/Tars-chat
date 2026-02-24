import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Sending a message
export const sendMessage = mutation({
  args:{
    conversationId:v.id("conversation"),
    senderId:v.string(),
    content:v.string(),
  },
  handler:async (ctx,args)=>{
    await ctx.db.insert("messages",{
      conversationId:args.conversationId,
      senderId:args.senderId,
      content:args.content,
      isDeleted:false,
      reactions:[]
    });
    
    // updating conversation lastTime
    await ctx.db.patch(args.conversationId,{
      lastMessageTime:Date.now()
    })
  }
});


// Get all messages in a conversation
export const getMessages = query({
  args: { conversationId: v.id("conversation") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();
  },
});

// Soft delete a message
export const deleteMessage = mutation({
  args:{messageId:v.id("messages")},
  handler:async (ctx,args)=>{
    await ctx.db.patch(args.messageId, {isDeleted:true})
  }
})


// Marking conversation as read
export const markAsRead = mutation({
  args: {
    conversationId: v.id("conversation"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("readStatus")
      .withIndex("by_conversation_and_user", (q) =>
        q.eq("conversationId", args.conversationId).eq("userId", args.userId)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { lastReadTime: Date.now() });
    } else {
      await ctx.db.insert("readStatus", {
        conversationId: args.conversationId,
        userId: args.userId,
        lastReadTime: Date.now(),
      });
    }
  },
});

// Updating typing indicator
export const setTyping = mutation({
  args: {
    conversationId: v.id("conversation"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("typingIndicator")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationid", args.conversationId)
      )
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { lastTypedTime: Date.now() });
    } else {
      await ctx.db.insert("typingIndicator", {
        conversationid: args.conversationId,
        userId: args.userId,
        lastTypedTime: Date.now(),
      });
    }
  },
})

// Typing indicator for conversation 
export const getTypingUsers = query({
  args:{
    conversationId:v.id("conversation"),
    currentUserId:v.string(),
  },
  handler:async(ctx , args)=>{
    const twoSecondsAgo = Date.now()-2000;
    const indicators = await ctx.db
    .query("typingIndicator")
    .withIndex("by_conversation",(q)=>
    q.eq("conversationid",args.conversationId)
  )
  .collect();
  return indicators.filter(
    (i)=>
      i.userId !== args.currentUserId && i.lastTypedTime > twoSecondsAgo
  );
  }
});