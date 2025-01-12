export type CloudAuthUser = {
  id: string;
  email?: string;
} | null;

export type User = {
  id: string;
  username: string | null;
  avatar: string;
};

export type Message = {
  id: string;
  text: string;
  createdAt: number;
  userId: string;
};

export type ChatDocument = {
  messages: Message[]
  users: User[]
}

// Create an SHA256 hash of a string
export async function sha256(text: string) {
  // Encode the text as a Uint8Array
  const encoder = new TextEncoder();
  const data = encoder.encode(text);

  // Use the Web Crypto API to hash the data
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);

  // Convert the hash to a hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return hashHex;
}
export const extractUrls = (text: string): string[] =>
  text.match(
    /(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u00a1-\uffff][a-z0-9\u00a1-\uffff_-]{0,62})?[a-z0-9\u00a1-\uffff]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?))(?::\d{2,5})?(?:[/?#]\S*)?/gi
  ) || [];

export type SeparatedUrl = { id: string; type: "text" | "link"; value: string };

export const separateUrls = (text: string, separated: SeparatedUrl[] = []): SeparatedUrl[] => {
  const links = extractUrls(text);

  if (links.length === 0)
    return text ? [...separated, { id: crypto.randomUUID(), type: "text", value: text }] : separated;

  const [link] = links;
  const first = text.substring(0, text.indexOf(link));
  const rest = text.substring(text.indexOf(link) + link.length);

  if (first) {
    return separateUrls(rest, [
      ...separated,
      {  id: crypto.randomUUID(), type: "text", value: first },
      {  id: crypto.randomUUID(), type: "link", value: link },
    ]);
  }

  return separateUrls(rest, [...separated, {  id: crypto.randomUUID(), type: "link", value: link }]);
};
