(module
  (func (result i32)
      (local $sum i32)
      (local $i i32)
      (local.set $sum (i32.const 0))
      (local.set $i (i32.const 7))
           (block $exit081a1166baad44f6bf82dba53ea2ba8a
            (loop $while081a1166baad44f6bf82dba53ea2ba8a
              (br_if $exit081a1166baad44f6bf82dba53ea2ba8a (i32.eq (local.get $i) (i32.const 0)))
        (local.set $sum (i32.add (local.get $sum) (local.get $i)))
        (local.set $i (i32.sub (local.get $i) (i32.const 1)))
      (br $while081a1166baad44f6bf82dba53ea2ba8a)
            )
          )
    (local.get $sum)
  )
  (export "helloWorld" (func 0))
)