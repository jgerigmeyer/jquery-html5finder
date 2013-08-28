/*! HTML5 Finder - v0.2.0 - 2013-08-28
* https://github.com/jgerigmeyer/jquery-html5finder
* Copyright (c) 2013 Jonny Gerig Meyer; Licensed MIT */
(function ($) {

    'use strict';

    var cache = {};

    var methods = {
        init: function (opts) {
            var options = $.extend({}, $.fn.html5finder.defaults, opts);
            var context = $(this);
            var finder = context.find('.finder');
            var numberCols = finder.find(options.sectionSelector).length || 1;

            methods.updateNumberCols(finder, numberCols);
            methods.markSelected(finder, opts);
            methods.attachHandler(context, finder, opts);
        },

        // We want to be able to treat already-selected items differently
        markSelected: function (finder, opts) {
            var options = $.extend({}, $.fn.html5finder.defaults, opts);
            finder.find(options.selected).data('selected', true);
            finder.find(options.notSelected).data('selected', false);
        },

        updateNumberCols: function (finder, numberCols) {
            finder.data('cols', numberCols).attr('data-cols', numberCols);
        },

        // Define the function for horizontal scrolling:
        // Scrolls to the previous section (so that the active section is centered)
        horzScroll: function (finder, scrollCont, opts) {
            var options = $.extend({}, $.fn.html5finder.defaults, opts);
            if (options.horizontalScroll === true) {
                var scrollTarget;
                var currentScroll = scrollCont.scrollLeft();
                if (!finder.find(options.sectionSelector + '.focus').prev(options.sectionSelector).length) {
                    scrollTarget = 0;
                } else {
                    scrollTarget = currentScroll + finder.find(options.sectionSelector + '.focus').prev(options.sectionSelector).position().left;
                }
                scrollCont.animate({scrollLeft: scrollTarget});
            }
        },

        addItems: function (data, colName, newCol, context, finder, opts) {
            var options = $.extend({}, $.fn.html5finder.defaults, opts);
            var scrollCont = context.find(options.scrollContainer);
            var items;
            data.colname = colName;
            items = options.itemTplFn(data);
            newCol.find(options.sectionContentSelector).html(items);
            methods.horzScroll(finder, scrollCont, opts);
            if (options.loading === true) {
                newCol.loadingOverlay('remove');
            }
        },

        attachHandler: function (context, finder, opts) {
            var options = $.extend({}, $.fn.html5finder.defaults, opts);
            finder.on('click', options.itemSelector, function () {
                methods.itemClick(context, finder, $(this), opts);
            });
        },

        itemClick: function (context, finder, thisItem, opts) {
            var options = $.extend({}, $.fn.html5finder.defaults, opts);
            var scrollCont = context.find(options.scrollContainer);
            var container = thisItem.closest(options.sectionSelector);
            var ajaxUrl = thisItem.data('url');
            var target = container.next(options.sectionSelector);
            var colName, newCol, numberCols;

            // Clicking an already-selected input only scrolls (if applicable), adds focus, and empties subsequent sections
            if (thisItem.data('selected') === true) {
                if (!container.hasClass('focus')) {
                    container.addClass('focus').siblings(options.sectionSelector).removeClass('focus');
                } else {
                    target.addClass('focus').siblings(options.sectionSelector).removeClass('focus');
                }
                target.find('input:checked').removeAttr('checked').data('selected', false);
                target.nextAll(options.sectionSelector).remove();
                numberCols = finder.find(options.sectionSelector).length;
                methods.updateNumberCols(finder, numberCols);
                methods.horzScroll(finder, scrollCont, opts);
                if (thisItem.data('children') && options.callback) {
                    options.callback();
                }
            } else {
                // Last-child section (input with no children) only receives focus on-click by default
                if (!thisItem.data('children')) {
                    container.addClass('focus').siblings(options.sectionSelector).removeClass('focus');
                    container.nextAll(options.sectionSelector).remove();
                    numberCols = finder.find(options.sectionSelector).length;
                    methods.updateNumberCols(finder, numberCols);
                    if (options.lastChildCallback) {
                        options.lastChildCallback(thisItem);
                    }
                } else {
                    numberCols = container.prevAll(options.sectionSelector).addBack().removeClass('focus').length + 1;
                    methods.updateNumberCols(finder, numberCols);
                    colName = 'col' + numberCols.toString();
                    newCol = options.columnTplFn({colname: colName});
                    container.nextAll(options.sectionSelector).remove();
                    container.after(newCol);
                    // Add a loading screen while waiting for the Ajax call to return data
                    if (options.loading === true) {
                        newCol.loadingOverlay();
                    }
                    if (cache[thisItem.attr('id')]) {
                        var response = cache[thisItem.attr('id')];
                        methods.addItems(response, colName, newCol, context, finder, opts);
                    } else {
                        // Add returned data to the next section
                        $.get(
                            ajaxUrl,
                            function (response) {
                                cache[thisItem.attr('id')] = response;
                                methods.addItems(response, colName, newCol, context, finder, opts);
                            },
                            'json'
                        );
                    }
                    if (options.callback) {
                        options.callback();
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
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.html5finder');
        }
    };

    /* Setup plugin defaults */
    $.fn.html5finder.defaults = {
        itemTplFn: null,                    // Fn that accepts data and returns rendered items
        columnTplFn: null,                  // Fn that accepts data and returns rendered column
        loading: false,                     // If true, adds a loading overlay while waiting for Ajax response
                                            // ... requires jquery.ajax-loading-overlay:
                                            // ... https://github.com/jgerigmeyer/django-ajax-loading-overlay
        horizontalScroll: false,            // If true, automatically scrolls to center the active section
        scrollContainer: null,              // The container (window) to be automatically scrolled
        scrollSpeed: 500,                   // Speed of the scroll (in ms)
        selected: 'input:checked',          // A selected element
        notSelected: 'input:not(:checked)', // An unselected element
        headerSelector: 'header',           // Section headers
        sectionSelector: null,              // Sections
        sectionContentSelector: null,       // Content to be replaced by Ajax function
        itemSelector: '.finderinput',       // Selector for items in each section
        callback: null,                     // Callback function, currently runs after input in any section (except lastChild) is selected
        lastChildCallback: null,            // Callback function, currently runs after input in last section is selected
        sortLinkSelector: '.sortlink'       // Selector for link (in header) to sort items in that column
    };
}(jQuery));
