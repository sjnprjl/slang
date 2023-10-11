<p align="center">

<img width=200 height=200 alt="SLang logo" src="./assets/logo.png"/>

<p align="center">A simple toy programming language made just for fun.<p>

</p>

**Side Note: Many features are absent, and the program might break despite the
seemingly correct syntax. I created it to gain insight into the internal
workings of a compiler/interpreter.**

## 📚 Resources

These articles/videos/books helped me a lot during the building of my own
interpreter.

- [crafting interpreter](https://craftinginterpreters.com) by Robert Nystrom
- [https://compilers.iecc.com/crenshaw/](https://compilers.iecc.com/crenshaw/)
- [@tylerlaceby youtube channel](https://www.youtube.com/@tylerlaceby)

## Run on REPL

```bash
./slang # this will get you into repl
```

## Examples

> NOTE: You must install Bun runtime on your machine to make it work.

You can run example codes that are inside `./examples` directory.

```bash
bun index.ts ./examples/<source_file>
# or simply use executable
./slang ./examples/...
```

For factorial code

```bash
./slang ./examples/factorial.slang
```

Donut.c in slang

```bash
./slang ./examples/donut.slang
```
