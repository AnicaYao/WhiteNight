# Quickdraw API Server

Work in progress. Adapted and simplified from
<https://github.com/googlecreativelab/quickdraw-component/blob/master/api/README.md>,
to work with the
[quickdraw_dataset](https://console.cloud.google.com/storage/browser/quickdraw_dataset)
bucket.

## Installation

`npm install`

Create a `config.json` file replacing the values below:

```json
{
  "projectId": "YOUR_PROJECT_ID",
  "bucketId": "GCS_BUCKET_ID"
}
```

## Usage

`npm start`

Fetch from, for example, <http://localhost:8080/drawing/aircraft%20carrier>,
where `aircraft%20carrier` is the
[URL-encoded](https://storage.cloud.google.com/nyush-quickdraw-data/full/simplified/aircraft%20carrier.ndjson)
category name (spaces are replaced by `%20`).

## To Do

Add back the `is_animated` query parameter.

## References

- <https://github.com/googlecreativelab/quickdraw-dataset>
- <https://console.cloud.google.com/storage/browser/quickdraw_dataset>

## License

Apache
