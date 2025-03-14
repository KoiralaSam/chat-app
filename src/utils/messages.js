export default function generateMessage({ username, text }) {
  return {
    username,
    text,
    createdAt: new Date().getTime(),
  };
}
