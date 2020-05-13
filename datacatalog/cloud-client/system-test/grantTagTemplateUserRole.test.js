// Copyright 2020 Google LLC
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
// Use unique id to avoid conflicts between concurrent test runs
const tagTemplateId = `test_template_${uuid.v4().substr(0, 8)}`;
const location = 'us-central1';

const { DataCatalogClient } = require('@google-cloud/datacatalog').v1;
const datacatalog = new DataCatalogClient();

before(() => {
  assert(
    process.env.GCLOUD_PROJECT,
    'Must set GCLOUD_PROJECT environment variable!'
  );
  assert(
    process.env.GOOGLE_APPLICATION_CREDENTIALS,
    'Must set GOOGLE_APPLICATION_CREDENTIALS environment variable!'
  );
  assert(
    process.env.GCP_USER_EMAIL,
    'Must set GCP_USER_EMAIL environment variable!'
  );
});

describe('grantTagTemplateUserRole', () => {
  before(async () => {
    // Must create a Tag Template first.
    const tagTemplate = {
      displayName: 'Test Tag Template',
      fields: {
        has_pii: {
          displayName: 'Has PII',
          type: {
            primitiveType: 'BOOL',
          },
        },
      },
    };

    const request = {
      parent: datacatalog.locationPath(projectId, location),
      tagTemplateId: tagTemplateId,
      tagTemplate: tagTemplate,
    };

    await datacatalog.createTagTemplate(request);
  });

  after(async () => {
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

  it('should grant member tag template user role', (done) => {
    const memberId = `user:${process.env.GCP_USER_EMAIL}`;
    exec(
      `node grantTagTemplateUserRole.js ${projectId} ${tagTemplateId} ${memberId}`,
      { cwd },
      (err, stdout) => {
        assert.ok(
          stdout.includes(
            memberId
          )
        );
        assert.ok(
          stdout.includes(
            `roles/datacatalog.tagTemplateUser`
          )
        );
        done();
      }
    );
  });
});
