$.widget("fioi.editor", {
  options: {
    formName: "documents",
    keys: {
      'id': 'id',
      'title': 'title',
      'syntax': 'syntax',
      'text': 'text',
      'text1': 'text1',
      'text2': 'text2',
    },
    width: 760,
    height: 240,
    changeCallback: null,
    saveCallback: null,
    switchCallback: null,
  },

  _create: function() {
    this._docsTabList = $('<ul></ul>')
        .attr('id', 'docsTabList')
        .appendTo(this.element);
    $('<li></li>').text('+')
        .attr('id', 'newDoc')
        .appendTo(this._docsTabList);
    this._docs = {};
    this._currentDoc = null;
  },

  _createNewContainer: function(id) {
    this.element.find(".docContainer").hide();
    this._docs[id] = $("<div />")
        .addClass("docContainer")
        .css('align', 'center')
        .attr('id', 'doc_' + id)
        .appendTo(this.element);
    return this._docs[id];
  },

  _createNewTab: function(id, title) {
    var self = this;
    this._docsTabList.find('li').removeClass("active");
    $('<li></li>').addClass("active")
        .attr('id', 'tab_' + id)
        .text(title)
        .click(function() {
          self.show(id);
        })
        .appendTo(this._docsTabList);
  },

  open: function(id, title, text, syntax) {
    var docContainer = this._createNewContainer(id);
    $('<input type="hidden" />')
        .attr('name', this._getName(id, 'id'))
        .val(id)
        .appendTo(docContainer);
    $('<input type="hidden" />')
        .attr('name', this._getName(id, 'title'))
        .val(title)
        .appendTo(docContainer);
    $('<input type="hidden" />')
        .attr('name', this._getName(id, 'syntax'))
        .val(syntax)
        .appendTo(docContainer);
    $('<textarea />')
        .attr('name', this._getName(id, 'text'))
        .val(text)
        .width(this.options.width)
        .height(this.options.height)
        .appendTo(docContainer);
    this._createNewTab(id, title);
    this._currentDoc = id;
  },

  openPair: function(id, title, legend1, text1, legend2, text2) {
    var docContainer = this._createNewContainer(id);
    $('<input type="hidden" />')
        .attr('name', this._getName(id, 'id'))
        .val(id)
        .appendTo(docContainer);
    $('<input type="hidden" />')
        .attr('name', this._getName(id, 'title'))
        .val(title)
        .appendTo(docContainer);
    $('<textarea />')
        .attr('name', this._getName(id, 'text1'))
        .val(text1)
        .width(this.options.width / 2)
        .height(this.options.height)
        .appendTo(docContainer);
    $('<textarea />')
        .attr('name', this._getName(id, 'text2'))
        .val(text2)
        .width(this.options.width / 2)
        .height(this.options.height)
        .appendTo(docContainer);
    this._createNewTab(id, title);
    this._currentDoc = id;
  },

  show: function(id) {
    this._docsTabList.find('li').removeClass("active");
    this._docsTabList.find('#tab_' + id).addClass("active");
    this.element.find(".docContainer").hide();
    this._docs[id].show();
    this._currentDoc = id;
    if (this.options.switchCallback) this.options.switchCallback();
  },

  close: function(id) {
    if (id in this._docs) {
      this._docs[id].remove();
      delete this._docs[id];
    }
  },

  setSyntax: function(syntax) {
    this._docs[this._currentDoc]
        .find("input[name='" + this._getName(this._currentDoc, 'syntax') + "']")
        .val(syntax);
  },

  serialize: function() {
    return this.element.find('input, textarea, select').serialize();
  },

  getDocument: function(id) {
    var doc = {};
    this._getContainer(id).children().each(function(num, el) {
      var name = $(el).attr('name');
      var name = name.substring(name.lastIndexOf('[') + 1, name.lastIndexOf(']'));
      var val = $(el).val();
      doc[name] = val;
    });
    return doc;
  },

  getAllDocuments: function() {
    var docs = {};
    for (id in this._docs) {
      docs[id] = this.getDocument(id);
    }
    return docs;
  },

  getCurrentDocument: function() {
    return this.getDocument(this._currentDoc);
  },
  
  _getContainer: function(id) {
    return this.element.find('div[id=\'doc_' + id + '\']');
  },
  
  _getName: function(id, key) {
    return this.options.formName + '[' + id + '][' + this.options.keys[key] + ']';
  }
});
