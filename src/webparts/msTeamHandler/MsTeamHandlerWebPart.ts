import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';

import * as strings from 'MsTeamHandlerWebPartStrings';
import MSTeamHandler from './components/MsTeamHandler';
import { IMsTeamHandlerProps } from './components/IMsTeamHandlerProps';
import { MSGraphClient } from '@microsoft/sp-http';

export interface IMsTeamHandlerWebPartProps {
  description: string;
  MSTeamTitle:string;
}

export default class MsTeamHandlerWebPart extends BaseClientSideWebPart<IMsTeamHandlerWebPartProps> {

  public render(): void {
    // let domElement = document.createElement("div");
    //  this.domElement.appendChild(domElement); 

    
     this.context.statusRenderer.displayLoadingIndicator(this.domElement,"Loading... Please Wait..",900);
     //just to check the custom loading message added settimeout
      setTimeout(() => {
      this.context.statusRenderer.clearLoadingIndicator(this.domElement);
    this.context.msGraphClientFactory.getClient()
    .then((grphclient: MSGraphClient): void => {
      const element: React.ReactElement<IMsTeamHandlerProps > = React.createElement(
        MSTeamHandler,
        {
          
          TeamTitle: this.properties.MSTeamTitle,
        client:grphclient
        });
        ReactDom.render(element, this.domElement);
      });
     },5000);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.TeamTitle
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('MSTeamTitle', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
