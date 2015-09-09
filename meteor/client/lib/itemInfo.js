(function ($) {
    $.fn.itemInfo = function (options) {

      // Defaults
      var defaults = {
        delay: 350
      };

      // Remove tooltip from the activator
      if (options === "remove") {
        this.each(function(){
          $('#' + $(this).attr('data-tooltip-id')).remove();
        });
        return false;
      }

      options = $.extend(defaults, options);
      var counterInterval = null;

      return this.each(function(){
        var timeout = null,
        started = false,
        margin = 5;

        var container = $(this);

         //Destroy previously binded events
        container.off('mouseenter.item-info-tooltip mouseleave.item-info-tooltip', '.item-infoed');
          // Mouse In
        container.on('mouseenter.item-info-tooltip', '.item-infoed', function(e) {
          var origin = $(this);

          var existingId = origin.data('tooltip-id');

          var tooltipId = Materialize.guid();
          origin.attr('id', tooltipId);

          // Create Text span
          var tooltip_text = options.contents.clone();

          // Create tooltip
          var tooltip = origin.children('.material-tooltip').first();
          if (!tooltip.length) {
            tooltip = $('<div></div>');
            tooltip.addClass('material-tooltip').append(tooltip_text)
              .appendTo(origin)
              .attr('id', tooltipId);
          }

          var backdrop = origin.find('.backdrop').first();
          if (!backdrop.length) {
            backdrop = $('<div></div>').addClass('backdrop');
            backdrop.appendTo(tooltip);
            backdrop.css({ top: 0, left:0 });
          }

          var tooltip_delay = origin.data("delay");
          tooltip_delay = (tooltip_delay === undefined || tooltip_delay === '') ? options.delay : tooltip_delay;
          var counter = 0;

          clearInterval(counterInterval);

          counterInterval = setInterval(function(){
            counter += 10;
            if (counter >= tooltip_delay && started === false) {
              started = true;
              tooltip.css({ display: 'block', left: '0px', top: '0px' });

              // Tooltip positioning
              var originWidth = origin.outerWidth();
              var originHeight = origin.outerHeight();
              var tooltipPosition =  origin.attr('data-position');
              var tooltipHeight = tooltip.outerHeight();
              var tooltipWidth = tooltip.outerWidth();
              var tooltipVerticalMovement = '0px';
              var tooltipHorizontalMovement = '0px';
              var scale_factor = 8;

              if (tooltipPosition === "top") {
              // Top Position
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
            else {
              // Bottom Position
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
            scale_factor = tooltipWidth / 8;
            if (scale_factor < 8) {
              scale_factor = 8;
            }
            if (tooltipPosition === "right" || tooltipPosition === "left") {
              scale_factor = tooltipWidth / 10;
              if (scale_factor < 6)
                scale_factor = 6;
            }

            tooltip.velocity({ marginTop: tooltipVerticalMovement, marginLeft: tooltipHorizontalMovement}, { duration: 350, queue: false })
              .velocity({opacity: 1}, {duration: 300, delay: 50, queue: false});
            backdrop.css({ display: 'block' })
            .velocity({opacity:1},{duration: 55, delay: 0, queue: false})
            .velocity({scale: scale_factor}, {duration: 300, delay: 0, queue: false, easing: 'easeInOutQuad'});

          }
        }, 10); // End Interval
      });

      // Mouse Out
      container.on('mouseleave.item-info-tooltip', '.item-infoed', function(){
        // Reset State
        clearInterval(counterInterval);
        var counter = 0;

        var origin = $(this);
        var tooltip = origin.children('.material-tooltip').first();
        var backdrop = origin.find('.backdrop').first();

        // Animate back
        tooltip.velocity({
          opacity: 0, marginTop: 0, marginLeft: 0}, { duration: 225, queue: false, delay: 225 }
        );
        backdrop.velocity({opacity: 0, scale: 1}, {
          duration:225,
          delay: 275, queue: false,
          complete: function(){
            backdrop.css('display', 'none');
            tooltip.css('display', 'none');
            started = false;}
        });
      });
    });
  };
}( jQuery ));