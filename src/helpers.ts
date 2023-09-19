// TODO: This is temporary, will be replaced by a proper random id generator
export function randomId() {
  return Math.random().toString(36).substring(7)
}
