Underwire Reports
---

**NOTE:** This is a work in progress, a thinking document, nothing more.

  * Implemented via a plugin
  * Self registering to Reports page

API
---

Modifies "Page" in configuration.

```js
ParamTypes = OneOf('Node', 'Edge', 'Date', 'Time', 'String', 'Choice(option, option)', ...???...)

PAGES: [
  {
    name: 'My Custom Report',
    route: '/reports/myreport/{param:Node}/{param:Date}',
    description: 'Some description of the report',
    source: './reports/myreport.jsx',
  },
],
```
