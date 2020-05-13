/* eslint-disable no-warning-comments */

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

// [START datacatalog_custom_entries_tag]
/**
* This application demonstrates how to perform core operations with the
* Data Catalog API.

* For more information, see the README.md and the official documentation at
* https://cloud.google.com/data-catalog/docs.
*/
const main = async (
  projectId = process.env.GCLOUD_PROJECT,
  entryGroupId,
  entryId,
  tagTemplateId
) => {

  // -------------------------------
  // Import required modules.
  // -------------------------------
  const { DataCatalogClient } = require('@google-cloud/datacatalog').v1;
  const datacatalog = new DataCatalogClient();

  // -------------------------------
  // Currently, Data Catalog stores metadata in the
  // us-central1 region.
  // -------------------------------
  const location = "us-central1";

  // -------------------------------
  // 1. Environment cleanup: delete pre-existing data.
  // -------------------------------
  // Delete any pre-existing Entry with the same name
  // that will be used in step 3.
  try {
    const entryName = datacatalog.entryPath(projectId, location, entryGroupId, entryId);
    await datacatalog.deleteEntry({ name: entryName });
    console.log(`Deleted Entry: ${entryName}`);
  } catch (err) {
    console.log('Entry does not exist.');
  }

  // Delete any pre-existing Entry Group with the same name
  // that will be used in step 2.
  try {
    const entryGroupName = datacatalog.entryGroupPath(projectId, location, entryGroupId);
    await datacatalog.deleteEntryGroup({ name: entryGroupName });
    console.log(`Deleted Entry Group: ${entryGroupName}`);
  } catch (err) {
    console.log('Entry Group does not exist.');
  }

  // Delete any pre-existing Template with the same name
  // that will be used in step 4.
  const tagTemplateName = datacatalog.tagTemplatePath(
    projectId,
    location,
    tagTemplateId,
  );

  try {
    const tagTemplateRequest = {
      name: tagTemplateName,
      force: true,
    };
    await datacatalog.deleteTagTemplate(tagTemplateRequest);
    console.log(`Deleted template: ${tagTemplateName}`);
  } catch (error) {
    console.log(`Cannot delete template: ${tagTemplateName}`);
  }

  // -------------------------------
  // 2. Create an Entry Group.
  // -------------------------------
  // Construct the EntryGroup for the EntryGroup request.
  const entryGroup = {
    displayName: 'My awesome Entry Group',
    description: 'This Entry Group represents an external system',
  }

  // Construct the EntryGroup request to be sent by the client.
  const entryGroupRequest = {
    parent: datacatalog.locationPath(projectId, location),
    entryGroupId: entryGroupId,
    entryGroup: entryGroup,
  };

  // Use the client to send the API request.
  const [createdEntryGroup] = await datacatalog.createEntryGroup(entryGroupRequest)
  console.log(`Created entry group: ${createdEntryGroup.name}`);

  // -------------------------------
  // 3. Create an Entry.
  // -------------------------------
  // Construct the Entry for the Entry request.
  const entry = {
    userSpecifiedSystem: 'onprem_data_system',
    userSpecifiedType: 'onprem_data_asset',
    displayName: 'My awesome data asset',
    description: 'This data asset is managed by an external system.',
    linkedResource: '//my-onprem-server.com/dataAssets/my-awesome-data-asset',
    schema: {
      columns: [
        {
          column: 'first_column',
          description: 'This columns consists of ....',
          mode: 'NULLABLE',
          type: 'STRING',
        },
        {
          column: 'second_column',
          description: 'This columns consists of ....',
          mode: 'NULLABLE',
          type: 'DOUBLE',
        }
      ],
    },
  };

  // Construct the Entry request to be sent by the client.
  const entryRequest = {
    parent: datacatalog.entryGroupPath(projectId, location, entryGroupId),
    entryId: entryId,
    entry: entry,
  };

  // Use the client to send the API request.
  const [createdEntry] = await datacatalog.createEntry(entryRequest)
  console.log('Created entry:');
  console.log(createdEntry);

  // -------------------------------
  // 4. Create a Tag Template.
  // For more field types, including ENUM, please refer to
  // https://cloud.google.com/data-catalog/docs/quickstarts/quickstart-search-tag#data-catalog-quickstart-nodejs.
  // -------------------------------
  const fieldSource = {
    displayName: 'Source of data asset',
    type: {
      primitiveType: 'STRING',
    },
  };

  const tagTemplate = {
    displayName: 'Demo Tag Template',
    fields: {
      source: fieldSource,
    },
  };

  const tagTemplateRequest = {
    parent: datacatalog.locationPath(projectId, location),
    tagTemplateId: tagTemplateId,
    tagTemplate: tagTemplate,
  };

  // Use the client to send the API request.
  const [createdTagTemplate] = await datacatalog.createTagTemplate(tagTemplateRequest);
  console.log(`Created template: ${createdTagTemplate.name}`);

  // -------------------------------
  // 5. Attach a Tag to the custom Entry.
  // -------------------------------
  const tag = {
    template: createdTagTemplate.name,
    fields: {
      source: {
        stringValue: 'On-premises system name',
      },
    },
  };

  const tagRequest = {
    parent: createdEntry.name,
    tag: tag,
  };

  // Use the client to send the API request.
  const [createdTag] = await datacatalog.createTag(tagRequest);
  console.log(`Created tag: ${createdTag.name}`);

};

// TODO: Change these values before running the sample
// node createCustomEntry.js my-project onprem_entry_group onprem_entry_id onprem_tag_template
main(...process.argv.slice(2));
// [END datacatalog_custom_entries_tag]

