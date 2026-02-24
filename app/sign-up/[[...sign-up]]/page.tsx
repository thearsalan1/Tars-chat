import { SignUp } from '@clerk/nextjs'
import React from 'react'

const page = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <SignUp />
    </div>
  )
}

export default page