A <- 0
B <- 0

fn asciiframe() 
  b <- { }
  z <- { }
  @A <- @A + 0.05 // accessing outer scope vars with @
  @B <- @B + 0.07 // ^
  cA <- cos(A)
  sA <- sin(A)
  cB <- cos(B)
  sB <- sin(B)

  k <- 0

  while k lt 1760 
    b.k <- if k % 80 eq 79 -> "\n" else -> " "
    z.k <- 0
    k <- k + 1
  end

  j <- 0
  while j le 6.28
     ct <- cos(j)
     st <- sin(j)

    i <- 0
    while i le 6.28
       sp <- sin(i)
       cp <- cos(i)
       h <- ct + 2
       D <- 1 / (sp * h * sA + st * cA + 5)
       t<- sp * h * cA - st * sA
       x <- 40 + 30 * D * (cp * h * cB - t * sB)
       if x lt 0 -> x <- ceil(x) else -> x <- floor(x)
       y <- 12 + 15 * D * (cp * h * sB + t * cB)
       
       if y lt 0 -> y <- ceil(y) else -> y <- floor(y)

       o <- x + 80 * y
       
       N <- 8 * ((st * sA - sp * ct * cA) * cB - sp * ct * sA - st * cA - cp * ct * sB)

      N <- if N lt 0 -> ceil(N) else -> floor(N)
      
      if (y lt 22 and y ge 0 and x ge 0 and x lt 79 and (if len(z) gt o -> (D gt z.o) else -> false)) 
        z.o <- D
        ind <- if N lt 0 -> 0 else -> N
         char <- at('.,-~:;=!*#$@', ind)
        b.o <- char
      end
      i <- i + 0.02
    end
    j <- j + 0.07
  end
  out('\x1b[2J\x1b[H' + join(b, ""))
end

while true
  asciiframe()
end
