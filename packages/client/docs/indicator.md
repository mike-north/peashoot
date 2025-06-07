# Interactions
Sometimes items that are placed on the grid have interactions with each other when placed adjacent (either horizontally, vertically or diagonally) which must be modeled as directional "helpful", "harmful" or "neutral". It's possible for two items to be mutually beneficial, which can be modeled as two direcional effects, both "helpful", one in either direction. These effects are properties of the items on the grid. Whether this interaction is _realized_ depends on the placement of items on the grid (e.g. if items with an interaction are placed next to each other)


# Indicators
An `Indicator` is the visual representation of `Interaction`s that are _being realized_ due to the adjacency of items on the grid. These can appear centered along shared edges between items on the grid (in the case of Interactions in the horizontal or vertical direction) or on corners between diagonally connected items that have an Interaction. Indicators need to have a tooltip, providing additional information about all interactions happening at that location. For example, an Indicator on a shared corner where 4 items meet on the grid needs to be able to model information about potentially two diagonal interactions. 


Visually, Indicators present as a group of 25% sectors of a circle, where each sector can be independently colored. Hovering over the circular area that encloses the group of sectors should reveal a tooltip that provide details about the interactions that this visual indicator represents.

Sometimes indicators are shown at the intersection of four distinct items (the intersection between grid lines where A, B, C and D meet below). In this case, the circle being entirely filled in would mean that this indicator models some interaction information that involves all of `{ A, B, C, D }`
```
Item A    |     Item B
          |
----------🔴-----------
          |          
Item C    |     Item D
````

Sometimes it's shown at the midpoint of two vertically or horizontally adjacent items
```
Item A    |
          |
----🔴----|-----------
          |          
Item B    🟢  Item C
          |
````

## Colors
Red = "harmful"
Green = "helpful"
Blue = "neutral"