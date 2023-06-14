'use client'
import { GoogleOAuthProvider } from '@react-oauth/google'
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID as string

const GoogleLoginWrapper = ({ children }: any) => {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {children}
    </GoogleOAuthProvider>
  )
}

export default GoogleLoginWrapper
