// array literals 

array <- {2,3,4,nul,"string"}

out(array)


arr_in_depth <- { { { 2 } } }

out( ( ( arr_in_depth.0 ).0 ).0 ) // yup! need to do this way right now because number literal is either floating point or number!
