(async()=>{

const { readFileSync, writeFileSync } = require("fs");
const Buffer = require("buffer").Buffer;
const wabt = await require("wabt")();
const inputWs = "main.w.js";
const inputWat = "main.wat";
const outputWasm = "main.wasm";
const crypto = require('crypto');
const match = (x,rex) => x?.match?.(rex)??[];

function locals(block){
  return block.replaceAll('*', 'local.get ')
    .replace(/\(\s*set /g, `(local.set `)
    .replace(/\(\s*get /g, `(local.get `)
    .replace(/\(\s*let /g, `(local `)
    .replace(/set\(/g, `local.set(`)
    .replace(/get\(/g, `local.get(`)
    .replace(/let\(/g, `local(`)
  .replace(/(local\.)+/g, 'local.');
}

  
let ws = String(readFileSync(inputWs, "utf8"));
//console.log([...match(ws,/\{[^\{\}]+\}/)].shift());
  let script = locals(ws);
  let p = 0;
    while(/\{[^\{\}]+\}/.test(script)){
      
      const id = crypto.randomUUID().replace(/-/g, "");
      const tail = match(script,/\{[^\{\}]+\}/).shift();
      
      if(!tail)break;
      console.log(p++);
      const head = script.split(tail)
        .shift()
        .split(/[\{\}]/).pop();
      console.log(head);
      const wsBlock = head + tail;
      let watBlock = (wsBlock);
      if(/function ([^\{]*)\{/i.test(watBlock)){
      watBlock = wsBlock
        .replace(/function ([^\{]*)\{/g, "(func $1 ")
         .replace(/\}/g,')');
      }else if(/loop ([^\{]*)\{/i.test(watBlock)){
          watBlock = wsBlock
            .replace(/loop ([^\{]*)\{/g, "(loop $1")
             .replace(/\}/g,')');
          }else if(/block ([^\{]*)\{/i.test(watBlock)){
        watBlock = wsBlock
          .replace(/block ([^\{]*)\{/g, "(block $1")
           .replace(/\}/g,')');
        }else if(/else ([^\{]*)\{/i.test(watBlock)){
          watBlock = wsBlock
            .replace(/else ([^\{]*)\{/g, "(else $1")
             .replace(/\}/g,')');
          }else if(/if ([^\{]*)\{/i.test(watBlock)){
          watBlock = wsBlock
            .replace(/if ([^\{]*)\{/g, "(if $1")
             .replace(/\}/g,'))');
          }else if(/while\s*\(([^\{]*)\{/.test(watBlock)){
          watBlock = wsBlock
            .replace(/while\s*\(([^\{]*)\{/g,`    (block $exit${id}
            (loop $while${id}
              (br_if $exit${id} $1`)
        .replace(/\}/g,`(br $while${id})
            )
          )`);
        }else if(/for\s*\(([^\{]*)\{/.test(watBlock)){
        watBlock = wsBlock
          .replace(/for\s*\(([^\{]*)\{/g,`    (block $break${id}
          (loop $for${id}
            (br_if $break${id} $1`)
      .replace(/\}/g,`(br $for${id})
          )
        )`);
      }
      watBlock = watBlock
        .replace(/;.*\n/g,"\n")
        .replace(/(\d+):i(32|64)/g,"(i$2.const $1)")
        .replace(/([\d\.]+):f(32|64)/g,"(f$2.const $1)")
        .replace(/:(i|f)(32|64)/g," $1$2");
      script = locals(script.replace(wsBlock, watBlock));
    }


function parenParse(watScript){
  const parseMap = new Map();
  let code = String(watScript);
  while(/\([^\(\)]+\)/.test(code)){
    const key = `@@parenKey${crypto.randomUUID()}@@`;
    const block = match(code,/\([^\(\)]+\)/).shift();
    parseMap.set(key, block);
    code = code.replace(block, key);
  }
  //make changes to individual blocks
  const keys = [...parseMap.keys()];
  while(keys.some(x=>(code.includes(x)))){
    parseMap.forEach((v,k)=>{
      code = code.replace(k, v);
    });
  }
  return code;
}

  
  function prefixParse(watScript){
    const parseMap = new Map();
    let code = String(watScript);
    
    //split code into blocks

    let i = 0;
    while(/\([^\(\)]+\)/.test(code)){
      const key = `@@prefixKey${crypto.randomUUID()}@@`;
      const tail = match(code,/\([^\(\)]+\)/).shift();
      const head = code.split(tail)
        .shift()
        .split(/[\(\)]/).pop();
      const block = head + tail;
      parseMap.set(key, block);
      code = code.replace(block, key);
      console.log(i++)
    }

    
    //make changes to individual blocks

    //resolve prefix custom function format
    parseMap.forEach((v,k)=>{
      let block = v;
      if(/$[\w\.\$]+\([^\(\)]+\)/.test(block)){
        block = block.replace(/$[\w\.\$]+\([^\(\)]+\)/g,
                 x=>{
                   if(/@@prefixKey/i.test(x)){
                     const pk = match(x,/@@prefixKey[^@]+@@/).shift();
                     parseMap.set(pk, parseMap.get(pk).replaceAll(',',' '));
                   }
                   return x.replace(/(\$[\w\.\$\\\/~]+)\(([^\(\)]+)\)/,'(call $1 $2)')
                     .replaceAll(',',' ')
                 });
      }
      parseMap.set(k,block);
    });

    //resolve prefix function format
    parseMap.forEach((v,k)=>{
      let block = v;
      if(/[\w\.]+\([^\(\)]+\)/.test(block)&&!block.trim().startsWith('$')){
        block = block.replace(/[\w\.]+\([^\(\)]+\)/g,
                 x=>{
                   if(/@@prefixKey/i.test(x)){
                     const pk = match(x,/@@prefixKey[^@]+@@/).shift();
                     parseMap.set(pk, parseMap.get(pk).replaceAll(',',' '));
                   }
                   return x.replace(/([\w\.\\\/~]+)\(([^\(\)]+)\)/,'($1 $2)')
                     .replaceAll(',',' ')
                 });
      }
      parseMap.set(k,block);
    });

    //resolve '=' as setters;
    //make changes to individual blocks
    parseMap.forEach((v,k)=>{
      let block = v;
      if(/[\w\.\$]+\s*=\s*\([^\(\)]+\)/.test(block)){
        block = block.replace(/[\w\.\$\/~]+\s*=\s*\([^\(\)]+\)/,
                 x=>{
                   return x.replace(/([\w\.\$\/~]+)\s*=\s*\(([^\(\)]+)\)/,'(local.set $1 $2)');
                 });
      }
      parseMap.set(k,block);
    });

    //rejoin code
    const keys = [...parseMap.keys()];
    while(keys.some(x=>(code.includes(x)))){
      parseMap.forEach((v,k)=>{
        code = code.replace(k, v);
      });
    }
    return code.replace(/\(func \$\(([^\(\)]+)param/g, x=>x
      .replace(/\(func \$\(([^\(\)]+)param/, '(func ($)$1 (param')
      .replace('($)','$'))
      .replace(/\(func \$\(([^\(\)]+)result/g, x=>x
      .replace(/\(func \$\(([^\(\)]+)result/, '(func ($)$1 (result')
      .replace('($)','$'))
      .replace(/\$\(([\w\.]+) /g,'(call ($)$1 ')
      .replace('($)','$');
  }
  
const wat = prefixParse(prefixParse(script));
writeFileSync(inputWat, Buffer.from(wat));

const wasmModule = wabt.parseWat(inputWat,wat);

  const { buffer } = wasmModule.toBinary({});

writeFileSync(outputWasm, new Buffer(buffer));



const run = async () => {
  const buffer = readFileSync("./main.wasm");
  const module = await WebAssembly.compile(buffer);
  const instance = await WebAssembly.instantiate(module);
  console.log(instance.exports.helloWorld());
};

run();


  })();