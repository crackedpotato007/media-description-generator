import axios from "axios";
async function main(buffer: string): Promise<string> {
  const data = await axios.post(
    "https://api.imgur.com/3/image",
    {
      image: buffer,
      type: "base64",
    },
    {
      headers: {
        Authorization: "Client-ID " + process.env.IMGUR_CLIENT_ID,
      },
    },
  );
  console.log(data.data);
  if (data.status !== 200 || !data.data.success) {
    throw new Error("Error uploading image");
  }
  return data.data.data.link;
}
export default main;
