/* eslint-disable no-warning-comments */

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

// [START datacatalog_taggings_bigquery_tables]
/**
 * This application demonstrates how to tag Big Query tables with 
 * Data Catalog.

 * For more information, see the README.md under /datacatalog and the
 * documentation at https://cloud.google.com/data-catalog/docs.
 */
const main = async (
    projectId = process.env.GCLOUD_PROJECT,
    tagTemplateId,
    datasetId,
    tableId
  ) => {
    // -------------------------------
    // Import required modules.
    // -------------------------------
    const { DataCatalogClient } = require('@google-cloud/datacatalog').v1;

    // Common fields.
    let request;
    let responses;

    // -------------------------------
    // Currently, Data Catalog stores metadata in the
    // us-central1 region.
    // -------------------------------
    const location = 'us-central1';

    // -------------------------------
    // Use Application Default Credentials to create a new
    // Data Catalog client. GOOGLE_APPLICATION_CREDENTIALS
    // environment variable must be set with the location
    // of a service account key file.
    // -------------------------------
    const datacatalog = new DataCatalogClient();

    // Create Fields.
    const fieldSource = {
        displayName: 'Source of data asset',
        type: {
            primitiveType: 'STRING',
        },
    };

    const fieldNumRows = {
        displayName: 'Number of rows in data asset',
        type: {
            primitiveType: 'DOUBLE',
        },
    };

    const fieldHasPII = {
        displayName: 'Has PII',
        type: {
            primitiveType: 'BOOL',
        },
    };

    const fieldPIIType = {
        displayName: 'PII type',
        type: {
            enumType: {
                allowedValues: [
                    {
                        displayName: 'EMAIL',
                    },
                    {
                        displayName: 'SOCIAL SECURITY NUMBER',
                    },
                    {
                        displayName: 'NONE',
                    },
                ],
            },
        },
    };

    const tagTemplate = {
        displayName: 'Demo Tag Template',
        fields: {
            source: fieldSource,
            num_rows: fieldNumRows,
            has_pii: fieldHasPII,
            pii_type: fieldPIIType,
        },
    };

    const tagTemplatePath = datacatalog.tagTemplatePath(
        projectId,
        location,
        tagTemplateId
    );

    // Delete any pre-existing Template with the same name.
    try {
        request = {
            name: tagTemplatePath,
            force: true,
        };
        await datacatalog.deleteTagTemplate(request);
        console.log(`Deleted template: ${tagTemplatePath}`);
    } catch (error) {
        console.log(`Cannot delete template: ${tagTemplatePath}`);
    }

    // Create the Tag Template request.
    const locationPath = datacatalog.locationPath(projectId, location);

    request = {
        parent: locationPath,
        tagTemplateId: tagTemplateId,
        tagTemplate: tagTemplate,
    };

    // Execute the request.
    responses = await datacatalog.createTagTemplate(request);
    const createdTagTemplate = responses[0];
    console.log(`Created template: ${createdTagTemplate.name}`);

    // -------------------------------
    // Lookup Data Catalog's Entry referring to the table.
    // -------------------------------
    responses = await datacatalog.lookupEntry({
        linkedResource: `//bigquery.googleapis.com/projects/` +
            `${projectId}/datasets/${datasetId}/tables/${tableId}`,
    });
    const entry = responses[0];
    console.log(`Entry name: ${entry.name}`);
    console.log(`Entry type: ${entry.type}`);
    console.log(`Linked resource: ${entry.linkedResource}`);

    // -------------------------------
    // Attach a Tag to the table.
    // -------------------------------
    const tag = {
        name: entry.name,
        template: createdTagTemplate.name,
        fields: {
            source: {
                stringValue: 'Copied from tlc_yellow_trips_2017',
            },
            num_rows: {
                doubleValue: 113496874,
            },
            has_pii: {
                boolValue: false,
            },
            pii_type: {
                enumValue: {
                    displayName: 'NONE',
                },
            },
        },
    };

    request = {
        parent: entry.name,
        tag: tag,
    };

    // Create the Tag.
    await datacatalog.createTag(request);
    console.log(`Tag created for entry: ${entry.name}`);
}

// node taggingBigQueryTables.js <organizationId> <query>
// sample values:
// organizationId = 111111000000;
// query = 'type=dataset'
main(...process.argv.slice(2));
// [END datacatalog_taggings_bigquery_tables]