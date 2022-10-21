# gha-honeycomb-marker
Lightweight GitHub Action that lists, creates, updates, and deletes Honeycomb markers

This action allows to perform CRUD operations on [Honeycomb Markers API](https://docs.honeycomb.io/api/markers/) in an easy and user friendly manner.

Development in progress. Supported operations:

- [x] Create
- [ ] Read
- [x] Update
- [ ] Delete

## Usage

### Create a single marker

```
    - name: Honeycomb Start Marker
      uses: pawelros/gha-honeycomb-marker@v1.0.0 # please specify a version tag or sha
      with:
        api-key: ${{secrets.HONEYCOMB_API_KEY}}
        dataset: 'my-dataset'
        operation: 'create'
        type: 'deployment'
        message: 'Test marker!'
        url: "${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"
```

### Create a marker representing a time range, such as a 5 minute deploy

```
    - name: Honeycomb Start Marker
      id: start_marker
      uses: pawelros/gha-honeycomb-marker@v1.0.0
      with:
        api-key: ${{secrets.HONEYCOMB_API_KEY}}
        dataset: 'my-dataset'
        operation: 'create'
        type: 'deployment'
        message: "Deployment #${{ github.run_id }}"
        url: "${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"
    - name: Deploy my great app
      run: |
        echo "Deployment in progress..."
        sleep 300s
        echo "DEPLOY_DONE_TIMESTAMP=$(date +'%s')" >> $GITHUB_ENV
        echo "Deployment has finished."
      shell: bash
    - name: Honeycomb End Marker
      if: always()
      uses: pawelros/gha-honeycomb-marker@v1.0.0
      with:
        api-key: ${{secrets.HONEYCOMB_API_KEY}}
        operation: 'update'
        id: ${{steps.start_marker.outputs.id}}
        dataset: 'my-dataset'
        end-time: ${{env.DEPLOY_DONE_TIMESTAMP}}
```


### A more advanced deployment marker with type dependent on build success (or failure)

```
    - name: Honeycomb Start Marker
      id: start_marker
      uses: pawelros/gha-honeycomb-marker@v1.0.0
      with:
        api-key: ${{secrets.HONEYCOMB_API_KEY}}
        dataset: "my-dataset"
        operation: "create"
        type: "deployment"
        message: "Deployment #${{ github.run_id }}"
        url: "${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"
    - name: Deploy my great app
      run: |
        echo "Deployment in progress..."
        sleep 300s
        echo "DEPLOY_DONE_TIMESTAMP=$(date +'%s')" >> $GITHUB_ENV
        echo "Deployment has finished."
      shell: bash
    - name: Honeycomb End Marker
      if: always()
      uses: pawelros/gha-honeycomb-marker@v1.0.0
      with:
        api-key: ${{secrets.HONEYCOMB_API_KEY}}
        operation: "update"
        id: ${{steps.start_marker.outputs.id}}
        dataset: "my-dataset"
        type: ${{job.status == 'success' && 'deployment_ok' || deployment_failed }}"
        message: ${{job.status == 'success' && format('Deployment {0} [OK]', github.run_id) || format('Deployment {0} [FAILED]', github.run_id)}}"
        end-time: ${{env.DEPLOY_DONE_TIMESTAMP}}
```

Action is written in JavaScript as it simplifies the action code and executes faster than a Docker container action, see more [here](https://docs.github.com/en/actions/creating-actions/about-custom-actions#javascript-actions).