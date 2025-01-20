(module
  function (result i32){
      let($sum:i32);
      let($i:i32);
      set($sum,0:i32);
      set($i,7:i32);
       while(i32.eq(get($i),0:i32)){
        set($sum,i32.add(get($sum),get($i)));
        set($i,i32.sub(get($i),1:i32));
      }
    get($sum)
  }
  (export "helloWorld" function {0})
)