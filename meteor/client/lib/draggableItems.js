DraggableItems = {
  draggable: function(containerSelector, targetSelector) {
    // We need to have the mouseover event bound to accound for items being destroyed and recreated in the
    // DOM when people use the search function. This ensures that each item is always draggable
    $(containerSelector).on('mouseover', targetSelector, function() {
      $(this).draggable({
        revert: true,
        revertDuration: 0
      });
    });
  },

  droppable: function(targetSelector, acceptingSelector, callback) {
    $(targetSelector).droppable({
      accept: acceptingSelector,
      hoverClass: 'stash-hover',
      drop: function(e, ui) {
        var itemId = $(ui.draggable[0]).data('itemid');
        callback(itemId);
      }
    });
  }
};