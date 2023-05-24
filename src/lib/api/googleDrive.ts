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

export default googleDrive;
