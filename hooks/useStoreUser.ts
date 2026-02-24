"use client"

import { api } from "@/convex/_generated/api"
import {useUser} from "@clerk/nextjs"
import { useMutation } from "convex/react"
import { useEffect } from "react"


export function useStoreUser() {
  const {user,isLoaded} = useUser();
  const upsertUser = useMutation(api.users.upsertUser);

  useEffect(()=>{
    if(!isLoaded || !user) return;

    upsertUser({
      clerkId:user.id,
      name:user.fullName ?? user.username ?? "Anonymous",
      email:user.emailAddresses[0]?.emailAddress ?? "",
      imageUrl:user.imageUrl ?? "",
    });
  },[isLoaded,user,upsertUser]);
  return {isLoaded,user};
}