export interface DatabaseError {
  cause?: {
    code?: string;
    constraint?: string;
  };
}
