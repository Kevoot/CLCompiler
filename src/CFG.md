Here is an LL(1) grammar for the calculator language, extended with if
and do/check statements. 
Here the new nonterminal 
R is meant to suggest
a “relation.” As in C, a value of 0 is taken to be false; anything else
is true. 
This grammar has been modified to remove do while in favor of while, while
using more common syntax for bracket usage in if and while bodies.

P  -> SL $$
SL -> S SL | e
S  -> id := R | read id | write R | if R { SL } | while R { SL }
R  -> E ET
E  -> T TT
T  -> F FT
F  -> ( R ) | id | lit
ET -> ro E | e
TT -> ao T TT | e
FT -> mo F FT | e
ro -> == | != | < | > | <= | >=
ao -> + | -
mo -> * | /
