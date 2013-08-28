(function ($) {
    /*
    ======== A Handy Little QUnit Reference ========
    http://api.qunitjs.com/

    Test methods:
        module(name, {[setup][ ,teardown]})
        test(name, callback)
        expect(numberOfAssertions)
        stop(increment)
        start(decrement)
    Test assertions:
        ok(value, [message])
        equal(actual, expected, [message])
        notEqual(actual, expected, [message])
        deepEqual(actual, expected, [message])
        notDeepEqual(actual, expected, [message])
        strictEqual(actual, expected, [message])
        notStrictEqual(actual, expected, [message])
        throws(block, [expected], [message])
    */

    'use strict';

    module('init', {
        setup: function () {
            this.container = $('#qunit-fixture');
            this.finder = this.container.find('.finder');
            this.opts = {test: 'opts'};
            this.methods = this.container.html5finder('exposeMethods');
            this.stubs = {
                updateNumberCols: sinon.stub(this.methods, 'updateNumberCols'),
                markSelected: sinon.stub(this.methods, 'markSelected'),
                attachHandler: sinon.stub(this.methods, 'attachHandler')
            };
        },
        teardown: function () {
            this.stubs.updateNumberCols.restore();
            this.stubs.markSelected.restore();
            this.stubs.attachHandler.restore();
        }
    });

    test('calls updateNumberCols', 2, function () {
        this.container.html5finder(this.opts);

        ok(this.stubs.updateNumberCols.calledOnce, 'updateNumberCols was called once');
        ok(this.stubs.updateNumberCols.calledWith(this.finder, 1), 'updateNumberCols was passed finder and numberCols');
    });

    test('sets numberCols using number of sections in finder', 2, function () {
        this.finder.html('<section></section><section></section>');
        var opts = {sectionSelector: 'section'};
        this.container.html5finder(opts);

        ok(this.stubs.updateNumberCols.calledOnce, 'updateNumberCols was called once');
        ok(this.stubs.updateNumberCols.calledWith(this.finder, 2), 'updateNumberCols was passed finder and numberCols');
    });

    test('calls markSelected', 2, function () {
        this.container.html5finder(this.opts);

        ok(this.stubs.markSelected.calledOnce, 'markSelected was called once');
        ok(this.stubs.markSelected.calledWith(this.finder, this.opts), 'markSelected was passed finder and opts');
    });

    test('calls attachHandler', 2, function () {
        this.container.html5finder(this.opts);

        ok(this.stubs.attachHandler.calledOnce, 'attachHandler was called once');
        ok(this.stubs.attachHandler.calledWith(this.container, this.finder, this.opts), 'attachHandler was passed context, finder and opts');
    });


    module('markSelected', {
        setup: function () {
            this.container = $('#qunit-fixture');
            this.finder = this.container.find('.finder');
            this.finder.html('<input type="radio" class="checked" checked><input type="radio" class="not-checked">');
        }
    });

    test('markSelected sets data-selected on checked inputs', 4, function () {
        var checked = this.finder.find('.checked');
        var notChecked = this.finder.find('.not-checked');
        notChecked.data('selected', true);

        ok(!checked.data('selected'), 'checked input does not have data-selected before fn is called');
        ok(notChecked.data('selected'), 'unchecked input has data-selected before fn is called');

        this.container.html5finder('markSelected', this.finder);

        ok(checked.data('selected'), 'checked input has data-selected');
        ok(!notChecked.data('selected'), 'unchecked input does not have data-selected');
    });


    module('updateNumberCols', {
        setup: function () {
            this.container = $('#qunit-fixture');
            this.finder = this.container.find('.finder');
            this.finder.html('<section></section><section></section>');
        }
    });

    test('updateNumberCols sets finder data-cols', 2, function () {
        ok(!this.finder.data('cols'), 'finder does not have data-cols before fn is called');

        this.container.html5finder('updateNumberCols', this.finder, 1);

        strictEqual(this.finder.data('cols'), 1, 'finder has data-cols set to 1');
    });


    module('horzScroll', {
        setup: function () {
            this.container = $('#qunit-fixture');
            this.finder = this.container.find('.finder');
            this.finder.html('<section><input type="radio" class="finderinput" checked></section>');
            this.scrollStub = sinon.stub(this.finder, 'animate');
        },
        teardown: function () {
            this.scrollStub.restore();
        }
    });

    test('horzScroll animates scrollCont to 0 when no sections have .focus', 2, function () {
        this.container.html5finder('horzScroll', this.finder, this.finder, {
            horizontalScroll: true,
            sectionSelector: 'section'
        });

        ok(this.scrollStub.calledOnce, 'scrollCont.animate() was called once');
        ok(this.scrollStub.calledWith({scrollLeft: 0}), 'scrollCont.animate() was passed scrollTarget of 0');
    });

    test('horzScroll animates scrollCont to section before section.focus', 2, function () {
        sinon.stub(this.finder, 'scrollLeft', function () { return 10; });
        this.finder.append('<section class="focus"><input type="radio" class="finderinput" checked></section>');
        this.container.html5finder('horzScroll', this.finder, this.finder, {
            horizontalScroll: true,
            sectionSelector: 'section'
        });

        ok(this.scrollStub.calledOnce, 'scrollCont.animate() was called once');
        ok(this.scrollStub.calledWith({scrollLeft: 10}), 'scrollCont.animate() was passed scrollTarget of 10');

        this.finder.scrollLeft.restore();
    });

    test('horzScroll does not animate scrollCont if options.horizontalScroll !== true', 1, function () {
        this.container.html5finder('horzScroll', this.finder, this.finder, {
            horizontalScroll: false,
            sectionSelector: 'section'
        });

        ok(!this.scrollStub.called, 'scrollCont.animate() was not called');
    });


    module('addItems', {
        setup: function () {
            this.container = $('#qunit-fixture');
            this.finder = this.container.find('.finder').html('<section><div></div></section>');
            this.itemData = {
                "data": [
                    {
                        "code": "item1",
                        "has_children": true,
                        "name": "item 1"
                    },
                    {
                        "code": "item2",
                        "has_children": false,
                        "name": "item 2"
                    }
                ]
            };
            this.itemTpl = Handlebars.compile('<div class="{{colname}}">{{#each data}}{{code}} {{has_children}} {{name}}{{/each}}</div>');
            this.opts = {
                scrollContainer: '.finder',
                itemTplFn: function (data) {
                    var itemTpl = Handlebars.compile('<div class="{{colname}}">{{#each data}}{{code}} {{has_children}} {{name}}{{/each}}</div>');
                    return $($.parseHTML(itemTpl(data)));
                },
                sectionContentSelector: 'div'
            };
            this.column = this.finder.find('section');
            $.fn.loadingOverlay = sinon.spy();
            this.methods = this.container.html5finder('exposeMethods');
            this.scrollStub = sinon.stub(this.methods, 'horzScroll');
        },
        teardown: function () {
            delete $.fn.loadingOverlay;
            this.scrollStub.restore();
        }
    });

    test('addItems renders items using passed template', 1, function () {
        var column = this.column.clone();
        this.container.html5finder('addItems', this.itemData, 'column-name', this.column, this.container, this.finder, this.opts);
        var data = this.itemData;
        data.colname = 'column-name';
        column.find('div').html($($.parseHTML(this.itemTpl(data))));
        var expected = column.html();
        var actual = this.column.html();

        strictEqual(actual, expected, 'items were rendered and added to newCol');
    });

    test('calls horzScroll', 2, function () {
        this.container.html5finder('addItems', this.itemData, 'column-name', this.column, this.container, this.finder, this.opts);

        ok(this.scrollStub.calledOnce, 'horzScroll was called once');
        ok(this.scrollStub.calledWith(this.finder, this.finder, this.opts), 'horzScroll was called with correct args');
    });

    test('loadingOverlay is removed from newCol', 2, function () {
        this.opts.loading = true;
        this.container.html5finder('addItems', this.itemData, 'column-name', this.column, this.container, this.finder, this.opts);

        ok(this.column.loadingOverlay.calledOnce, 'loadingOverlay was called once');
        ok(this.column.loadingOverlay.calledWith('remove'), 'loadingOverlay was called with "remove" arg');
    });


    module('attachHandler', {
        setup: function () {
            this.container = $('#qunit-fixture');
            this.finder = this.container.find('.finder').html('<div class="finderinput">');
            this.opts = {test: 'opts'};
            this.methods = this.container.html5finder('exposeMethods');
            this.itemClickStub = sinon.stub(this.methods, 'itemClick');
        },
        teardown: function () {
            this.itemClickStub.restore();
        }
    });

    test('calls itemClick on click event', 4, function () {
        this.container.html5finder('attachHandler', 'context', this.finder, this.opts);
        this.finder.find('.finderinput').trigger('click');

        ok(this.itemClickStub.calledOnce, 'itemClick was called once');
        ok(this.itemClickStub.calledWith('context', this.finder), 'itemClick was passed context and finder');
        ok(this.itemClickStub.args[0][2].is(this.finder.find('.finderinput')), 'itemClick was passed clicked input');
        deepEqual(this.itemClickStub.args[0][3], this.opts, 'itemClick was passed opts');
    });


    module('itemClick: clicking already-selected input', {
        setup: function () {
            this.container = $('#qunit-fixture');
            this.finder = this.container.find('.finder');
            this.section = $('<section>').appendTo(this.finder);
            this.otherSection = this.section.clone().appendTo(this.finder);
            this.item = $('<input type="radio" value="test" class="finderinput">').appendTo(this.section);
            this.otherItem = this.item.clone().appendTo(this.otherSection);
            this.item.data('selected', true);
            this.opts = {
                scrollContainer: '.finder',
                sectionSelector: 'section'
            };
            this.methods = this.container.html5finder('exposeMethods');
            this.stubs = {
                updateNumberCols: sinon.stub(this.methods, 'updateNumberCols'),
                horzScroll: sinon.stub(this.methods, 'horzScroll')
            };
        },
        teardown: function () {
            this.stubs.updateNumberCols.restore();
            this.stubs.horzScroll.restore();
        }
    });

    test('adds focus to section and removes focus from sibling sections', 4, function () {
        this.otherSection.addClass('focus');

        ok(!this.section.hasClass('focus'), 'section does not have focus');
        ok(this.otherSection.hasClass('focus'), 'sibling section has focus');

        this.container.html5finder('itemClick', this.container, this.finder, this.item, this.opts);

        ok(this.section.hasClass('focus'), 'section has focus');
        ok(!this.otherSection.hasClass('focus'), 'sibling section no longer has focus');
    });

    test('if in section with focus, shifts focus to next section', 4, function () {
        this.section.addClass('focus');

        ok(this.section.hasClass('focus'), 'section has focus');
        ok(!this.otherSection.hasClass('focus'), 'sibling section does not have focus');

        this.container.html5finder('itemClick', this.container, this.finder, this.item, this.opts);

        ok(!this.section.hasClass('focus'), 'section no longer has focus');
        ok(this.otherSection.hasClass('focus'), 'sibling section has focus');
    });

    test('unchecks inputs in other sections', 4, function () {
        this.otherItem.attr('checked', true).data('selected', true);

        ok(this.otherItem.attr('checked'), 'input in other section is checked');
        ok(this.otherItem.data('selected'), 'input in other section has data-selected == true');

        this.container.html5finder('itemClick', this.container, this.finder, this.item, this.opts);

        ok(!this.otherItem.attr('checked'), 'input in other section is no longer checked');
        ok(!this.otherItem.data('selected'), 'input in other section has data-selected == false');
    });

    test('removes later sections beyond one', 2, function () {
        this.otherSection.clone().addClass('future-section').appendTo(this.finder);

        ok(this.finder.find('.future-section').length, 'later section exists');

        this.container.html5finder('itemClick', this.container, this.finder, this.item, this.opts);

        ok(!this.finder.find('.future-section').length, 'later section has been removed');
    });

    test('calls updateNumberCols with new number of sections', 2, function () {
        this.otherSection.clone().appendTo(this.finder);
        this.container.html5finder('itemClick', this.container, this.finder, this.item, this.opts);

        ok(this.stubs.updateNumberCols.calledOnce, 'updateNumberCols was called once');
        ok(this.stubs.updateNumberCols.calledWith(this.finder, 2), 'updateNumberCols called with finder and new number of sections');
    });

    test('calls horzScroll', 2, function () {
        this.container.html5finder('itemClick', this.container, this.finder, this.item, this.opts);

        ok(this.stubs.horzScroll.calledOnce, 'horzScroll was called once');
        ok(this.stubs.horzScroll.calledWith(this.finder, this.finder, this.opts), 'horzScroll called with correct args');
    });

    test('calls callback', 1, function () {
        var callback = sinon.spy();
        this.opts.callback = callback;
        this.item.data('children', true);
        this.container.html5finder('itemClick', this.container, this.finder, this.item, this.opts);

        ok(callback.calledOnce, 'callback was called once');
    });

    test('does not call callback if item has no children', 1, function () {
        var callback = sinon.spy();
        this.opts.callback = callback;
        this.container.html5finder('itemClick', this.container, this.finder, this.item, this.opts);

        ok(!callback.called, 'callback was not called');
    });


    module('itemClick: clicking input without children (last-child section)', {
        setup: function () {
            this.container = $('#qunit-fixture');
            this.finder = this.container.find('.finder');
            this.section = $('<section>').appendTo(this.finder);
            this.otherSection = this.section.clone().appendTo(this.finder);
            this.item = $('<input type="radio" value="test" class="finderinput">').appendTo(this.section);
            this.otherItem = this.item.clone().appendTo(this.otherSection);
            this.opts = {
                scrollContainer: '.finder',
                sectionSelector: 'section'
            };
            this.methods = this.container.html5finder('exposeMethods');
            this.stubs = {
                updateNumberCols: sinon.stub(this.methods, 'updateNumberCols'),
                markSelected: sinon.stub(this.methods, 'markSelected')
            };
        },
        teardown: function () {
            this.stubs.updateNumberCols.restore();
            this.stubs.markSelected.restore();
        }
    });

    test('adds focus to section and removes focus from sibling sections', 4, function () {
        this.otherSection.addClass('focus');

        ok(!this.section.hasClass('focus'), 'section does not have focus');
        ok(this.otherSection.hasClass('focus'), 'sibling section has focus');

        this.container.html5finder('itemClick', this.container, this.finder, this.item, this.opts);

        ok(this.section.hasClass('focus'), 'section has focus');
        ok(!this.otherSection.hasClass('focus'), 'sibling section no longer has focus');
    });

    test('removes later sections', 2, function () {
        this.otherSection.clone().appendTo(this.finder);

        strictEqual(this.finder.find('section').length, 3, '3 sections exist');

        this.container.html5finder('itemClick', this.container, this.finder, this.item, this.opts);

        strictEqual(this.finder.find('section').length, 1, '1 section exists');
    });

    test('calls updateNumberCols with new number of sections', 2, function () {
        this.otherSection.clone().appendTo(this.finder);
        this.container.html5finder('itemClick', this.container, this.finder, this.item, this.opts);

        ok(this.stubs.updateNumberCols.calledOnce, 'updateNumberCols was called once');
        ok(this.stubs.updateNumberCols.calledWith(this.finder, 1), 'updateNumberCols called with finder and new number of sections');
    });

    test('calls lastChildCallback', 2, function () {
        var callback = sinon.spy();
        this.opts.lastChildCallback = callback;
        this.container.html5finder('itemClick', this.container, this.finder, this.item, this.opts);

        ok(callback.calledOnce, 'callback was called once');
        ok(callback.calledWith(this.item), 'callback was passed clicked item');
    });


    module('itemClick: clicking input with children', {
        setup: function () {
            this.container = $('#qunit-fixture');
            this.finder = this.container.find('.finder');
            this.section = $('<section>').appendTo(this.finder);
            this.otherSection = this.section.clone().appendTo(this.finder);
            this.item = $('<input type="radio" value="test" data-url="/test/url/" data-children="true" class="finderinput">').appendTo(this.section);
            this.otherItem = this.item.clone().appendTo(this.otherSection);
            this.columnTpl = Handlebars.compile('<section>{{colname}}</section>');
            this.opts = {
                scrollContainer: '.finder',
                sectionSelector: 'section',
                columnTplFn: function (data) {
                    var columnTpl = Handlebars.compile('<section>{{colname}}</section>');
                    return $($.parseHTML(columnTpl(data)));
                }
            };
            this.methods = this.container.html5finder('exposeMethods');
            this.stubs = {
                updateNumberCols: sinon.stub(this.methods, 'updateNumberCols'),
                addItems: sinon.stub(this.methods, 'addItems'),
                markSelected: sinon.stub(this.methods, 'markSelected')
            };
            this.xhr = sinon.useFakeXMLHttpRequest();
            var requests = this.requests = [];
            this.xhr.onCreate = function (req) {
                requests.push(req);
            };
        },
        teardown: function () {
            this.stubs.updateNumberCols.restore();
            this.stubs.addItems.restore();
            this.stubs.markSelected.restore();
            this.xhr.restore();
        }
    });

    test('calls updateNumberCols with new number of sections', 2, function () {
        this.otherSection.clone().appendTo(this.finder);
        this.container.html5finder('itemClick', this.container, this.finder, this.item, this.opts);

        ok(this.stubs.updateNumberCols.calledOnce, 'updateNumberCols was called once');
        ok(this.stubs.updateNumberCols.calledWith(this.finder, 2), 'updateNumberCols called with finder and new number of sections');
    });

    test('renders new section using passed template', 1, function () {
        this.container.html5finder('itemClick', this.container, this.finder, this.item, this.opts);
        var data = {colname: 'col2'};
        var expected = $($.parseHTML(this.columnTpl(data))).html();
        var actual = this.section.next('section').html();

        strictEqual(actual, expected, 'new section was rendered and added after active section');
    });

    test('loadingOverlay is added to newCol', 1, function () {
        $.fn.loadingOverlay = sinon.spy();
        this.opts.loading = true;
        this.container.html5finder('itemClick', this.container, this.finder, this.item, this.opts);

        ok(this.section.next('section').loadingOverlay.calledOnce, 'loadingOverlay was called once');

        delete $.fn.loadingOverlay;
    });

    test('sends GET to data-url', 2, function () {
        this.container.html5finder('itemClick', this.container, this.finder, this.item, this.opts);

        strictEqual(this.requests[0].url, '/test/url/', 'xhr sent to data-url');
        strictEqual(this.requests[0].method, 'GET', 'xhr sent as GET');
    });

    test('xhr success calls addItems with response', 6, function () {
        this.container.html5finder('itemClick', this.container, this.finder, this.item, this.opts);
        this.requests[0].respond(200, {'content-type': 'application/json'}, '{"test": "data"}');

        ok(this.stubs.addItems.calledOnce, 'addItems was called once');
        ok(this.stubs.addItems.calledWith({test: 'data'}, 'col2'), 'addItems called with response and section name');
        ok(this.stubs.addItems.args[0][2].is(this.section.next('section')), 'addItems was passed new section');
        ok(this.stubs.addItems.args[0][3].is(this.container), 'addItems was passed context');
        ok(this.stubs.addItems.args[0][4].is(this.finder), 'addItems was passed finder');
        deepEqual(this.stubs.addItems.args[0][5], this.opts, 'addItems was passed opts');
    });

    test('second click uses cached response data', 8, function () {
        this.item.attr('id', 'test-id');
        this.container.html5finder('itemClick', this.container, this.finder, this.item, this.opts);
        this.requests[0].respond(200, {'content-type': 'application/json'}, '{"test": "data"}');
        this.container.html5finder('itemClick', this.container, this.finder, this.item, this.opts);

        strictEqual(this.requests.length, 1, 'only one xhr request was made');
        ok(this.stubs.addItems.calledTwice, 'addItems was called once');
        deepEqual(this.stubs.addItems.args[1][0], {test: 'data'}, 'addItems was passed response from cache');
        strictEqual(this.stubs.addItems.args[1][1], 'col2', 'addItems was passed new section name');
        ok(this.stubs.addItems.args[1][2].is(this.section.next('section')), 'addItems was passed new section');
        ok(this.stubs.addItems.args[1][3].is(this.container), 'addItems was passed context');
        ok(this.stubs.addItems.args[1][4].is(this.finder), 'addItems was passed finder');
        deepEqual(this.stubs.addItems.args[1][5], this.opts, 'addItems was passed opts');
    });

    test('calls callback', 1, function () {
        var callback = sinon.spy();
        this.opts.callback = callback;
        this.container.html5finder('itemClick', this.container, this.finder, this.item, this.opts);

        ok(callback.calledOnce, 'callback was called once');
    });

    test('calls markSelected', 2, function () {
        this.container.html5finder('itemClick', this.container, this.finder, this.item, this.opts);

        ok(this.stubs.markSelected.calledOnce, 'markSelected was called once');
        ok(this.stubs.markSelected.calledWith(this.finder, this.opts), 'markSelected called with finder and opts');
    });


    module('html5finder methods', {
        setup: function () {
            this.container = $('#qunit-fixture');
            this.methods = this.container.html5finder('exposeMethods');
            this.initStub = sinon.stub(this.methods, 'init');
        },
        teardown: function () {
            this.initStub.restore();
        }
    });

    test('if no args, calls init method', 1, function () {
        this.container.html5finder();

        ok(this.initStub.calledOnce, 'init was called once');
    });

    test('if first arg is an object, calls init method with args', 2, function () {
        this.container.html5finder({test: 'data'}, 'more');

        ok(this.initStub.calledOnce, 'init was called once');
        ok(this.initStub.calledWith({test: 'data'}, 'more'), 'init was passed args');
    });

    test('if first arg is a method, calls method with remaining args', 2, function () {
        this.container.html5finder('init', {test: 'data'}, 'more');

        ok(this.initStub.calledOnce, 'init was called once');
        ok(this.initStub.calledWith({test: 'data'}, 'more'), 'init was passed remaining args');
    });

    test('if first arg not a method or object, returns an error', 3, function () {
        sinon.stub($, 'error');
        this.container.html5finder('test');

        ok(!this.initStub.called, 'init was not called');
        ok($.error.calledOnce, '$.error was called once');
        ok($.error.calledWith('Method test does not exist on jQuery.html5finder'), '$.error was passed error msg');

        $.error.restore();
    });

}(jQuery));
