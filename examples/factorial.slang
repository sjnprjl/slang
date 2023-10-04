fn factorial(n)
  if n le 2 -> ret n 
  
  ret factorial(n - 1) * n 
end

out(factorial(2))
