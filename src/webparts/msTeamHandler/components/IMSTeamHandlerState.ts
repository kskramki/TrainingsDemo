import { IGroupItem } from "./IGroupItem";

export interface IMSTeamHandlerState
{
Teamstitle :string;
groups:Array<IGroupItem>;
doptions:Array<any>;
users:Array<any>;
//selectedGroup:string | number;
//selectedUser:string | number;
isHidden:boolean;
}