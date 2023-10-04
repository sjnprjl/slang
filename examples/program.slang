a <- 10

valid <- true


// variable assignment

foo <- nul

// if expression

// also to access outer scope variable prefix identifier with `@`

if valid -> @a <- 100


// comment


// this works too:)

foo <- if if if if true -> 10 -> 20 -> 30 -> 40

bar <- ( if ( if ( if ( if true -> 10 ) -> 20) -> 30 ) -> 40  ) // equiv.

out(foo eq bar)
