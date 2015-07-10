$.widget("fioi.editor", $.fioi.editor, {
  _create: function() {
    this._super();
    this._cmDocs = {};
    var editor = this;
    CodeMirror.commands.autocomplete = function(cm) {
      CodeMirror.showHint(cm, CodeMirror.hint.anyword);
    };
    this._cm = CodeMirror(this.element.get(0), {
        lineNumbers: true,
        extraKeys: {
            "Ctrl-Space": "autocomplete",
            "F11": function(cm) {
              cm.setOption("fullScreen", !cm.getOption("fullScreen"));
            },
            "Esc": function(cm) {
              if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
            },
            "Ctrl-S": function(cm) {
              if (editor.options.saveCallback) editor.options.saveCallback();
            },
        }
    });
    this._cm.on("change", function(cm, change) {
      if (editor.options.changeCallback) editor.options.changeCallback(change);
    });
    this._cm2 = CodeMirror(this.element.get(0), {lineNumbers: true});
    $(this._cm2.getWrapperElement()).hide();
  },

  _createNewContainer: function(id) {
    return this._superApply(arguments).hide();
  },

  open: function(id, title, text, syntax) {
    this._superApply(arguments);
    this._cmDocs[id] = CodeMirror.Doc(text, syntax || "text/plain");
    this.show(id);
  },

  openPair: function(id, title, legend1, text1, legend2, text2) {
    this._superApply(arguments);
    this._cmDocs[id] = [CodeMirror.Doc(text1), CodeMirror.Doc(text2)];
    this.show(id);
  },

  show: function(id) {
    if ($.isArray(this._cmDocs[id])) {
      $(this._cm.getWrapperElement()).width(this.options.width / 2).css('float', 'left');
      this._cm.refresh();
      this._cm.swapDoc(this._cmDocs[id][0]);
      $(this._cm2.getWrapperElement()).width(this.options.width / 2).show();
      this._cm2.refresh();
      this._cm2.swapDoc(this._cmDocs[id][1]);
    } else {
      $(this._cm.getWrapperElement()).width(this.options.width).css('float', '');
      this._cm.refresh();
      this._cm.swapDoc(this._cmDocs[id]);
      $(this._cm2.getWrapperElement()).hide();
    }
    this._superApply(arguments);
    this.element.find(".docContainer").hide();
  },

  setSyntax: function(syntax) {
    this._superApply(arguments);
    this._cm.setOption("mode", syntax);
  },

  _sync: function() {
    for (id in this._cmDocs) {
      if ($.isArray(this._cmDocs[id])) {
        this._docs[id]
            .find("textarea[name='" + this._getName(id, 'text1') + "']")
            .val(this._cmDocs[id][0].getValue());
        this._docs[id]
            .find("textarea[name='" + this._getName(id, 'text2') + "']")
            .val(this._cmDocs[id][1].getValue());
      } else {
        this._docs[id]
            .find("textarea[name='" + this._getName(id, 'text') + "']")
            .val(this._cmDocs[id].getValue());
      } 
    }
  },

  serialize: function() {
    this._sync();
    return this._super();
  },
  
  getDocument: function(id) {
    this._sync();
    return this._superApply(arguments);
  }
});
