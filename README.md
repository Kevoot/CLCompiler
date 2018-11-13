# CLCompiler
===

Try the [Demo](https://kevoot.github.io/GUI_Course/pda/index.html);

## What am I even looking at?
A compiler (not really, a transpiler) from a long-dead calculator language to javascript. 
The scanner and parser were originally implemented in C++ for my Organization of Programming Languages.
This was converted to Typescript and uses JQuery, Bootstrap, and visjs to display the results of creating
a syntax tree. From there, functions are run on each given node type to generate a string of equivalent
javascript code.

Once we create this string, it is passed to a function constructor and then run. 

Users beware: There is no protection against infinite loops. If you write one, prepare to force close the page.