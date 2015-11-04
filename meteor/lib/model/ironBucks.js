IronBucks = {
  name: 'IronBucks',

  getDoc: function(userId) {
    check(userId, String);

    return {
      userId: userId,
      botName: null,
      name: IronBucks.name,
      nameColor: '3F9049',
      type: IronBucks.name,
      descriptions: [{
        type: 'html',
        value: IronBucks.name,
      }],
      tags: [],
      itemId: '0',
      amount: '0',
      marketable: 1,
      tradable: 1,
      classId: '0',
      instanceId: '0',
      iconURL: '/images/cash.png',
      tradeofferId: '0',
      status: 'STASH',
      deleteInd: false,
      createdTimestamp: new Date(),
      modifiedTimestamp: new Date()
    };
  }
};