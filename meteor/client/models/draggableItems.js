DraggableItems = {
  draggable: function(containerSelector, targetSelector) {
    // We need to have the mouseover event bound to account for items being destroyed and recreated in the
    // DOM when people use the search function. This ensures that each item is always draggable
    $(containerSelector).on('mouseover', targetSelector, function() {
      $(this).draggable({
        revert: true,
        revertDuration: 0,
        start: function(e) {
          var origin = $(e.currentTarget).parent();
          closeTooltip(origin);
        },
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
      },
    });
  },

  itemInfo: {
    inProgress: null,

    intervalId: null,

    mousein: function(e, data) {

      var origin = $(e.currentTarget);

      // Sometimes a mouseout/mousein registers because the draggable item lags
      // behind the mouse a bit, so we need to cancel the mousein if dragging
      if ($(origin).find('img').hasClass('ui-draggable-dragging')) {
        return false;
      }

      if (origin.data('active')) {
        return false;
      }

      origin.data('active', true);

      // Get or create the elements
      var tooltip = getTooltipElement(origin, data);
      var backdrop = getAndAppendBackdropElement(tooltip);

      var next = getAnimateFunction(origin, tooltip, backdrop);


      if (DraggableItems.itemInfo.intervalId) {
        clearInterval(DraggableItems.itemInfo.intervalId);
      }

      // I put this setInterval here to handle cases where the mouse is moved
      // on top of the disappearing tooltip to another item, causing multiple occurances of mouseenter
      // It keeps trying to animate as long as the other one is closing
      DraggableItems.itemInfo.intervalId = setInterval(function() {
        if (!DraggableItems.itemInfo.inProgress) {
          DraggableItems.itemInfo.inProgress = true;

          // Clear our own interval
          clearInterval(DraggableItems.itemInfo.intervalId);

          // execute the animate
          next();
        }
      }, 500);

      return false;
    },

    mouseout: function(e) {
      var origin = $(e.currentTarget);

      return closeTooltip(origin);
    }
  }
};

function closeTooltip(origin) {

  // Reset State
  clearInterval(DraggableItems.itemInfo.intervalId);
  DraggableItems.itemInfo.intervalId = null;

  var tooltip = origin.children('.material-tooltip').first();
  var backdrop = origin.find('.backdrop').first();

  // Reset the active attribute so it opens again next time
  origin.data('active', false);

  // Animate back
  tooltip.velocity({
    opacity: 0, marginTop: 0, marginLeft: 0}, { duration: 0, queue: false, delay: 0 }
  );

  backdrop.velocity({opacity: 0, scale: 1}, {
    duration:0,
    delay: 0, queue: false,
    complete: function(){
      backdrop.css('display', 'none');
      tooltip.css('display', 'none');
    }
  });

  return false;
}

function findIndex(list, str, start) {
  var start = start || 0;
  for (var i = start; i < list.length; i++) {
    if (list[i].value === str) {
      return i;
    }
  }
  return -1;
}

function createTooltipHtml(data) {
  var tooltipElement = $('<div></div>');
  tooltipElement.addClass('item-tooltip-contents');

  //TODO: this is a huge hack, but whatever
  if(data.name === IronBucks.name) {
    data = _.extend({}, data);
    data.name = "Cash";
  }

  if (data.name) {
    var title = $('<div>' + data.name + '</div>');
    title.addClass('item-info-title');

    if (data.nameColor) {
      title.css('color', '#' + data.nameColor);
    }

    tooltipElement.append(title);
  }

  // blacklist certain items from having descriptions
  if (ItemDescriptionParser.ignoreTypeSub.indexOf(data.type) === -1) {
    var typeElem = $('<div>' + data.type + '</div>');
    typeElem.addClass('item-info-type');
    tooltipElement.append(typeElem);
  }

  // Add descriptions for certain types
  var descriptionElems = ItemDescriptionParser.getJqueryElement(data);
  _.each(descriptionElems, function($newDiv) {
    tooltipElement.append($newDiv);
  });

  // Add badge if not tradable
  if (data.tradable === 0) {
    var $notTradable = $('<div><span>NOT TRADEABLE</span></div>');
    $notTradable.addClass('not-tradable');
    tooltipElement.append($notTradable);
  }

  //add item prices
  if(data.prices) {
    var $prices = $('<div><div class="price-label">Median Price</div><div>$' + data.prices.median_price + '</div>' +
                    '<div class="price-label">Price Range</div><div>$' + data.prices.lowest_price + ' - $' +
                    data.prices.highest_price + '</div>' +
                    '<div class="price-label">Trading Volume</div><div>' +  data.prices.volume + '</div></div>');
    $prices.addClass("item-info-type");
    tooltipElement.append($prices);
  }
  return tooltipElement;
}

function getTooltipElement(origin, data) {

  // Create tooltip
  var tooltip = origin.children('.material-tooltip').first();

  if (!tooltip.length) {
    // Create HTML
    var tooltipElement = createTooltipHtml(data);

    tooltip = $('<div></div>');
    tooltip.addClass('material-tooltip').append(tooltipElement)
      .attr('id', Random.id())
      .appendTo(origin)
  }

  return tooltip;
}

function getAndAppendBackdropElement(tooltip) {
  var backdrop = tooltip.children('.backdrop').first();
  if (!backdrop.length) {
    backdrop = $('<div></div>').addClass('backdrop');
    backdrop.appendTo(tooltip);
    backdrop.css({ top: 0, left:0 });
  }

  return backdrop;
}

// TODO: Remove the function return and just have it execute
function getAnimateFunction(origin, tooltip, backdrop) {

  return function() {
    var options = {
      delay: 50,
      position: 'left'
    };
    var margin = 5;

    // Log that we are using it so we don't call it again on ourselves
    origin.data('active', true);

    tooltip.css({ display: 'block', left: '0px', top: '0px' });

    // Tooltip positioning
    var originWidth = origin.outerWidth();
    var originHeight = origin.outerHeight();
    var tooltipPosition =  options.position;
    var tooltipHeight = tooltip.outerHeight();
    var tooltipWidth = tooltip.outerWidth();
    var tooltipVerticalMovement = '0px';
    var tooltipHorizontalMovement = '0px';
    var scale_factor = 8;

    // Makes a halfway decent attempt to deal with tooltips moving out of view
    if (tooltipPosition === "top") {
      if (origin.offset().top < tooltipHeight) {
        tooltipPosition = 'bottom';
      }
    } else if (tooltipPosition === "left") {
      if (origin.offset().left < tooltipWidth) {
        tooltipPosition = 'right';
      }
    } else if (tooltipPosition === "right") {
      if (window.innerWidth - origin.offset().left + originWidth < tooltipWidth) {
        tooltipPosition = 'left';
      }
    } else {
      if (window.innerHeight - origin.offset().top + originHeight < tooltipHeight) {
        tooltipPosition = 'top';
      }
    }

    // Top Position
    if (tooltipPosition === "top") {
      tooltip.css({
        top: origin.offset().top - tooltipHeight - margin,
        left: origin.offset().left + originWidth/2 - tooltipWidth/2
      });
      tooltipVerticalMovement = '-10px';
      backdrop.css({
        borderRadius: '14px 14px 0 0',
        transformOrigin: '50% 90%',
        marginTop: tooltipHeight,
        marginLeft: (tooltipWidth/2) - (backdrop.width()/2)

      });
    }
    // Left Position
    else if (tooltipPosition === "left") {
      tooltip.css({
        top: origin.offset().top + originHeight/2 - tooltipHeight/2,
        left: origin.offset().left - tooltipWidth - margin
      });
      tooltipHorizontalMovement = '-10px';
      backdrop.css({
        width: '14px',
        height: '14px',
        borderRadius: '14px 0 0 14px',
        transformOrigin: '95% 50%',
        marginTop: tooltipHeight/2,
        marginLeft: tooltipWidth
      });
    }
    // Right Position
    else if (tooltipPosition === "right") {
      tooltip.css({
        top: origin.offset().top + originHeight/2 - tooltipHeight/2,
        left: origin.offset().left + originWidth + margin
      });
      tooltipHorizontalMovement = '+10px';
      backdrop.css({
        width: '14px',
        height: '14px',
        borderRadius: '0 14px 14px 0',
        transformOrigin: '5% 50%',
        marginTop: tooltipHeight/2,
        marginLeft: '0px'
      });
    }
    // Bottom Position
    else {
      tooltip.css({
        top: origin.offset().top + origin.outerHeight() + margin,
        left: origin.offset().left + originWidth/2 - tooltipWidth/2
      });
      tooltipVerticalMovement = '+10px';
      backdrop.css({
        marginLeft: (tooltipWidth/2) - (backdrop.width()/2)
      });
    }

    // Calculate Scale to fill
    scale_factor = Math.max(tooltipHeight, tooltipWidth) / 4;

    if (scale_factor < 8) {
      scale_factor = 8;
    }
    if (tooltipPosition === "right" || tooltipPosition === "left") {
      // scale_factor = tooltipWidth / 10;
      if (scale_factor < 10)
        scale_factor = 10;
    }

    tooltip.velocity({ marginTop: tooltipVerticalMovement, marginLeft: tooltipHorizontalMovement}, { duration: 350, queue: false })
      .velocity({opacity: 1}, {duration: 300, delay: 50, queue: false });

    backdrop.css({ display: 'block' })
      .velocity({opacity: 0.98},{duration: 85, delay: 0, queue: false})
      .velocity({scale: scale_factor},{
        duration: 300,
        delay: 50,
        queue: false,
        easing: 'easeInOutQuad',
        complete: function() {
          DraggableItems.itemInfo.inProgress = false;
        }
      });
  };
}

var ItemDescriptionParser = {

  // Do not display the type if it is in this array
  ignoreTypeSub: [ IronBucks.name, undefined ],

  itemType: {
    CSGO_Type_WeaponCase: function(data) {
      var elems = [];

      // We have to parse this a bit to make it presentable
      if (data.descriptions && data.descriptions.length) {
        var start = findIndex(data.descriptions, 'Contains one of the following:') + 1;
        var end = findIndex(data.descriptions, ' ', start);

        if (start !== -1 && end !== -1) {
          var containerItems = data.descriptions.slice(start, end);

          _.each(containerItems, function(item) {
            var $newDiv = $('<div></div>');
            $newDiv.css('color', '#' + item.color);
            $newDiv.addClass('container-items');
            $newDiv.text(item.value);
            elems.push($newDiv);
          });
        }
      }

      return elems;
    },

    IronBucks: function(data) {
      var $newDiv = $('<div></div>');
      $newDiv.addClass('container-items');
      $newDiv.addClass('ironbucks-amount');

      var otherText;
      var amount;

      if (data.amount > 0) {
        amount = data.amount;
        otherText = '';
      } else {
        amount = Meteor.user().profile.ironBucks;
        otherText = ' available';
      }

      $newDiv.text('$' + amount + otherText);
      return $newDiv;
    },

    Weapon: function(data) {
      var elems = [];

      _.each(data.descriptions, function(item) {

        // Collection name
        if (item.value && item.value.indexOf('Collection') > -1) {
          var $newDiv = $('<div></div>');
          $newDiv.css('color', '#' + item.color);
          $newDiv.addClass('item-coll-desc');
          $newDiv.text(item.value);
          elems.push($newDiv);
        }
      });

      if (data.floatValue !== undefined && data.floatValue !== null) {
          var $newDiv = $('<div><div class="price-label">Float Value</div>' + data.floatValue.toFixed(5) + '</div>');
          $newDiv.addClass('item-info-type');
          // $newDiv.text('Float Value: ' + ;
          elems.push($newDiv);
      }

      return elems;
    },
  },

  getJqueryElement: function(data) {
    var elems = [];

    //  if it is a weapon case, get the constituents
    if (!!_.findWhere(data.tags, { internal_name: 'CSGO_Type_WeaponCase' })) {
      elems = ItemDescriptionParser.itemType.CSGO_Type_WeaponCase(data);
    } else if (!!_.findWhere(data.tags, { category: 'Weapon' })) {
      elems = ItemDescriptionParser.itemType.Weapon(data);
    } else if (data.type === IronBucks.name) {
      elems = ItemDescriptionParser.itemType.IronBucks(data);
    }

    return elems;
  }
};
