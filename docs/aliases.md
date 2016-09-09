Aliases
===

Implemented by Anonym

**Problem:**
When scanning logs we will have entries with things like URL's in them. We want these URL's to map to existing Nodes within the system.

EG: http://myapi.com/api/something/id

Should map to:

MyAPI

Tag Definition
---

Tags will be defined using plain strings with embedded regular expressions (maybe?) in them. These expressions will be identified by being wrapped with {}'s. Escaping would be done by doubling the curly braces (EG: {{some value}} would evaluate as {some value}).

Example from above would be defined as:
http://myapi.com/api/something/{[^\/?]+}

Naive Approach
---

Compile down the Alias Definition into a basic regular expression.  Keep a list
in memory of all of these expressions, scan through through every time, and return
the first one that matches.

Trie Approach
---

Compile down the Alias Definition into a hybrid trie that consists of both
static text nodes (matched exactly) and regular expression nodes.  Scan through
the trie, find the best match, and return it.
