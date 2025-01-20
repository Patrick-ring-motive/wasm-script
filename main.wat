(module
  (func (result i32)
      (local $sum i32)
      (local $i i32)
      (local.set $sum (i32.const 0))
      (local.set $i (i32.const 7))
           (block $exit86611c06449448f39967a8009863b712
            (loop $while86611c06449448f39967a8009863b712
              (br_if $exit86611c06449448f39967a8009863b712 (i32.eq (local.get $i) (i32.const 0)))
        (local.set $sum (i32.add (local.get $sum) (local.get $i)))
        (local.set $i (i32.sub (local.get $i) (i32.const 1)))
      (br $while86611c06449448f39967a8009863b712)
            )
          )
    (local.get $sum)
  )
  (export "helloWorld" (func 0))
)