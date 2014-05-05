/*
 * jQuery html5finder
 * https://github.com/jgerigmeyer/jquery-html5finder
 *
 * Copyright (c) 2014, Jonny Gerig Meyer
 * All rights reserved.
 *
 * Licensed under the MIT license.
 */

(function ($) {

  'use strict';

  var cache = {};

  var methods = {
    init: function (opts) {
      var options = $.extend({}, $.fn.html5finder.defaults, opts);
      var context = $(this);
      var finder = context.find(options.finderSelector);
      var numberCols = finder.find(options.sectionSelector).length || 1;

      methods.updateNumberCols(finder, numberCols);
      methods.markSelected(finder, opts);
      methods.attachHandler(context, finder, opts);

      return context;
    },

    // We want to be able to treat already-selected items differently
    markSelected: function (finder, opts) {
      var options = $.extend({}, $.fn.html5finder.defaults, opts);
      finder.find(options.itemSelector).filter(options.selected).attr({
        'data-selected': true,
        'checked': 'checked'
      }).data('selected', true);
      finder.find(options.itemSelector).filter(options.notSelected)
        .removeAttr('checked data-selected').data('selected', false);
    },

    updateNumberCols: function (finder, numberCols) {
      finder.data('cols', numberCols).attr('data-cols', numberCols);
    },

    // Define the function for horizontal scrolling:
    // Scrolls to the previous section (so that the active section is centered)
    horzScroll: function (finder, scrollCont, opts, last) {
      var options = $.extend({}, $.fn.html5finder.defaults, opts);
      var scroll = $.Deferred();
      if (options.horizontalScroll) {
        var scrollTarget = 0;
        var currentScroll = scrollCont.scrollLeft();
        var focusSection = finder.find(options.sectionSelector + '.focus');
        var prevSection = focusSection.prev(options.sectionSelector);
        if (prevSection.length) {
          scrollTarget = currentScroll + prevSection.position().left;
          // If the active section is going to be the last section,
          // ...modify scrollTarget so that nothing will be visible to the right
          // ...of active section, instead of scrolling directly to prevSection.
          if (last) {
            scrollTarget = scrollTarget - (
              scrollCont.innerWidth() -
              focusSection.outerWidth() -
              prevSection.outerWidth()
            );
          }
        }
        if (currentScroll === scrollTarget) {
          scroll.resolve();
        } else {
          $.when(
            scrollCont.animate({scrollLeft: scrollTarget}, 'fast')
          ).done(function () {
            scroll.resolve();
          });
        }
      } else {
        scroll.resolve();
      }
      return scroll.promise();
    },

    addItems: function (data, colName, newCol, context, finder, opts) {
      var options = $.extend({}, $.fn.html5finder.defaults, opts);
      var scrollCont = context.find(options.scrollContainer);
      var items;
      data.colname = colName;
      items = options.itemTplFn(data);
      newCol.find(options.sectionContentSelector).html(items);
      methods.horzScroll(finder, scrollCont, opts);
      if (options.itemsAddedCallback) { options.itemsAddedCallback(items); }
    },

    attachHandler: function (context, finder, opts) {
      var options = $.extend({}, $.fn.html5finder.defaults, opts);
      var scrollCont = context.find(options.scrollContainer);
      finder.on('click', options.itemSelector, function () {
        methods.itemClick(context, finder, $(this), opts);
      });
      // Clicking a disabled input adds focus to that section
      finder.on('click', options.labelSelector, function (e) {
        var el = $(this);
        var section = el.closest(options.sectionSelector);
        if (section.find('#' + el.attr('for')).is(':disabled')) {
          section.addClass('focus').siblings(options.sectionSelector)
            .removeClass('focus');
          methods.horzScroll(finder, scrollCont, opts);
        }
        e.stopPropagation();
      });
      // Clicking empty space (not input or label) adds focus to section
      finder.on('click', options.sectionSelector, function (e) {
        var section = $(this);
        if (!$(e.target).is('input, label')) {
          section.addClass('focus').siblings(options.sectionSelector)
            .removeClass('focus');
          methods.horzScroll(finder, scrollCont, opts);
        }
      });
    },

    itemClick: function (context, finder, thisItem, opts) {
      var options = $.extend({}, $.fn.html5finder.defaults, opts);
      var scrollCont = context.find(options.scrollContainer);
      var container = thisItem.closest(options.sectionSelector);
      var ajaxUrl = options.getAjaxUrl(thisItem);
      var target = container.next(options.sectionSelector);
      var colName, newCol, numberCols;

      // Clicking an already-selected input only scrolls (if applicable),
      // ...adds focus, and empties subsequent sections
      if (thisItem.data('selected') === true) {
        if (!container.hasClass('focus')) {
          container.addClass('focus').siblings(options.sectionSelector)
            .removeClass('focus');
        } else {
          target.addClass('focus').siblings(options.sectionSelector)
            .removeClass('focus');
        }
        target.nextAll(options.sectionSelector).empty();
        target.find(options.itemSelector).filter(options.selected)
          .removeAttr('checked data-selected').data('selected', false);
        $.when(methods.horzScroll(finder, scrollCont, opts)).done(function () {
          target.nextAll(options.sectionSelector).remove();
          numberCols = finder.find(options.sectionSelector).length;
          methods.updateNumberCols(finder, numberCols);
        });
        if (thisItem.data('children') && options.itemSelectedCallback) {
          options.itemSelectedCallback(thisItem);
        }
      } else {
        // Last-child section only receives focus on-click by default
        if (!thisItem.data('children')) {
          container.addClass('focus').siblings(options.sectionSelector)
            .removeClass('focus');
          $.when(
            methods.horzScroll(finder, scrollCont, opts, true)
          ).done(function () {
            container.nextAll(options.sectionSelector).remove();
            numberCols = finder.find(options.sectionSelector).length;
            methods.updateNumberCols(finder, numberCols);
          });
          if (options.lastChildSelectedCallback) {
            options.lastChildSelectedCallback(thisItem);
          }
        } else {
          var addOrReplaceTargetCol = function () {
            numberCols = container.prevAll(options.sectionSelector).addBack()
              .removeClass('focus').length + 1;
            methods.updateNumberCols(finder, numberCols);
            colName = 'col' + numberCols.toString();
            newCol = options.columnTplFn({colname: colName});
            if (target.length) {
              target.nextAll(options.sectionSelector).remove();
              target.replaceWith(newCol);
            } else {
              container.after(newCol);
            }
            // Use cached data, if exists (and ``option.cache: true``)
            if (options.cache && cache[ajaxUrl]) {
              var response = cache[ajaxUrl];
              methods.addItems(
                response,
                colName,
                newCol,
                context,
                finder,
                opts
              );
            } else {
              // Add loading screen while waiting for Ajax call to return data
              if (options.loading) { newCol.loadingOverlay(); }
              $.when($.get(ajaxUrl)).done(function (response) {
                if (options.cache) { cache[ajaxUrl] = response; }
                // Add returned data to the next section
                methods.addItems(
                  response,
                  colName,
                  newCol,
                  context,
                  finder,
                  opts
                );
              }).always(function () {
                if (options.loading) { newCol.loadingOverlay('remove'); }
              });
            }
          };
          // If the target section already exists and doesn't have focus...
          if (target.length && !target.hasClass('focus')) {
            // First empty target section & scroll, then add or replace target.
            target.nextAll(options.sectionSelector).addBack().empty();
            target.addClass('focus').siblings(options.sectionSelector)
              .removeClass('focus');
            $.when(
              methods.horzScroll(finder, scrollCont, opts, true)
            ).done(function () {
              addOrReplaceTargetCol();
            });
          } else {
            // Otherwise, just add or replace target without scrolling.
            addOrReplaceTargetCol();
          }
          if (options.itemSelectedCallback) {
            options.itemSelectedCallback(thisItem);
          }
        }
        methods.markSelected(finder, opts);
      }
    },

    // Expose internal methods to allow stubbing in tests
    exposeMethods: function () {
      return methods;
    }
  };

  $.fn.html5finder = function (method) {
    if (methods[method]) {
      return methods[method].apply(
        this,
        Array.prototype.slice.call(arguments, 1)
      );
    } else if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error('Method ' + method + ' does not exist on jQuery.html5finder');
    }
  };

  /* Setup plugin defaults */
  /* jshint -W101 */
  $.fn.html5finder.defaults = {
    itemTplFn: null,                    // Fn accepts data, returns rendered items
    columnTplFn: null,                  // Fn accepts data, returns rendered col
    loading: false,                     // If true, adds loading a overlay while waiting for Ajax response
                                        // ...requires jquery.ajax-loading-overlay
                                        // ...https://github.com/jgerigmeyer/django-ajax-loading-overlay
    horizontalScroll: false,            // If true, scrolls to center active section
    scrollContainer: null,              // The container (window) to be scrolled
    selected: 'input:checked',          // A selected element
    notSelected: 'input:not(:checked)', // An unselected element
    finderSelector: '.finder-body',     // Finder container
    sectionSelector: null,              // Sections
    sectionContentSelector: null,       // Content to be replaced by Ajax function
    itemSelector: '.finderinput',       // Selector for items in each section
    labelSelector: '.finderselect',     // Selector for item labels in each section
    itemSelectedCallback: null,         // Callback function,  runs after input in any section (except lastChild) is selected
    lastChildSelectedCallback: null,    // Callback function,  runs after input in last section is selected
    itemsAddedCallback: null,           // Callback function,  runs after new items are added
    cache: true,                        // If true, ajax response data will be cached
    getAjaxUrl: function (item) {       // Function that returns the ajax-url to get an item's children
      return item.data('url');
    }
  };
  /* jshint +W101 */
}(jQuery));
