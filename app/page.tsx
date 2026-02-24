"use client"

import ChatArea from "@/components/ChatArea"
import Sidebar from "@/components/Sidebar"
import { useStoreUser } from "@/hooks/useStoreUser"
import { useUser } from "@clerk/clerk-react"
import { useState } from "react"

export default function Home() {
  const {isLoaded} = useStoreUser();
  const {user} = useUser();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  
  const [showChat,setShowChat] = useState(false);

  if(!isLoaded || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-600" />
      </div>
    )
  }

  const handleSelectConversation = (conversationId: string) => {
  setSelectedConversationId(conversationId);
  setShowChat(true)
};


  
const handleBack = () => {
  setShowChat(false)
  setSelectedConversationId(null);
};


  return (
    <div className="flex h-screen bg-slate-100">
      {/* Slidebar - hidden on mobile when chat is open */}
      <div className={`${showChat ? "hidden" : "flex"} w-full flex-col md:flex md:w-80 lg:w-96 border-r border-slate-200 bg-white`}>
        <Sidebar currentUserId={user.id} seletedConversationId={selectedConversationId}
        onSelectConversation={handleSelectConversation}/>
      </div>

      {/* chat area */}
      <div className={`${
          showChat ? "flex" : "hidden"
        } flex-1 flex-col md:flex`}>
          {selectedConversationId ? (
            <ChatArea
            conversationId={selectedConversationId}
            currentUserId={user.id}
            onBack={handleBack}
            />
          ):(
          <div className="flex flex-1 items-center justify-center text-slate-400">
            <div className="text-center">
              <p className="text-2xl mb-2">💬</p>
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-sm">
                Choose someone from the sidebar to start chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}  
