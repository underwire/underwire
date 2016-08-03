Hyperedges
---

Hyperedges provide a method to allow a normal edge to have multiple sources and/or
destinations.  These can be used to produce some very interesting graphs and are
useful for generating connections like proxy to backend connections without
having multiple edges to each backend.

Generally Hyperedges are not supported by the UI.  They will render inside of the
graph view as multiple edges and their component parts (Source and Destination Edges)
are counted as singular entities.
