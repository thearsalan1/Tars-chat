import {v} from "convex/values"
import {mutation,query} from './_generated/server'

export const upsertUser = mutation({
  args:{
    clerkId:v.string(),
    name:v.string(),
    email:v.string(),
    imageUrl:v.string()
  },
  handler:async (ctx,args)=>{
    const existing = await ctx.db
    .query("users")
    .withIndex("by_clerk_id",(q)=>q.eq("clerkId",args.clerkId))
    .first();

    if(existing){
      await ctx.db.patch(existing._id,{
        name:args.name,
        email:args.email,
        imageUrl:args.imageUrl,
        isOnline:true,
      });
  }else{
    await ctx.db.insert("users",{
      ...args,
      isOnline:true,
    })
  }
  }
})


// Get all users except the current one
export const getAllUsers=query({
  args:{currentClerkId:v.string()},
  handler:async (ctx,args)=>{
    const users = await ctx.db.query("users").collect();
    return users.filter((u)=>u.clerkId !== args.currentClerkId);
  },
});


// Online/Offline setter handler
export const setOnlineStatus = mutation({
  args:{clerkId:v.string(),isOnline:v.boolean()},
  handler:async(ctx , args)=>{
    const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
    .first();
    if(user){
      await ctx.db.patch(user._id, {isOnline:args.isOnline});
    }
  }
})


// Get a single user by clerkId
export const getUserByClerkId = query({
  args:{clerkId:v.string()},
  handler:async(ctx,args)=>{
    return await ctx.db
    .query("users")
    .withIndex("by_clerk_id",(q)=>q.eq("clerkId",args.clerkId))
    .first()
  }
})
