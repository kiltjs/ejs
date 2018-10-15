
// https://stackoverflow.com/questions/1661197/what-characters-are-valid-for-javascript-variable-names/9337047#9337047

var ecma_keywords = {};

'break,case,catch,class,const,continue,debugger,default,delete,do,else,export,extends,finally,for,function,if,import,in,instanceof,new,return,super,switch,this,throw,try,typeof,var,void,while,with,yield'.split(',').forEach(function (key) {
  ecma_keywords[key] = true;
});

var match_var = /\.?[a-zA-Z_$][0-9a-zA-Z_$]+/g;

function safeQuotes(str) {
  return str.replace(/''|'.*?[^\\]'|""|".*?[^\\]"/g, function (matched) {
    return matched.replace(/\\/g, '\\\\');
  });
}

function parseEjs (ejs_str, options) {
  var parts = ejs_str.split(/<%([\s\S]*?)%>/),
      fn_body = 'var _λ=\'\';',
      matched_keys = Object.create(ecma_keywords),
      vars = [];

  options = options || {};
  if( options.globals ) options.globals.forEach(function (global_key) {
    matched_keys[global_key] = true;
  });

  parts.forEach(function (part, i) {

    if( i%2 ) {

      switch( part[0] ) {
        case '=':
          fn_body += '_λ+=(' + safeQuotes(part.substr(1).trim()) + ');';
          break;
        default:
          fn_body += safeQuotes(part.trim());
      }

      var matched_vars = [];

      ( part.replace(/''|'.*?[^\\]'/g, '\'\'').replace(/""|".*?[^\\]"/g, '""').match(match_var) || [])
        .forEach(function (key) {
          if( key[0] === '.' || matched_keys[key] ) return;

          matched_keys[key] = true;
          vars.push(key);
          matched_vars.push(key);
        });

    } else {

      fn_body += '_λ+=\'' + part.replace(/\n/g, '\\n').replace(/\\/g, '\\\\').replace(/'/g, '\\\'') + '\';';
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
