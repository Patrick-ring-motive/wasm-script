(module
  function $add(param $x:i32) (param $y:i32) (result:i32){
    i32.add((*$x),(*$y));
  }

  function $caller (result:i32){
    $add(3:i32,4:i32);
  }

  (export "helloWorld" (func $caller))
)