import { google } from "googleapis";

const googleDrive = () => {
  const creds = JSON.parse(
    process.env.GOOGLE_SERVICE_KEY
  ) as NodeJS.GoogleServiceKey;

  const auth = new google.auth.GoogleAuth({
    projectId: creds.project_id,
    credentials: {
      type: creds.type,
      private_key: creds.private_key,
      client_email: creds.client_email,
      client_id: creds.client_id,
    },
    scopes: ["https://www.googleapis.com/auth/drive"],
  });

  return google.drive({ version: "v3", auth });
};

export const driveConfig = {
  uploadFolderId: "15ppwy_3jcgWo-TDQS88k1vmSV6lHb-MO",
  userEmail: "rapterjunky@gmail.com",
} as const;

export const imageConfig = {
  size: 16,
  blur: 2,
  /** 
   * Max Size about 5MB
  */
  maxSize: 5 * 1024 * 1024
} as const

export default googleDrive;
