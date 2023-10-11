fn count(n)
  if n gt 1 -> count(n - 1)
  out(n)
end

count(10)
