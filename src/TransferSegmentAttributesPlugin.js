import React from 'react';
import { VERSION } from '@twilio/flex-ui';
import { FlexPlugin } from 'flex-plugin';

const PLUGIN_NAME = 'TransferSegmentAttributesPlugin';

export default class TransferSegmentAttributesPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  /**
   * This code is run when your plugin is being started
   * Use this to modify any UI components or attach to the actions framework
   *
   * @param flex { typeof import('@twilio/flex-ui') }
   * @param manager { import('@twilio/flex-ui').Manager }
   */
  init(flex, manager) {

    flex.Actions.addListener('beforeCompleteTask', async (payload) => {
      console.debug('***My beforeCompleteTask callback***', payload);
      const { task } = payload;
      const { source } = task;
      const { transfers } = source;
      const incomingTransfer = transfers && transfers.incoming;
      const { attributes } = task;
      const { conversations } = attributes;

      const conversationAttribute3 = conversations && conversations.conversation_attribute_3;
      const { email } = manager.workerClient.attributes;

      let shouldUpdateAttributes = false;
      let newAttributes = {
        ...attributes,
        conversations: {
          ...conversations
        }
      }
      if (conversationAttribute3 !== email ) {
        newAttributes.conversations.conversation_attribute_3 = email;
        shouldUpdateAttributes = true;
      }

      if (incomingTransfer) {
        const { mode } = incomingTransfer;
        const receivingWorker = incomingTransfer.to;
        const workerSid = manager.workerClient.sid;
        if (receivingWorker === workerSid) {
          newAttributes.conversations.conversation_attribute_1 = `${mode} TRANSFER`;
        }
        shouldUpdateAttributes = true;
      }

      if (shouldUpdateAttributes) {
        await task.setAttributes(newAttributes);
      }

    });
  }
}
