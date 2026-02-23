import {defineSchema, defineTable} from "convex/server";
import {v} from "convex/values";


export default defineSchema({

  // Stores user profiles synced from clerk
  users:defineTable({
    clerkId:v.string(),
    name:v.string(),
    email:v.string(),
    imageUrl:v.string(),
    isOnline:v.boolean(),
  }).index("by_clerk_id",["clerkId"]),

  // A conversation between two users
  conversation:defineTable({
    participantIds:v.array(v.string()),
    lastMessageTime:v.number(),
  }),


  // Individual messages
  messages:defineTable({
    conversationId:v.id("conversation"),
    senderId:v.string(),
    content:v.string(),
    isDeleted:v.optional(v.boolean()),
    reactions:v.optional(
      v.array(
        v.object({
          emoji:v.string(),
          userIds:v.array(v.string())
        })
      )
    )
  }).index("by_conversation",["conversationId"]),


  // Tracking typing status per conversation
  typingIndicator:defineTable({
    conversationid:v.id("conversation"),
    userId:v.string(),
    lastTypedTime:v.number(),
  }).index("by_conversation",["conversationid"]),

  
// Tracks read status per conversation per user
readStatus:defineTable({
  conversationId:v.id("conversation"),
  userId:v.string(),
  lastReadTime:v.number()
}).index("by_conversation_and_user",["conversationId","userId"])
})

