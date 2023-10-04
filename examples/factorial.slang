fn factorial(n)
  if n le 2 -> ret n 
  
  factorial(n - 1) * n 
end

out(factorial(20))
