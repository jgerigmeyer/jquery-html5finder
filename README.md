# HTML5 Finder

[![Build Status](https://travis-ci.org/jgerigmeyer/jquery-html5finder.svg?branch=master)](https://travis-ci.org/jgerigmeyer/jquery-html5finder)
[![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)

jQuery HTML5 Drilldown Finder Plugin

## Getting Started

Download the [production version][min] or the [development version][max].

[min]: https://raw.github.com/jgerigmeyer/jquery-html5finder/master/dist/html5finder.min.js
[max]: https://raw.github.com/jgerigmeyer/jquery-html5finder/master/dist/html5finder.js

In your web page:

```html
<div id="finder-container">
  <div class="finder" data-cols="1">
    <section class="col focus">
      <ul class="colcontent">
        <li class="finderitem">
          <input type="radio" name="col1" id="finder-col1-item1" data-url="/ajax/url?parent=item1" data-children="true" class="finderinput">
          item1
        </li>
      </ul>
    </section>
  </div>
</div>

<script src="jquery.js"></script>
<script src="handlebars.js"></script>
<script src="dist/html5finder.min.js"></script>
<script>
$('#finder-container').html5finder({
  itemTplFn: function (data) {
    var item =
      '{{#each data}}' +
      '<li class="finderitem">' +
        '<input type="radio" name="{{../colname}}" id="finder-{{../colname}}-{{id}}" data-url="/ajax/url?parent={{id}}" data-children="{{has_children}}" class="finderinput">' +
        '{{name}}' +
      '</li>' +
      '{{/each}}';
    var itemTpl = Handlebars.compile(item);
    return $($.parseHTML(itemTpl(data)));
  },
  columnTplFn: function (data) {
    var col =
      '<section class="col focus">' +
        '<ul class="colcontent"></ul>' +
      '</section>';
    var colTpl = Handlebars.compile(col);
    return $($.parseHTML(colTpl(data)));
  },
  horizontalScroll: true,
  scrollContainer: '.finder',
  sectionSelector: '.col',
  sectionContentSelector: '.colcontent'
});
</script>
```

## Release History

* 1.0.2 - (02/19/2014) Add bower.json
* 1.0.1 - (11/22/2013) Return promise instead of deferred
* 1.0.0 - (10/11/2013) Make plugin chainable; major version release
* 1.0.dev4 - (10/1/2013) More specific item selectors
* 1.0.dev3 - (9/27/2013) Cache based on url instead of item id
* 1.0.dev2 - (9/27/2013) Add option for fn to get ajax-url for fetching an item's children
* 1.0.dev1 - (9/27/2013) Fix bugs with scrolling
* 0.2.3rc4 - (9/26/2013) Prevent clicks within label from triggering section-focus
* 0.2.3rc3 - (9/20/2013) Clicking empty section space or label of disabled input adds focus to section
* 0.2.3rc2 - (9/17/2013) Fix bug with loadingOverlay not being removed when using cached data
* 0.2.3rc1 - (9/17/2013) Add better loadingOverlay handling; cache option
* 0.2.2 - (9/16/2013) Add itemsAddedCallback option
* 0.2.1 - (9/13/2013) Add more selector options
* 0.2.0 - (8/28/2013) Initial beta release
