(module
  function (result:i32){
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
  (export "helloWorld" function {0})
)