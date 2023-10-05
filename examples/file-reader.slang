fn read_file(path, cb_fn)
// stdlib read function
  out(cb_fn)
  read(path, cb_fn)
end

fn reader(text)
  out(text)
end


read_file('./index.ts', reader)

