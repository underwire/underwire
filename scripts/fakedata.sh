#!/bin/bash
curl -X POST \
  -H "Content-Type: application/json" \
  http://localhost:8080/api/graph/nodes \
  --data '[
    {
      "name": "Item 1"
    },
    {
      "name": "Item 2",
      "shape": "cloud"
    },
    {
      "name": "Item 3"
    },
    {
      "name": "Item 4"
    },
    {
      "name": "Item 5"
    }
  ]'

  curl -X POST \
    -H "Content-Type: application/json" \
    http://localhost:8080/api/graph/edges \
    --data '[
      {
        "from": "Item 1",
        "to": "Item 2"
      },
      {
        "from": "Item 1",
        "to": "Item 4"
      },
      {
        "from": "Item 3",
        "to": "Item 1"
      },
      {
        "from": "Item 4",
        "to": "Item 5"
      },
      {
        "from": "Item 2",
        "to": "Item 1"
      },
      {
        "from": "Item 5",
        "to": "Item 1"
      }
    ]'
