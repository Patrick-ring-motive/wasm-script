
# WasmScript

WasmScript is a lightweight, experimental language and parser that allows you to write WebAssembly modules using a more C-like syntax. Instead of the typical S‑expression syntax of WAT, WasmScript supports familiar constructs such as functions, loops, conditionals, and local variable declarations with curly braces, using keywords like `function`, `let`, `set`, and `get`.

This project translates WasmScript source code into valid WebAssembly Text Format (WAT), which is then compiled into a WebAssembly binary (WASM) using the [WABT](https://github.com/WebAssembly/wabt) toolkit. The resulting WASM module is instantiated and executed from JavaScript.

## Features

- **C‑Like Syntax:** Write your WebAssembly modules using syntax reminiscent of C/JavaScript:
  - Use curly braces `{...}` to denote code blocks.
  - Use custom keywords such as `function`, `let`, `set`, and `get` for declarations and assignments.
  - Use `=` for assignments.
  - Write control flow constructs such as `while`, `for`, `if`, `else`, and `loop` in a more familiar way.
- **Automatic Conversion of Numeric Literals:**  
  Numeric literals with type annotations (e.g., `7:i32` or `3.14:f64`) are automatically converted into valid WAT expressions (e.g., `(i32.const 7)` and `(f64.const 3.14)`).
- **Incremental Parsing Approach:**  
  The parser uses a mix of regular expressions and block–extraction using unique keys (generated via UUID) to handle nested structures. It performs several passes:
  - **Local Processing:** Converts custom keywords (like `let`, `set`, and `get`) to their WAT equivalents.
  - **Block Parsing:** Iteratively replaces blocks (delimited by `{}`) with unique placeholder keys, processes these blocks (such as converting loop and function definitions to WAT syntax), and then rejoins the code.
  - **Parentheses Parsing:** A helper function (`parenParse`) further processes innermost parenthesized expressions.
- **Integration with WABT:**  
  The generated WAT code is compiled into WASM and instantiated, allowing you to call exported functions from JavaScript.

## How It Works

1. **Input Source Code:**  
   The WasmScript source (for example, in `main.w.js`) resembles a C‑like module. Example:
   ```wat
    (module
      function $main(result:i32){
          let($sum:i32);
          let($i:i32);
          $sum = (0:i32);
          $i = (7:i32);
           while(i32.eq((*$i),0:i32)){
            $sum = (i32.add((*$sum),(*$i)));
            $i = (i32.sub((*$i),1:i32));
          }
        (*$sum);
      }
      (export "helloWorld" function {$main})
    )
   ```
2. **Local Transformation:**  
   A helper function `locals()` replaces occurrences of `let`, `set`, and `get` in various forms with the corresponding WAT constructs (e.g., converting `let(` to `(local `).
3. **Block Processing:**  
   The parser uses a `while` loop that employs regex to match innermost curly-brace blocks. Each block is replaced with a unique key (generated using a UUID) and stored in a map.  
   Depending on the keyword preceding the block (e.g., `function`, `while`, `for`, `if`, etc.), different regex replacements are applied to convert it into the appropriate WAT syntax.
4. **Numeric Literal Conversion:**  
   Numeric literals with type annotations such as `7:i32`, `3.14:f32`, etc., are replaced using regex—for example:
   ```js
   script = script
       .replace(/(\d+):i(32|64)/g, "(i$2.const $1)")
       .replace(/([\d\.]+):f(32|64)/g, "(f$2.const $1)")
       .replace(/:(i|f)(32|64)/g, " $1$2");
   ```
5. **Parentheses Reassembly:**  
   After processing blocks and keywords, the `parenParse()` function re-processes nested parentheses to ensure that inner S‑expressions are correctly expanded back into the final code.
6. **Compilation and Execution:**  
   The final WAT code is written to a file, compiled into a WASM binary using WABT, and then instantiated by JavaScript. The exported function (`helloWorld`) is invoked to demonstrate the result.

## Requirements

- [Node.js](https://nodejs.org/)
- The [WABT](https://github.com/WebAssembly/wabt) package (installed via npm)
- A modern version of Node.js that supports ES modules or top‑level await (or run within an async IIFE)

## Usage

1. **Write Your WasmScript Source:**  
   Create a file (e.g., `main.w.js`) with your WasmScript code using the C‑like syntax.
2. **Run the Parser & Compiler:**  
   Execute the provided Node.js script. It reads `main.w.js`, processes it into `main.wat`, compiles it to `main.wasm`, and then instantiates the WASM module.
3. **View the Output:**  
   The JavaScript code logs the result of calling the exported function (e.g., `helloWorld()`).

For example, if your code computes a sum (in this case, it returns 42 or another computed value based on your logic), you’ll see that value printed to the console.

## Future Work

- **Enhanced Parsing:**  
  While the current implementation uses regular expressions and placeholder replacement for block parsing, the next step may be to write a dedicated parser (potentially using a stack-based approach or a parser combinator library) to handle complex nested structures and improve error handling.
- **Extended Syntax:**  
  Add support for more language constructs such as additional control-flow statements, function parameters, return types, or even custom data types.
- **Better Error Reporting:**  
  Improve diagnostics to show clear error messages when the input syntax is malformed.
- **Optimization:**  
  Fine-tune regex patterns and substitution logic to handle edge cases and improve performance for larger WasmScript sources.

## Contributing

If you’d like to contribute ideas, enhancements, or fixes:
- Fork the repository.
- Make your changes.
- Submit a pull request with a detailed description of what you’ve changed.

## License

This project is provided as-is under the MIT License. See the `LICENSE` file for details.

---

Happy coding with WasmScript, and enjoy exploring WebAssembly from a fresh, C‑like perspective!

---

Feel free to modify and adapt this `README.md` to better fit your project’s evolving story and technical details. Happy coding!