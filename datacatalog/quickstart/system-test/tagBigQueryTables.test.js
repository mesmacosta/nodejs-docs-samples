// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const path = require('path');
const assert = require('assert');
const uuid = require('uuid');
const cwd = path.join(__dirname, '..');
const { exec } = require('child_process');

const projectId = process.env.GCLOUD_PROJECT;
const location = 'us-central1';
// Use unique id to avoid conflicts between concurrent test runs
const tagTemplateId = `test_template_${uuid.v4().substr(0, 8)}`;
const datasetId = `test_dataset_${uuid.v4().substr(0, 8)}`;
const tableId = `test_table_${uuid.v4().substr(0, 8)}`;
const { BigQuery } = require('@google-cloud/bigquery');
const bigquery = new BigQuery();

const { DataCatalogClient } = require('@google-cloud/datacatalog').v1beta1;
const datacatalog = new DataCatalogClient();

before(() => {
  before(async () => {
    assert(
      process.env.GCLOUD_PROJECT,
      `Must set GCLOUD_PROJECT environment variable!`
    );
    assert(
      process.env.GOOGLE_APPLICATION_CREDENTIALS,
      `Must set GOOGLE_APPLICATION_CREDENTIALS environment variable!`
    );

    await bigquery.createDataset(datasetId);

    const options = {
      schema: 'Name:string, Age:integer, Weight:float, IsMagic:boolean',
      location: 'US',
    };

    // Create a new table in the dataset
    await bigquery
      .dataset(datasetId)
      .createTable(tableId, options);
  });
});
after(async () => {
  // Delete test dataset.
  await bigquery
    .dataset(datasetId)
    .delete({ force: true })
    .catch(console.warn);

  // Delete test template.
  const tagTemplateRequest = {
    name: datacatalog.tagTemplatePath(
      projectId,
      location,
      tagTemplateId
    ),
    force: true,
  };

  await datacatalog.deleteTagTemplate(tagTemplateRequest);
});

describe('taggingBigQueryTables', () => {
  it('should tag a BigQuery Table', (done) => {
    const expectedLinkedResource = `//bigquery.googleapis.com/projects/${projectId}/datasets/${datasetId}/tables/${tableId}`;
    const expectedTagMessage = `Tag created for entry: projects/${projectId}/locations/us/entryGroups/@bigquery/entries`;
    exec(
      `node tagBigQueryTables.js ${projectId} ${tagTemplateId} ${datasetId} ${tableId}`,
      { cwd },
      (err, stdout) => {
        assert.ok(stdout.includes(expectedLinkedResource));
        assert.ok(stdout.includes(expectedTagMessage));
        done();
      }
    );
  });
});
