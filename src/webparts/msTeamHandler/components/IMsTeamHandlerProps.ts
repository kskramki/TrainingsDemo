import { MSGraphClient } from "@microsoft/sp-http";

export interface IMsTeamHandlerProps {
  TeamTitle: string;
  client :MSGraphClient;
}
