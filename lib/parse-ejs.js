
// https://stackoverflow.com/questions/1661197/what-characters-are-valid-for-javascript-variable-names/9337047#9337047

var ecma_keywords = {};

'break,case,catch,class,const,continue,debugger,default,delete,do,else,export,extends,finally,for,function,if,import,in,instanceof,new,return,super,switch,this,throw,try,typeof,var,void,while,with,yield'.split(',').forEach(function (key) {
  ecma_keywords[key] = true;
});

var match_var = /\,?[a-zA-Z_$][0-9a-zA-Z_$]+/g;

function parseEjs (ejs_str, options) {
  var parts = ejs_str.split(/<%([\s\S]*?)%>/),
      fn_body = 'var _λ=\'\';',
      matched_keys = Object.create(ecma_keywords),
      vars = [];

  options = options || {};

  parts.forEach(function (part, i) {

    if( i%2 ) {

      switch( part[0] ) {
        case '=':
          fn_body += '_λ+=(' + part.substr(1).trim() + ');';
          break;
        default:
          fn_body += part.trim();
      }

      ( part.replace(/'[^']+'/g, '\'\'').replace(/"[^"]+"/g, '""')
        .match(match_var) || []).forEach(function (key) {
          if( key[0] === '.' || matched_keys[key] ) return;

          matched_keys[key] = true;
          vars.push(key);
        });

    } else {

      fn_body += '_λ+=\'' + part.replace(/'/g, '\\\'') + '\';';
    }

  });

  fn_body += 'return _λ;';

  if( options.use_with ) return new Function('s', 's=s||{};with(s){' + fn_body + '}');

  var vars_init = vars.length ? (
    vars.length === 1 ? ('[\'' + vars[0] + '\']') : ('\'' + vars.join(',') + '\'.split(\',\')')
  ) : [];

  var fnScope = new Function('s', 's=s||{};var _=' + vars_init + ';return Function.apply(null,_.concat(\'' +
        fn_body.replace(/'/g, '\\\'') + '\')).apply(null, _.map(function (k) {return s[k];}));'
      );

  // console.log('fn_scope', fnScope);

  return fnScope;
}

module.exports = parseEjs;
