import { requestPermissions } from "@stayreal/api";
import toast from "solid-toast";

export const promptForPermissions = async (): Promise<void> => {
  const permissions = await requestPermissions();
  if (permissions.status === "granted") return;
  toast.error("Notifications are disabled. Enable them to stay updated.")
}
