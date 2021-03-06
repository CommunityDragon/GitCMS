import hljs from "highlight.js"
import marked from "marked"

marked.setOptions({
  highlight: function(code, lang) {
    try {
      return hljs.highlight(lang, code).value;
    } catch {
      return hljs.highlightAuto(code).value;
    }
  }
});

export default marked