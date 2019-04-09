import * as React from 'react';
import styles from './MsTeamHandler.module.scss';
import { IMsTeamHandlerProps } from './IMsTeamHandlerProps';
import { escape } from '@microsoft/sp-lodash-subset';
import {IMSTeamHandlerState} from './IMSTeamHandlerState';
import { IGroupItem,IUserItem } from './IGroupItem';
import {DetailsList,  DetailsListLayoutMode,CheckboxVisibility,SelectionMode,Dropdown,DropdownMenuItemType,IDropdownOption} from 'office-ui-fabric-react';
var officeUsers: Array<IDropdownOption> = new Array<IDropdownOption>();
var selectedGroup :string |Number =null;
var selectedUser :string| Number=null;
export default class MsTeamHandler extends React.Component<IMsTeamHandlerProps, IMSTeamHandlerState> {

  public constructor(props)
  {
    super(props);
    this.state={
  Teamstitle:"",
  groups:[],
  doptions:[],
 users:[],
 isHidden:true
 


};
this.handleChange = this.handleChange.bind(this);
this.CreateTeam =this.CreateTeam.bind(this);
this.getGroupHavingTeams =this.getGroupHavingTeams.bind(this);
this.AddMember =this.AddMember.bind(this);
this.getUsers = this.getUsers.bind(this);
this._onChange = this._onChange.bind(this);
this._onUserNameChange = this._onUserNameChange.bind(this);

  }
  //Compopnent Mount 
public componentDidMount ()
{

 //need User.ReadBasic.All
this.props.client.api("/users/").version("beta").get().then(response=>{
  console.log(response);
 response.value.map((item:any)=>{officeUsers.push({key:item.id,text:item.displayName});});
  if(response['@odata.nextLink']!=null)
  {
    this.getUsers(response['@odata.nextLink']);
  }
this.setState({
  users:officeUsers
});
}
  );
  
  this.getGroupHavingTeams();
}


//Get all users with paging.
private getUsers(nexturl:string):void
{
  this.props.client.api(nexturl).get().then(response=>{
//console.log(response)
response.value.map((item:any)=>{officeUsers.push({key:item.id,text:item.displayName});});
if(response['@odata.nextLink']!=null)
  {
    this.getUsers(response['@odata.nextLink']);
  }
});
// this.setState({
//   users:officeUsers
// });
}

//Get all groups in the tenant which is having Teams in group.
//V1.0 - /groups?$select=id,resourceProvisioningOptions
//this.props.client.api("/groups?$select=id,resourceProvisioningOptions").get(this.SuccessFailureCallBack);
  private getGroupHavingTeams():void
  {
  this.props.client.api("/groups?$filter=resourceProvisioningOptions/Any(x:x eq 'Team')").version('beta').get().then(response=>{
    //console.log(response)
    var groups: Array<IGroupItem> = new Array<IGroupItem>();
    var dpoptions :Array<IDropdownOption> = new Array<IDropdownOption>();
    response.value.map(((item:any)=>{
      groups.push({displayName:item.displayName,id:item.id});
      dpoptions.push({key:item.id,text:item.displayName});
    }));
    this.setState(
      {
        groups: groups,
        doptions:dpoptions
      }
    ); 
    });
  }
private SuccessFailureCallBack(err:any,response:any,rawresponse?:any)
{
 // console.log("First : ",err ,"Second ",response,"thirs", rawresponse);
  if(rawresponse!=null && rawresponse.status =="202")
  alert("Created Succesfully");
  else if(rawresponse!=null && rawresponse.status =="204")
  alert("Successfully Added");
  else{
    console.log("Error:", err, "Response :" ,response, "Rawresponse",rawresponse );
    alert("Error:Please check the console");
  }
}

private handleChange(event):void  {
  this.setState({Teamstitle: event.target.value});
}
//Create MS team using GraphAPI beta version
  private CreateTeam()
{
  let TT= this.state.Teamstitle;
  var content;
  if(TT!=null && TT!="")
  {
    content =`{
    "template@odata.bind": "https://graph.microsoft.com/beta/teamsTemplates('standard')",
    "displayName": "` +TT +`",
    "description": "Created using GraphAPI from SPFx"
  }`;
  this.props.client.api("/teams").version("beta").post(content,this.SuccessFailureCallBack);
}

console.log(content);
}

//Add member into the Teams
private AddMember() {
  console.log("Group" + selectedGroup , "User", selectedUser);
  if(selectedGroup!=null&& selectedUser !=null)
  {
this.props.client.api('/groups/'+selectedGroup+'/members/$ref').post('{ "@odata.id": "https://graph.microsoft.com/v1.0/directoryObjects/'+selectedUser+'"}',this.SuccessFailureCallBack);
  }
}

//Selection Handler for DropDown
 private _onSelect(event: React.FormEvent<HTMLDivElement>, item?: IDropdownOption):void{
   alert(item.text);
 }
 private _onChange = (item: IDropdownOption,index:Number): void => {
  console.log(`Selection change: ${item.text} ${item.selected ? 'selected' : 'unselected'}`);
  selectedGroup=item.key;
  if(selectedGroup!=null && selectedUser!=null)
 {
  this.setState({isHidden:false});
 }
  
}
private _onUserNameChange = (item: IDropdownOption,index:Number): void => {
  console.log(`Selection change: ${item.key} ${item.selected ? 'selected' : 'unselected'}`);
 selectedUser=item.key;
 if(selectedGroup!=null && selectedUser!=null)
 {
  this.setState({isHidden:false});
 }
}

  public render(): React.ReactElement<IMsTeamHandlerProps> {

   // console.log(dpoptions);
    let _usersListColumns = [
      {
        key: 'displayName',
        name: 'Group Display name',
        fieldName: 'displayName',
        minWidth: 50,
        maxWidth: 150,
        isResizable: true
      },
      {
        key: 'id',
        name: 'ID',
        fieldName: 'id',
        minWidth: 150,
        maxWidth: 250,
        isResizable: true
      },
     
    ];
    return (
      <div className={ styles.msTeamHandler }>
        <div className={ styles.container }>
          <div className={ styles.row }>
            <div className={ styles.column }>
            
              <span className={ styles.title }>Creating Team  </span> 
              
              <input placeholder="Please enter Team Title" type="text" id="txtteamtitle" value= {this.state.Teamstitle} onChange={this.handleChange}></input>
              <button value="Create" id="btnCreateTeam" onClick={this.CreateTeam}>Create Team</button>
              </div>
          </div>
          <div className={ styles.row }>
            <div className={ styles.column }>
              
                <span className={ styles.label }>Find below other options</span>
           
            </div>
          </div>
        </div>
       <div className={ styles.container }>
       <div className={ styles.row }>
         <div className={ styles.column }>
         <span className={ styles.label }>Group Names(Having Teams)  </span> 
        <Dropdown
        
        options={this.state.doptions} 
       onChanged = {this._onChange}
        style={ { width: 300 }}
        
         disabled={false}
      />
      </div>
      </div>
      <div className={ styles.row }>
       <div className={ styles.column }>
       <span className={ styles.label }>User Names  </span> 
      <Dropdown
       
        options={this.state.users} 
       onChanged = {this._onUserNameChange}
        style={ { width: 300 }}
        
         disabled={false}
      />
     
     <button disabled={this.state.isHidden}  value="Add Member" id="btnAddMember" onClick={this.AddMember}>Add Team Member</button>
     </div>
      
      </div>
      
      <div className={ styles.row }>
       <div className={ styles.column }>
        <DetailsList
                      items={ this.state.groups }
                      columns={ _usersListColumns }
                      setKey='set'
                      checkboxVisibility={ CheckboxVisibility.hidden }
                      selectionMode={ SelectionMode.none }
                      layoutMode={ DetailsListLayoutMode.fixedColumns }
                      compact={ true }
                      
                  />
                  </div>
        </div>
        </div>
        </div>
    );
  }
}
