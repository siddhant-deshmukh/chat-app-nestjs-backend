declare module 'express' {
  interface Request {
    user?: {
      _id: string
    }; // Or JwtPayload if you only attach payload
  }
}