# gha-honeycomb-marker
Lightweight GitHub Action that lists, creates, updates, and deletes Honeycomb markers

This action allows to perform CRUD operations on [Honeycomb Markers API](https://docs.honeycomb.io/api/markers/) in an easy and user friendly manner.

Development in progress. Supported operations:

- [x] Create
- [ ] Read
- [ ] Update
- [ ] Delete

## Usage

### Create a single marker

```
- name: Honeycomb Start Marker
uses: pawelros/gha-honeycomb-marker@master
with:
    api-key: ${{secrets.HONEYCOMB_API_KEY}}
    dataset: 'my-dataset'
    operation: 'create'
    type: 'deployment'
    message: 'Hello, this is pawelros testing markers!'
    url: "${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"
```

Action is written in JavaScript as it simplifies the action code and executes faster than a Docker container action, see more [here](https://docs.github.com/en/actions/creating-actions/about-custom-actions#javascript-actions).