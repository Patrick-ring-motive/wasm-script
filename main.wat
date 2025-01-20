(module
  (func (result i32)
      (local $sum i32)
      (local $i i32)
      (local.set $sum (i32.const 0))
      (local.set $i (i32.const 7))
           (block $exit091d6128bc9d4e5080fcdc14309b28f4
            (loop $while091d6128bc9d4e5080fcdc14309b28f4
              (br_if $exit091d6128bc9d4e5080fcdc14309b28f4 (i32.eq (local.get $i) (i32.const 0)))
        (local.set $sum (i32.add (local.get $sum) (local.get $i)))
        (local.set $i (i32.sub (local.get $i) (i32.const 1)))
      (br $while091d6128bc9d4e5080fcdc14309b28f4)
            )
          )
    (local.get $sum)
  )
  (export "helloWorld" (func 0))
)