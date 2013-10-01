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
            this.finder = this.container.find('.finder-body');
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
            this.finder = this.container.find('.finder-body');
            this.finder.html('<input type="radio" class="checked finderinput" checked /><input type="radio" class="not-checked finderinput" />');
        }
    });

    test('markSelected sets data-selected on checked inputs', 4, function () {
        var checked = this.finder.find('.checked');
        var notChecked = this.finder.find('.not-checked');
        notChecked.attr('data-selected', true);

        ok(!checked.data('selected'), 'checked input does not have data-selected before fn is called');
        ok(notChecked.data('selected'), 'unchecked input has data-selected before fn is called');

        this.container.html5finder('markSelected', this.finder);

        ok(checked.data('selected'), 'checked input has data-selected');
        ok(!notChecked.data('selected'), 'unchecked input does not have data-selected');
    });


    module('updateNumberCols', {
        setup: function () {
            this.container = $('#qunit-fixture');
            this.finder = this.container.find('.finder-body');
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
            this.finder = this.container.find('.finder-body');
            this.finder.html('<section><input type="radio" class="finderinput" checked></section>');
            this.scrollStub = sinon.stub(this.finder, 'animate');
        },
        teardown: function () {
            this.scrollStub.restore();
        }
    });

    test('horzScroll animates scrollCont to 0 when no sections have .focus', 2, function () {
        sinon.stub(this.finder, 'scrollLeft', function () { return 10; });
        this.container.html5finder('horzScroll', this.finder, this.finder, {
            horizontalScroll: true,
            sectionSelector: 'section'
        });

        ok(this.scrollStub.calledOnce, 'scrollCont.animate() was called once');
        ok(this.scrollStub.calledWith({scrollLeft: 0}), 'scrollCont.animate() was passed scrollTarget of 0');

        this.finder.scrollLeft.restore();
    });

    test('horzScroll animates scrollCont to section before section.focus', 2, function () {
        var prevSection = $('<section class="focus"><input type="radio" class="finderinput" checked></section>');
        sinon.stub(this.finder, 'scrollLeft', function () { return 10; });
        sinon.stub($.fn, 'position', function () { return {left: 10}; });
        this.finder.append(prevSection);
        this.container.html5finder('horzScroll', this.finder, this.finder, {
            horizontalScroll: true,
            sectionSelector: 'section'
        });

        ok(this.scrollStub.calledOnce, 'scrollCont.animate() was called once');
        ok(this.scrollStub.calledWith({scrollLeft: 20}), 'scrollCont.animate() was passed scrollTarget of 20');

        this.finder.scrollLeft.restore();
        $.fn.position.restore();
    });

    test('animates scrollCont so that nothing is visible to the right of section.focus if .focus will be last section', 2, function () {
        var prevSection = $('<section class="focus"><input type="radio" class="finderinput" checked></section>');
        sinon.stub(this.finder, 'scrollLeft', function () { return 10; });
        sinon.stub($.fn, 'position', function () { return {left: 10}; });
        sinon.stub($.fn, 'innerWidth', function () { return 15; });
        sinon.stub($.fn, 'outerWidth', function () { return 5; });
        this.finder.append(prevSection);
        this.container.html5finder('horzScroll', this.finder, this.finder, {
            horizontalScroll: true,
            sectionSelector: 'section'
        }, true);

        ok(this.scrollStub.calledOnce, 'scrollCont.animate() was called once');
        ok(this.scrollStub.calledWith({scrollLeft: 15}), 'scrollCont.animate() was passed scrollTarget of 15');

        this.finder.scrollLeft.restore();
        $.fn.position.restore();
        $.fn.innerWidth.restore();
        $.fn.outerWidth.restore();
    });

    test('horzScroll does not animate scrollCont if options.horizontalScroll !== true', 1, function () {
        this.container.html5finder('horzScroll', this.finder, this.finder, {
            horizontalScroll: false,
            sectionSelector: 'section'
        });

        ok(!this.scrollStub.called, 'scrollCont.animate() was not called');
    });

    test('horzScroll does not animate scrollCont if already scrolled to the correct place', 1, function () {
        this.container.html5finder('horzScroll', this.finder, this.finder, {
            horizontalScroll: true,
            sectionSelector: 'section'
        });

        ok(!this.scrollStub.called, 'scrollCont.animate() was not called');
    });


    module('addItems', {
        setup: function () {
            this.container = $('#qunit-fixture');
            this.finder = this.container.find('.finder-body').html('<section><div></div></section>');
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
                scrollContainer: '.finder-body',
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

    test('calls itemsAddedCallback', 1, function () {
        var callback = sinon.spy();
        this.opts.itemsAddedCallback = callback;
        this.container.html5finder('addItems', this.itemData, 'column-name', this.column, this.container, this.finder, this.opts);

        ok(callback.calledOnce, 'itemsAddedCallback was called once');
    });


    module('attachHandler', {
        setup: function () {
            this.container = $('#qunit-fixture');
            this.finder = this.container.find('.finder-body');
            this.section = $('<section>').appendTo(this.finder);
            this.otherSection = this.section.clone().addClass('focus').appendTo(this.finder);
            this.item = $('<input id="test-input" type="radio" value="test" class="finderinput">').appendTo(this.section);
            this.label = $('<label for="test-input" class="finderselect">').appendTo(this.section);
            this.opts = {
                scrollContainer: '.finder-body',
                sectionSelector: 'section'
            };
            this.methods = this.container.html5finder('exposeMethods');
            this.itemClickStub = sinon.stub(this.methods, 'itemClick');
            this.horzScrollStub = sinon.stub(this.methods, 'horzScroll');
            this.container.html5finder('attachHandler', this.container, this.finder, this.opts);
        },
        teardown: function () {
            this.itemClickStub.restore();
            this.horzScrollStub.restore();
        }
    });

    test('calls itemClick on input click event', 4, function () {
        this.item.trigger('click');

        ok(this.itemClickStub.calledOnce, 'itemClick was called once');
        ok(this.itemClickStub.calledWith(this.container, this.finder), 'itemClick was passed context and finder');
        ok(this.itemClickStub.args[0][2].is(this.item), 'itemClick was passed clicked input');
        deepEqual(this.itemClickStub.args[0][3], this.opts, 'itemClick was passed opts');
    });

    test('calls horzScroll on :disabled input label click event', 2, function () {
        this.item.attr('disabled', true);
        this.label.trigger('click');

        ok(this.horzScrollStub.calledOnce, 'horzScroll was called once');
        ok(this.horzScrollStub.calledWith(this.finder, this.finder, this.opts), 'horzScroll was passed finder, scrollContainer, opts');
    });

    test('does not call horzScroll on non-disabled input label click event', 1, function () {
        this.label.trigger('click');

        ok(!this.horzScrollStub.called, 'horzScroll was not called');
    });

    test('gives section .focus on :disabled input label click event', 2, function () {
        ok(this.finder.find('.focus').is(this.otherSection), 'other-section has .focus');

        this.item.attr('disabled', true);
        this.label.trigger('click');

        ok(this.finder.find('.focus').is(this.section), 'this section has focus');
    });

    test('gives section .focus on section (not input or label) click event', 2, function () {
        ok(this.finder.find('.focus').is(this.otherSection), 'other-section has .focus');

        $('<div>').appendTo(this.section).trigger('click');

        ok(this.finder.find('.focus').is(this.section), 'this section has focus');
    });

    test('does not give section .focus on section child input or label click event', 2, function () {
        ok(this.finder.find('.focus').is(this.otherSection), 'other section has .focus');

        $('<input>').appendTo(this.section).trigger('click');

        ok(this.finder.find('.focus').is(this.otherSection), 'other section still has focus');
    });

    test('calls horzScroll on section (not input or label) click event', 2, function () {
        $('<div>').appendTo(this.section).trigger('click');

        ok(this.horzScrollStub.calledOnce, 'horzScroll was called once');
        ok(this.horzScrollStub.calledWith(this.finder, this.finder, this.opts), 'horzScroll was passed finder, scrollContainer, opts');
    });

    test('does not call horzScroll on label child element click event', 1, function () {
        var child = $('<div>').appendTo(this.label);
        child.trigger('click');

        ok(!this.horzScrollStub.called, 'horzScroll was not called');
    });


    module('itemClick: clicking already-selected input', {
        setup: function () {
            this.container = $('#qunit-fixture');
            this.finder = this.container.find('.finder-body');
            this.section = $('<section>').appendTo(this.finder);
            this.otherSection = this.section.clone().appendTo(this.finder);
            this.item = $('<input type="radio" value="test" class="finderinput">').appendTo(this.section);
            this.otherItem = this.item.clone().appendTo(this.otherSection);
            this.item.attr('data-selected', true);
            this.opts = {
                scrollContainer: '.finder-body',
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
        this.otherItem.attr('checked', true).attr('data-selected', true);

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

    test('calls itemSelectedCallback', 1, function () {
        var callback = sinon.spy();
        this.opts.itemSelectedCallback = callback;
        this.item.data('children', true);
        this.container.html5finder('itemClick', this.container, this.finder, this.item, this.opts);

        ok(callback.calledOnce, 'itemSelectedCallback was called once');
    });

    test('does not call itemSelectedCallback if item has no children', 1, function () {
        var callback = sinon.spy();
        this.opts.itemSelectedCallback = callback;
        this.container.html5finder('itemClick', this.container, this.finder, this.item, this.opts);

        ok(!callback.called, 'itemSelectedCallback was not called');
    });


    module('itemClick: clicking input without children (last-child section)', {
        setup: function () {
            this.container = $('#qunit-fixture');
            this.finder = this.container.find('.finder-body');
            this.section = $('<section>').appendTo(this.finder);
            this.otherSection = this.section.clone().appendTo(this.finder);
            this.item = $('<input type="radio" value="test" class="finderinput">').appendTo(this.section);
            this.otherItem = this.item.clone().appendTo(this.otherSection);
            this.opts = {
                scrollContainer: '.finder-body',
                sectionSelector: 'section'
            };
            this.methods = this.container.html5finder('exposeMethods');
            this.stubs = {
                updateNumberCols: sinon.stub(this.methods, 'updateNumberCols'),
                markSelected: sinon.stub(this.methods, 'markSelected'),
                horzScroll: sinon.stub(this.methods, 'horzScroll')
            };
        },
        teardown: function () {
            this.stubs.updateNumberCols.restore();
            this.stubs.markSelected.restore();
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

    test('calls horzScroll with scrollContainer', 2, function () {
        this.container.html5finder('itemClick', this.container, this.finder, this.item, this.opts);

        ok(this.stubs.horzScroll.calledOnce, 'horzScroll was called once');
        ok(this.stubs.horzScroll.calledWith(this.finder, this.finder, this.opts), 'horzScroll called with finder, scrollContainer, and opts');
    });

    test('calls lastChildSelectedCallback', 2, function () {
        var callback = sinon.spy();
        this.opts.lastChildSelectedCallback = callback;
        this.container.html5finder('itemClick', this.container, this.finder, this.item, this.opts);

        ok(callback.calledOnce, 'lastChildSelectedCallback was called once');
        ok(callback.calledWith(this.item), 'lastChildSelectedCallback was passed clicked item');
    });


    module('itemClick: clicking input with children', {
        setup: function () {
            this.container = $('#qunit-fixture');
            this.finder = this.container.find('.finder-body');
            this.section = $('<section>').appendTo(this.finder);
            this.otherSection = this.section.clone().appendTo(this.finder);
            this.item = $('<input type="radio" value="test" data-url="/test/url/" data-children="true" class="finderinput">').appendTo(this.section);
            this.otherItem = this.item.clone().appendTo(this.otherSection);
            this.columnTpl = Handlebars.compile('<section>{{colname}}</section>');
            this.opts = {
                scrollContainer: '.finder-body',
                sectionSelector: 'section',
                columnTplFn: function (data) {
                    var columnTpl = Handlebars.compile('<section>{{colname}}</section>');
                    return $($.parseHTML(columnTpl(data)));
                },
                cache: false
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

    test('replaces target with new section using passed template', 1, function () {
        this.container.html5finder('itemClick', this.container, this.finder, this.item, this.opts);
        var data = {colname: 'col2'};
        var expected = $($.parseHTML(this.columnTpl(data))).html();
        var actual = this.section.next('section').html();

        strictEqual(actual, expected, 'new section was rendered and added after active section');
    });

    test('renders new section using passed template', 1, function () {
        this.otherSection.remove();
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

    test('xhr success removes loadingOverlay from newCol', 2, function () {
        $.fn.loadingOverlay = sinon.spy();
        this.opts.loading = true;
        this.container.html5finder('itemClick', this.container, this.finder, this.item, this.opts);
        this.requests[0].respond(200, {'content-type': 'application/json'}, '{"test": "data"}');

        ok(this.section.next('section').loadingOverlay.calledTwice, 'loadingOverlay was called twice');
        strictEqual(this.section.next('section').loadingOverlay.args[1][0], 'remove', 'loadingOverlay was called with arg ``remove``');

        delete $.fn.loadingOverlay;
    });

    test('xhr failure removes loadingOverlay from newCol', 2, function () {
        $.fn.loadingOverlay = sinon.spy();
        this.opts.loading = true;
        this.container.html5finder('itemClick', this.container, this.finder, this.item, this.opts);
        this.requests[0].respond(500);

        ok(this.section.next('section').loadingOverlay.calledTwice, 'loadingOverlay was called twice');
        strictEqual(this.section.next('section').loadingOverlay.args[1][0], 'remove', 'loadingOverlay was called with arg ``remove``');

        delete $.fn.loadingOverlay;
    });

    test('second click uses cached response data', 8, function () {
        this.opts.cache = true;
        this.container.html5finder('itemClick', this.container, this.finder, this.item, this.opts);
        this.requests[0].respond(200, {'content-type': 'application/json'}, '{"test": "data"}');
        this.container.html5finder('itemClick', this.container, this.finder, this.item, this.opts);

        strictEqual(this.requests.length, 1, 'only one xhr request was made');
        ok(this.stubs.addItems.calledTwice, 'addItems was called twice');
        deepEqual(this.stubs.addItems.args[1][0], {test: 'data'}, 'addItems was passed response from cache');
        strictEqual(this.stubs.addItems.args[1][1], 'col2', 'addItems was passed new section name');
        ok(this.stubs.addItems.args[1][2].is(this.section.next('section')), 'addItems was passed new section');
        ok(this.stubs.addItems.args[1][3].is(this.container), 'addItems was passed context');
        ok(this.stubs.addItems.args[1][4].is(this.finder), 'addItems was passed finder');
        deepEqual(this.stubs.addItems.args[1][5], this.opts, 'addItems was passed opts');
    });

    test('second click does not use cached response data if ``options.cached: false``', 1, function () {
        this.item.attr('id', 'test-id');
        this.container.html5finder('itemClick', this.container, this.finder, this.item, this.opts);
        this.requests[0].respond(200, {'content-type': 'application/json'}, '{"test": "data"}');
        this.container.html5finder('itemClick', this.container, this.finder, this.item, this.opts);

        strictEqual(this.requests.length, 2, 'two xhr requests were made');
    });

    test('calls callback', 1, function () {
        var callback = sinon.spy();
        this.opts.itemSelectedCallback = callback;
        this.container.html5finder('itemClick', this.container, this.finder, this.item, this.opts);

        ok(callback.calledOnce, 'itemSelectedCallback was called once');
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
