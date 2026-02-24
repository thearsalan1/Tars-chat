import React from 'react'
import {SignIn} from "@clerk/nextjs"

const SingInPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <SignIn />
    </div>
  )
}

export default SingInPage