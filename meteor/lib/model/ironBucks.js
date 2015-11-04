IronBucks = {
  getDoc: function(userId) {
    return {
      userId: userId,
      botName: null,
      name: 'IronBucks',
      nameColor: '3F9049',
      type: 'IronBucks',
      descriptions: [{
        type: 'html',
        value: 'IronBucks'
      }],
      tags: [],
      itemId: '0',
      amount: '0',
      marketable: 1,
      tradable: 1,
      classId: '0',
      instanceId: '0',
      iconURL: 'images/cash.png',
      tradeofferId: '0',
      status: 'STASH',
      deleteInd: false,
      createdTimestamp: new Date(),
      modifiedTimestamp: new Date()
    };
  }
};