$(function(){
  'use strict';
  // Fetch pages fresh when navigating, so a cached old copy never comes back.
  $.ajaxSetup({ cache: false });
  var $page = $('#main'),
      options = {
        debug: false,
        prefetch: true,
        cacheLength: 2,
        forms: 'form',
        blacklist: '.no-smoothState',
        onStart: {
          duration: 750, // Duration of our animation
          render: function ($container) {
            // Add your CSS animation reversing class
            $container.addClass('is-exiting');
            // Restart your animation
            smoothState.restartCSSAnimations();
          }
        },
        onReady: {
          duration: 0,
          render: function ($container, $newContent) {
            // Remove your CSS animation reversing class
            $container.removeClass('is-exiting');
            // Inject the new content
            $container.html($newContent);
          }
        }
      },
      smoothState = $page.smoothState(options).data('smoothState');
});
