export const VERSION = 0;

export function apply(document: FirebaseFirestore.DocumentData) {
  return {
    ...document,
    version: VERSION,
  };
}
